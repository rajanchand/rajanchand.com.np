"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldAlert, CheckCircle, KeyRound, Mail, ArrowLeft, RefreshCw, User, Database, ShieldCheck, Home } from "lucide-react";
import { BackgroundOrbs } from "@/components/background-orbs";

export default function AdminLogin() {
  const [step, setStep] = useState<"password" | "otp">("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to verify credentials");
        setLoading(false);
        return;
      }

      if (data.success && data.requireOtp) {
        setStep("otp");
        setInfoMsg(
          data.hasResendKey === false
            ? "OTP generated, but email delivery is not configured (RESEND_API_KEY missing). In development the code is printed to the server console; in production set the key to receive it by email."
            : `A 6-digit OTP code has been sent to ${data.email || "your email"}.`
        );
        setLoading(false);
      } else if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } else {
        setError(data.error || "Incorrect username or password");
        setLoading(false);
      }
    } catch {
      setError("An error occurred. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to verify the code");
        setLoading(false);
        return;
      }

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } else {
        setError(data.error || "Invalid or expired OTP code");
        setLoading(false);
      }
    } catch {
      setError("Failed to verify OTP code. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setInfoMsg("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to resend OTP");
        return;
      }
      if (data.success && data.requireOtp) {
        setInfoMsg(`A new 6-digit OTP code has been sent to your email.`);
      } else {
        setError(data.error || "Failed to resend OTP");
      }
    } catch {
      setError("Error resending OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <BackgroundOrbs />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-[var(--card)]/80 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/15" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
              <Database className="h-6 w-6" />
            </div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-white/70">Portfolio CMS</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight font-[family-name:var(--font-outfit)]">
              Keep your portfolio current and publish-ready.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
              Manage Work &amp; Education, company-linked projects, credentials, articles, messages, and site analytics in one secure console.
            </p>
          </div>
          <div className="relative space-y-3 text-xs font-medium text-white/80">
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Two-step administrator verification</p>
            <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Content readiness checks before publishing</p>
          </div>
        </aside>

        <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Decorative radial gradient glow */}
          <div className="absolute -top-1/2 -right-1/4 w-[300px] h-[300px] bg-[var(--primary)] rounded-full opacity-[0.05] blur-[80px] pointer-events-none" />

          {/* Logo / Brand Header */}
          <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)] sm:left-8 sm:top-8 lg:left-12">
            <Home className="h-3.5 w-3.5" /> Portfolio
          </Link>
          <div className="text-center mb-8 mt-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_var(--glow-primary)]">
              {step === "password" ? (
                <Lock className="w-7 h-7 text-white" />
              ) : (
                <KeyRound className="w-7 h-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-extrabold font-[family-name:var(--font-outfit)] tracking-tight">
              {step === "password" ? "Admin Portal" : "Two-Factor Auth (2FA)"}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {step === "password"
                ? "Rajan Prakash Chand Portfolio CMS"
                : "Enter the 6-digit OTP code sent to your email"}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2" aria-label={`Authentication step ${step === "password" ? "1" : "2"} of 2`}>
              <span className="h-1.5 w-10 rounded-full bg-[var(--primary)]" />
              <span className={`h-1.5 w-10 rounded-full transition-colors ${step === "otp" ? "bg-[var(--accent)]" : "bg-[var(--glass-border)]"}`} />
            </div>
          </div>

          {/* Step 1: Enter Password */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="admin-user" className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Username
                </label>
                <input
                  id="admin-user"
                  type="text"
                  autoComplete="username"
                  placeholder="admin"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-pass" className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {error && (
                <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-sm text-rose-500 surface-enter">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-sm text-emerald-500 surface-enter">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>Password Verified! Requesting 2FA Code...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_35px_var(--glow-primary)] text-white font-semibold rounded-xl text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
              >
                {loading ? (
                  <span>Checking Credentials...</span>
                ) : (
                  <>
                    <span>Continue to 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: 2FA OTP Code Verification */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-6 surface-enter">
              {infoMsg && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-500 font-medium leading-relaxed">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span>{infoMsg}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="admin-otp" className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase block">
                  6-Digit Verification Code
                </label>
                <input
                  id="admin-otp"
                  type="text"
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="••••••"
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-center text-2xl font-mono tracking-[0.35em] font-bold text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/30 placeholder:tracking-normal focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {error && (
                <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-sm text-rose-500 surface-enter">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-sm text-emerald-500 surface-enter">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>2FA Verified! Access Granted...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success || otp.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_35px_var(--glow-primary)] text-white font-semibold rounded-xl text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
              >
                {loading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <span>Verify Code & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep("password")}
                  className="inline-flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Password
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Footer Note */}
          <div className="text-center mt-8 text-xs text-[var(--muted-foreground)]">
            Protected by 2-Factor Authentication & Audit Logging.
          </div>
        </div>
      </div>
    </main>
  );
}
