"use client";

import { useEffect } from "react";
import { BackgroundOrbs } from "@/components/background-orbs";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundOrbs />
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-10 text-center relative overflow-hidden border border-[var(--glass-border)] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center mx-auto mb-6 text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-xs text-[var(--muted-foreground)] mb-8 max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred while loading this page. Our security logs have registered this event.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_25px_var(--glow-primary)] text-white text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
