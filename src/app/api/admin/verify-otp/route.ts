import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { SESSION_COOKIE_NAME, DEFAULT_SESSION_SECRET } from "@/lib/auth";
import { getDeviceInfo, verifyPendingOtp, sendSecurityEmailNotification, logSecurityEvent } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { otp } = await request.json();
    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: "A valid 6-digit OTP code is required" },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const deviceInfo = await getDeviceInfo(headersList);

    const isOtpValid = verifyPendingOtp(deviceInfo.ip, otp);
    if (!isOtpValid) {
      // Log failed OTP attempt
      logSecurityEvent(false, deviceInfo);
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP code. Please check your email and try again." },
        { status: 401 }
      );
    }

    // Success! Log security event & send final login notification
    logSecurityEvent(true, deviceInfo);
    sendSecurityEmailNotification(true, deviceInfo, "rajanchand48@gmail.com");

    const response = NextResponse.json({ success: true, redirect: "/admin/dashboard" });

    response.cookies.set(SESSION_COOKIE_NAME, sessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify OTP code" }, { status: 500 });
  }
}
