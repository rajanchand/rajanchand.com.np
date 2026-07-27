"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const payload = { title, text: text || title, url: shareUrl };

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(payload);
        return;
      }
    } catch {
      // User cancelled share sheet — fall through only if clipboard is needed
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — no-op
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 glass rounded-xl text-xs font-semibold hover:border-[var(--primary)]/30 transition-all cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
      {copied ? "Link Copied" : "Share Article"}
    </button>
  );
}
