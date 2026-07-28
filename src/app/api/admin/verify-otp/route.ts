import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getSessionSecret,
  getAdminEmail,
  secureCookieOptions,
  SESSION_TTL_MS,
} from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import {
  getDeviceInfo,
  verifySignedOtpToken,
  OTP_COOKIE_NAME,
  sendSecurityEmailNotification,
  logSecurityEvent,
} from "@/lib/security";
import { createRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";

export const dynamic = "force-dynamic";

const otpRateLimiter = createRateLimiter({
  max: process.env.NODE_ENV === "development" ? 50 : 8,
  windowMs: 15 * 60 * 1000,
});

export async function POST(request: Request) {
  try {
    const originBlock = assertSameOrigin(request);
    if (originBlock) return originBlock;

    const sessionSecret = getSessionSecret();
    if (!sessionSecret) {
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
    const clientIp = getClientIp(headersList);
    const rateCheck = otpRateLimiter(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many OTP attempts. Please try again in ${Math.ceil(rateCheck.retryAfterSec / 60)} minute(s).`,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    const { otp } = await request.json();
    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json(
        { success: false, error: "A valid 6-digit OTP code is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(OTP_COOKIE_NAME);
    const tokenValue = tokenCookie?.value;
    const deviceInfo = await getDeviceInfo(headersList);

    const isOtpValid = verifySignedOtpToken(tokenValue, otp);
    if (!isOtpValid) {
      void logSecurityEvent(false, deviceInfo);
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP code. Please try again." },
        { status: 401 }
      );
    }

    otpRateLimiter.reset(clientIp);

    const sessionToken = createAdminSessionToken(sessionSecret);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Failed to create secure session" },
        { status: 500 }
      );
    }

    void logSecurityEvent(true, deviceInfo);
    void sendSecurityEmailNotification(true, deviceInfo, getAdminEmail());

    const response = NextResponse.json({ success: true, redirect: "/admin/dashboard" });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionToken,
      secureCookieOptions(Math.floor(SESSION_TTL_MS / 1000))
    );
    response.cookies.set(OTP_COOKIE_NAME, "", {
      ...secureCookieOptions(0),
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify OTP code" }, { status: 500 });
  }
}
