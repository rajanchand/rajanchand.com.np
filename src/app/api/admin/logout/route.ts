import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, secureCookieOptions } from "@/lib/auth";
import { OTP_COOKIE_NAME } from "@/lib/security";
import { assertSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  const originBlock = assertSameOrigin(request);
  if (originBlock) return originBlock;

  const response = NextResponse.json({ success: true });
  const clear = { ...secureCookieOptions(0), maxAge: 0, expires: new Date(0) };
  response.cookies.set(SESSION_COOKIE_NAME, "", clear);
  response.cookies.set(OTP_COOKIE_NAME, "", clear);
  return response;
}
