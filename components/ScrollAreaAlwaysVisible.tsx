"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps content in a scrollable area with an always-visible custom scrollbar
 * (avoids OS overlay scrollbars that hide when idle).
 */
export function ScrollAreaAlwaysVisible({ children, className = "" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbStyle, setThumbStyle] = useState({
    height: "0%",
    top: "0%",
  });
  const [showThumb, setShowThumb] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight <= clientHeight) {
      setShowThumb(false);
      return;
    }
    setShowThumb(true);
    const thumbRatio = clientHeight / scrollHeight;
    const thumbHeightPct = Math.max(10, Math.round(thumbRatio * 100));
    const maxScroll = scrollHeight - clientHeight;
    const scrollPct = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const topPct = (1 - thumbRatio) * scrollPct * 100;
    setThumbStyle({
      height: `${thumbHeightPct}%`,
      top: `${topPct}%`,
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateThumb();
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    el.addEventListener("scroll", updateThumb);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateThumb);
    };
  }, [updateThumb, children]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const track = e.currentTarget;
    if (!el || !showThumb) return;
    const rect = track.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = y / rect.height;
    const maxScroll = el.scrollHeight - el.clientHeight;
    el.scrollTop = pct * maxScroll;
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = scrollRef.current.scrollTop;
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      const delta = e.clientY - dragStartY.current;
      const scale = el.scrollHeight / el.clientHeight;
      el.scrollTop = dragStartScrollTop.current + delta * scale;
      dragStartScrollTop.current = el.scrollTop;
      dragStartY.current = e.clientY;
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  return (
    <div className={`flex min-h-0 ${className}`}>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      {showThumb && (
        <div
          className="relative w-3 shrink-0 self-stretch cursor-pointer rounded-md bg-surface-2 py-0.5"
          onClick={handleTrackClick}
          role="scrollbar"
          aria-orientation="vertical"
        >
          <div
            className="absolute left-0 right-0 min-h-[24px] w-full min-w-[10px] rounded-md border border-border bg-muted/60 transition-colors hover:bg-muted"
            style={{
              height: thumbStyle.height,
              top: thumbStyle.top,
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      )}
    </div>
  );
}
