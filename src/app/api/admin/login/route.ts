import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getClientIp, verifyAdminPassword, getAdminPasswordHash, SESSION_COOKIE_NAME } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";

const loginRateLimiter = createRateLimiter({
  max: process.env.NODE_ENV === "development" ? 100 : 5,
  windowMs: process.env.NODE_ENV === "development" ? 1000 : 15 * 60 * 1000, // 1s dev, 15min prod
});

export async function POST(request: Request) {
  try {
    const targetHash = await getAdminPasswordHash();
    if (!process.env.ADMIN_SESSION_SECRET || !targetHash) {
      console.error("Admin login attempted but ADMIN_SESSION_SECRET/ADMIN_PASSWORD_HASH are not configured");
      return NextResponse.json(
        { success: false, error: "Server misconfigured. Contact the site owner." },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const clientIP = getClientIp(headersList);
    const rateCheck = loginRateLimiter(clientIP);

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

    const isValid = await verifyAdminPassword(password);

    if (isValid) {
      loginRateLimiter.reset(clientIP);

      const response = NextResponse.json({ success: true });

      response.cookies.set(SESSION_COOKIE_NAME, process.env.ADMIN_SESSION_SECRET, {
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
    return serverError("Admin login error:", error, "An unexpected error occurred");
  }
}
