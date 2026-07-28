import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  verifyAdminPassword,
  verifyAdminUsername,
  getAdminPasswordHash,
  getSessionSecret,
  getAdminEmail,
  secureCookieOptions,
} from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";
import { assertSameOrigin } from "@/lib/request-security";
import {
  getDeviceInfo,
  generateOtpCode,
  createSignedOtpToken,
  OTP_COOKIE_NAME,
  sendOtpEmailNotification,
  sendSecurityEmailNotification,
  logSecurityEvent,
} from "@/lib/security";

const loginRateLimiter = createRateLimiter({
  max: process.env.NODE_ENV === "development" ? 100 : 5,
  windowMs: process.env.NODE_ENV === "development" ? 1000 : 15 * 60 * 1000,
});

export async function POST(request: Request) {
  try {
    const originBlock = assertSameOrigin(request);
    if (originBlock) return originBlock;

    const targetHash = await getAdminPasswordHash();
    const sessionSecret = getSessionSecret();

    if (!sessionSecret || !targetHash) {
      console.error("Admin login attempted but sessionSecret/targetHash could not be resolved");
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
    const deviceInfo = await getDeviceInfo(headersList);
    const rateCheck = loginRateLimiter(deviceInfo.ip);

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

    const { username, password } = await request.json();

    if (!username || typeof username !== "string" || username.length > 64) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length > 200) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const [usernameOk, passwordOk] = await Promise.all([
      verifyAdminUsername(username),
      verifyAdminPassword(password),
    ]);

    if (usernameOk && passwordOk) {
      loginRateLimiter.reset(deviceInfo.ip);

      const otpCode = generateOtpCode();
      const { token } = createSignedOtpToken(otpCode);
      const adminEmail = getAdminEmail();

      await sendOtpEmailNotification(otpCode, deviceInfo, adminEmail);

      const response = NextResponse.json({
        success: true,
        requireOtp: true,
        email: "your registered email",
        hasResendKey: !!process.env.RESEND_API_KEY,
      });

      response.cookies.set(OTP_COOKIE_NAME, token, secureCookieOptions(60 * 10));

      return response;
    }

    void Promise.allSettled([
      logSecurityEvent(false, deviceInfo),
      sendSecurityEmailNotification(false, deviceInfo, getAdminEmail()),
    ]);

    return NextResponse.json(
      { success: false, error: "Incorrect username or password." },
      { status: 401 }
    );
  } catch (error) {
    return serverError("Admin login error:", error, "An unexpected error occurred");
  }
}
