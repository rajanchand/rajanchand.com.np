import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    const adminPassword = process.env.ADMIN_PASSWORD || "rajan123";
    
    if (password === adminPassword) {
      // Create a simple response that sets a cookie
      const response = NextResponse.json({ success: true, token: "rajan-portfolio-secure-token-2026" });
      
      response.cookies.set("admin_session", "rajan-portfolio-secure-token-2026", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      
      return response;
    }
    
    return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
