"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";
import { BackgroundOrbs } from "@/components/background-orbs";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } else {
        setError(data.error || "Incorrect password");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative flex items-center justify-center p-4 overflow-hidden">
      <BackgroundOrbs />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[var(--glass-border)]">
          {/* Decorative radial gradient glow */}
          <div className="absolute -top-1/2 -right-1/4 w-[300px] h-[300px] bg-[var(--primary)] rounded-full opacity-[0.05] blur-[80px] pointer-events-none" />

          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_var(--glow-primary)]">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold font-[family-name:var(--font-outfit)] tracking-tight">
              Admin Portal
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Rajan Prakash Chand Portfolio CMS
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="admin-pass" className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">
                Enter Password
              </label>
              <input
                id="admin-pass"
                type="password"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-sm text-rose-500">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-sm text-emerald-500">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Access Granted! Redirecting...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_35px_var(--glow-primary)] text-white font-semibold rounded-xl text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Note */}
          <div className="text-center mt-8 text-xs text-[var(--muted-foreground)]">
            Secured and private connection.
          </div>
        </div>
      </div>
    </main>
  );
}
