"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="min-w-11 min-h-11 w-11 h-11 rounded-xl flex items-center justify-center glass touch-manipulation"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="min-w-11 min-h-11 w-11 h-11 rounded-xl flex items-center justify-center glass hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--accent)]" />
      )}
    </button>
  );
}
