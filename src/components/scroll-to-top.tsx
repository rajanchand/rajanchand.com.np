"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 w-12 h-12 rounded-2xl bg-[var(--primary)] text-white shadow-lg shadow-[var(--glow-primary)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform touch-manipulation md:bottom-8 md:right-8"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
