"use client";

import { useRef } from "react";

const SWIPE_THRESHOLD_PX = 50; // 이 이상 움직여야 슬라이드 전환
const CLICK_SUPPRESS_THRESHOLD_PX = 10; // 이 이상 움직였으면 클릭(이동)으로 처리하지 않음

interface SwipeHandlers {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

// 캐러셀 슬라이드를 좌우로 드래그(마우스/터치 공통, Pointer Events)해서 넘기는 훅.
// 드래그가 있었으면 클릭(=링크 이동)도 같이 막아준다.
export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const startX = useRef<number | null>(null);
  const lastDeltaX = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    lastDeltaX.current = 0;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current == null) return;
    lastDeltaX.current = e.clientX - startX.current;
  }

  function onPointerUp() {
    if (startX.current == null) return;
    startX.current = null;

    if (lastDeltaX.current <= -SWIPE_THRESHOLD_PX) onSwipeLeft();
    else if (lastDeltaX.current >= SWIPE_THRESHOLD_PX) onSwipeRight();
  }

  // 드래그 중 클릭이 함께 발생하는 것을 막기 위해 캡처 단계에서 가로채 취소한다.
  function onClickCapture(e: React.MouseEvent) {
    if (Math.abs(lastDeltaX.current) > CLICK_SUPPRESS_THRESHOLD_PX) {
      e.preventDefault();
      e.stopPropagation();
    }
    lastDeltaX.current = 0;
  }

  return { onPointerDown, onPointerMove, onPointerUp, onClickCapture };
}
