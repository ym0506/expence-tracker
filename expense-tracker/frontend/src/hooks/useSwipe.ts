import { useState, useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeHandlers) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setIsSwiping(false);
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startX.current || !startY.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const deltaX = Math.abs(currentX - startX.current);
    const deltaY = Math.abs(currentY - startY.current);
    
    // 가로 스와이프가 세로 스와이프보다 큰 경우에만 처리
    if (deltaX > deltaY && deltaX > 10) {
      setIsSwiping(true);
      e.preventDefault(); // 스크롤 방지
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!startX.current || !isSwiping) return;
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX.current;
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setIsSwiping(false);
    startX.current = 0;
    startY.current = 0;
  }, [isSwiping, onSwipeLeft, onSwipeRight, threshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping
  };
};