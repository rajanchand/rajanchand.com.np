"use client";

import { useEffect } from "react";

export function VisitorTracker() {
  useEffect(() => {
    // Only fire once per session
    const key = "rpc_tracked";
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");

    // Use sendBeacon if available for non-blocking fire-and-forget
    const payload = JSON.stringify({
      pageUrl: window.location.pathname,
      referrer: document.referrer || "",
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently fail — tracking should never break UX
      });
    }
  }, []);

  return null;
}
