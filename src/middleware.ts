import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "admin_session";

function hexFromBuffer(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifySessionEdge(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!expiresAtStr || !sig || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`session:${expiresAtStr}`)
  );
  const expected = hexFromBuffer(mac);

  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Edge-protect the CMS shell — APIs still enforce auth server-side
  if (pathname.startsWith("/admin/dashboard")) {
    const secret = process.env.ADMIN_SESSION_SECRET?.trim();
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!secret || secret.length < 32 || !token || !(await verifySessionEdge(token, secret))) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Extra lock-down headers for admin surfaces
  if (pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
