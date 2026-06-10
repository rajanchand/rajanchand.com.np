"use client";

import { useEffect, useState } from "react";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export function BackgroundOrbs() {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    const colors = [
      "rgba(96, 165, 250, 0.08)",  // blue
      "rgba(139, 92, 246, 0.06)",   // violet
      "rgba(59, 130, 246, 0.07)",   // indigo
      "rgba(34, 211, 238, 0.05)",   // cyan
    ];

    const generated: Orb[] = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 10 + Math.random() * 80,
      size: 200 + Math.random() * 300,
      color: colors[i % colors.length],
      duration: 18 + Math.random() * 12,
      delay: i * 2.5,
    }));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrbs(generated);
  }, []);

  if (orbs.length === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            animation: `orb-drift ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
