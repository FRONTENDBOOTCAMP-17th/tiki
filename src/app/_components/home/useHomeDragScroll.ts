"use client";

import { useRef } from "react";

const CLICK_SUPPRESS_THRESHOLD_PX = 5;

export function useHomeDragScroll<T extends HTMLElement>() {
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

  function onClickCapture(e: React.MouseEvent) {
    if (Math.abs(draggedDistance.current) > CLICK_SUPPRESS_THRESHOLD_PX) {
      e.preventDefault();
      e.stopPropagation();
    }
    draggedDistance.current = 0;
  }

  // 링크/이미지 브라우저 기본 드래그(고스트 이미지)를 없애는 기능이라고 합니다..!
  function onDragStart(e: React.DragEvent) {
    e.preventDefault();
  }

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp: endDrag,
    onMouseLeave: endDrag,
    onClickCapture,
    onDragStart,
  };
}
