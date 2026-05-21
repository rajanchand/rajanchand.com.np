import { NextResponse } from "next/server";
import { headers } from "next/headers";

// In-memory rate limiter for brute-force protection
// Key: IP address, Value: { attempts, resetAt }
const loginAttempts = new Map<string, { attempts: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIP(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    // Window expired or first attempt — reset
    loginAttempts.set(ip, { attempts: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  record.attempts += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export async function POST(request: Request) {
  try {
    // Validate Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Rate limiting
    const headersList = await headers();
    const clientIP = getClientIP(headersList);
    const rateCheck = checkRateLimit(clientIP);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${Math.ceil(rateCheck.retryAfterSec / 60)} minute(s).`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSec) },
        }
      );
    }

    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Cryptographically secure password verification via SHA-256 Web Crypto API
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Determine target hash (supporting either ADMIN_PASSWORD_HASH or dynamic hashing of plain ADMIN_PASSWORD)
    let targetHash = process.env.ADMIN_PASSWORD_HASH;
    if (!targetHash) {
      const plainPassword = process.env.ADMIN_PASSWORD || "rajan123";
      const plainEncoded = encoder.encode(plainPassword);
      const plainBuffer = await crypto.subtle.digest("SHA-256", plainEncoded);
      targetHash = Array.from(new Uint8Array(plainBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    }

    if (hashHex === targetHash) {
      // Clear rate limit on successful login
      loginAttempts.delete(clientIP);

      // Return success WITHOUT the token in the body — it's in the httpOnly cookie only
      const response = NextResponse.json({ success: true });

      response.cookies.set("admin_session", "rajan-portfolio-secure-token-2026", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Incorrect password" },
      { status: 401 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
