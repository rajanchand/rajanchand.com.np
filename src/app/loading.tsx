import { BackgroundOrbs } from "@/components/background-orbs";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative overflow-hidden">
      <BackgroundOrbs />
      <div className="text-center relative z-10 space-y-4 select-none">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] animate-pulse opacity-20 blur-xl" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-[0_0_30px_var(--glow-primary)]">
            <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--muted-foreground)] font-mono">Loading telemetry...</p>
      </div>
    </div>
  );
}
