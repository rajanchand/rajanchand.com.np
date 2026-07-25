"use client";

// Deterministic static orb definitions to guarantee instant SSR paint without client re-render delay
const ORB_CONFIGS = [
  { id: 1, x: 20, y: 15, size: 360, color: "rgba(96, 165, 250, 0.08)", duration: 22, delay: 0 },
  { id: 2, x: 75, y: 35, size: 280, color: "rgba(139, 92, 246, 0.06)", duration: 28, delay: 2 },
  { id: 3, x: 40, y: 70, size: 320, color: "rgba(59, 130, 246, 0.07)", duration: 25, delay: 4 },
];

export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {ORB_CONFIGS.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full transform-gpu"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            transform: "translate3d(0,0,0)",
            animation: `orb-drift ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

