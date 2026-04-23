"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  isText?: boolean;
  duration?: number;
}

export function AnimatedCounter({
  end,
  suffix = "",
  isText = false,
  duration = 2000,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            if (isText) {
              setCount(end);
              return;
            }
            const startTime = Date.now();
            const animate = () => {
              const now = Date.now();
              const progress = Math.min((now - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.floor(eased * end));
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, isText]);

  if (isText) {
    return (
      <span ref={ref} className="text-3xl md:text-4xl font-extrabold gradient-text font-[family-name:var(--font-outfit)]">
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className="text-3xl md:text-4xl font-extrabold gradient-text font-[family-name:var(--font-outfit)]">
      {count}
      {suffix}
    </span>
  );
}
