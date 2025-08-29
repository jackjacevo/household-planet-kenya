'use client';

import { useMemo, useState, useEffect, useRef } from 'react';

interface VirtualizedTableProps<T> {
  data: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export default function VirtualizedTable<T>({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      data.length - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(data.length - 1, visibleEnd + overscan);

    return {
      visibleItems: data.slice(start, end + 1).map((item, index) => ({
        item,
        index: start + index
      })),
      totalHeight: data.length * itemHeight,
      offsetY: start * itemHeight
    };
  }, [data, itemHeight, scrollTop, containerHeight, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Only render virtualization if we have many items
  if (data.length <= 50) {
    return (
      <div className="overflow-auto" style={{ height: containerHeight }}>
        {data.map((item, index) => renderItem(item, index))}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}