import { NextResponse } from "next/server";

/**
 * Reject cross-site mutating requests (basic CSRF defense for cookie-auth APIs).
 * Allows same-origin browser calls and same-host server tools.
 */
export function assertSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // Non-browser clients (curl, server-to-server) often omit Origin — allow only
  // when Referer is also absent and Host is present (still authenticated via cookie).
  if (!origin && !referer) {
    return null;
  }

  const allowedHosts = new Set<string>();
  if (host) allowedHosts.add(host.toLowerCase());

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (siteUrl) {
    try {
      const u = new URL(siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`);
      allowedHosts.add(u.host.toLowerCase());
    } catch {
      // ignore malformed site url
    }
  }

  const checkUrl = (value: string) => {
    try {
      return allowedHosts.has(new URL(value).host.toLowerCase());
    } catch {
      return false;
    }
  };

  if (origin && checkUrl(origin)) return null;
  if (!origin && referer && checkUrl(referer)) return null;

  return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
}
