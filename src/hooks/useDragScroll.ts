"use client";

import { useRef } from "react";

const CLICK_SUPPRESS_THRESHOLD_PX = 5;

// 가로 스크롤 목록을 데스크탑에서 마우스로 드래그해 스크롤할 수 있게 해주는 훅.
// 모바일 터치 스크롤은 overflow-x-auto가 기본으로 처리하므로 별도 구현이 필요 없다.
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const dragState = useRef({ isDragging: false, startX: 0, startScrollLeft: 0 });
  const draggedDistance = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
    };
    draggedDistance.current = 0;
  }

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el || !dragState.current.isDragging) return;
    const delta = e.clientX - dragState.current.startX;
    draggedDistance.current = delta;
    el.scrollLeft = dragState.current.startScrollLeft - delta;
  }

  function endDrag() {
    dragState.current.isDragging = false;
  }

  // 드래그가 있었으면 그 끝에 발생하는 클릭(=카드 이동)을 막는다.
  function onClickCapture(e: React.MouseEvent) {
    if (Math.abs(draggedDistance.current) > CLICK_SUPPRESS_THRESHOLD_PX) {
      e.preventDefault();
      e.stopPropagation();
    }
    draggedDistance.current = 0;
  }

  // 가로 스크롤만 있는 목록 위에서는 마우스 휠(세로)도 가로 스크롤로 바꿔준다.
  function onWheel(e: React.WheelEvent) {
    const el = ref.current;
    if (!el) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // 트랙패드 가로 스와이프는 기본 동작 유지

    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp: endDrag,
    onMouseLeave: endDrag,
    onClickCapture,
    onWheel,
  };
}
