"use client";

import { useEffect, useState } from "react";

type CounterProps = {
  value: number;
  duration?: number;
  prefix?: string;
};

export function Counter({ value, duration = 1500, prefix = "" }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(value * progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{prefix}{Math.round(count).toLocaleString()}</span>;
}
