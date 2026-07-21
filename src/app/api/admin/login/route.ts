import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyAdminPassword, getAdminPasswordHash, DEFAULT_SESSION_SECRET } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";
import {
  getDeviceInfo,
  generateOtpCode,
  storePendingOtp,
  sendOtpEmailNotification,
  sendSecurityEmailNotification,
  logSecurityEvent,
} from "@/lib/security";

const loginRateLimiter = createRateLimiter({
  max: process.env.NODE_ENV === "development" ? 100 : 5,
  windowMs: process.env.NODE_ENV === "development" ? 1000 : 15 * 60 * 1000, // 1s dev, 15min prod
});

export async function POST(request: Request) {
  try {
    const targetHash = await getAdminPasswordHash();
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;

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

    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminPassword(password);

    if (isValid) {
      loginRateLimiter.reset(deviceInfo.ip);

      // Generate 6-digit OTP code & store pending state
      const otpCode = generateOtpCode();
      storePendingOtp(deviceInfo.ip, otpCode);

      // Dispatch 2FA OTP Email
      await sendOtpEmailNotification(otpCode, deviceInfo, "rajanchand48@gmail.com");

      return NextResponse.json({
        success: true,
        requireOtp: true,
        email: "rajanchand48@gmail.com",
        // In dev mode, return OTP in payload so user can test without open email box if needed
        ...(process.env.NODE_ENV === "development" ? { debugOtp: otpCode } : {}),
      });
    }

    // FAILED LOGIN: Log event & send instant security alert email
    await logSecurityEvent(false, deviceInfo);
    await sendSecurityEmailNotification(false, deviceInfo, "rajanchand48@gmail.com");

    return NextResponse.json(
      { success: false, error: "Incorrect password. Security alert sent to rajanchand48@gmail.com" },
      { status: 401 }
    );
  } catch (error) {
    return serverError("Admin login error:", error, "An unexpected error occurred");
  }
}
