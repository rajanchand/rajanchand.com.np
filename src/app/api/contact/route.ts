import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { getClientIp } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const contactRateLimiter = createRateLimiter({ max: 5, windowMs: 10 * 60 * 1000 });
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown; // honeypot — real visitors never fill this in
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ success: false, error: "Invalid request format" }, { status: 400 });
    }

    const headersList = await headers();
    const clientIp = getClientIp(headersList);
    const rateCheck = contactRateLimiter(clientIp);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many messages sent. Please try again in ${Math.ceil(rateCheck.retryAfterSec / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as ContactPayload;

    // Honeypot: bots fill every field, including ones hidden from real users.
    // Pretend success without touching the database so we don't tip them off.
    if (typeof body.company === "string" && body.company.trim() !== "") {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subjectRaw = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ success: false, error: "Name must be between 2 and 100 characters" }, { status: 400 });
    }
    if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: "Enter a valid email address" }, { status: 400 });
    }
    if (subjectRaw.length > 150) {
      return NextResponse.json({ success: false, error: "Subject must be under 150 characters" }, { status: 400 });
    }
    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json({ success: false, error: "Message must be between 10 and 5000 characters" }, { status: 400 });
    }

    const subject = subjectRaw || "New message from portfolio site";
    const sanitized = sanitizeObject({ name, email, subject, message });

    const { error } = await supabase.from("messages").insert({
      name: sanitized.name,
      email: sanitized.email,
      subject: sanitized.subject,
      message: sanitized.message,
      status: "unread",
      ip_address: clientIp,
      user_agent: headersList.get("user-agent")?.slice(0, 500) || null,
    });

    if (error) {
      return serverError("Contact insert error:", error, "Couldn't send your message. Please try again.");
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return serverError("Contact route error:", error, "Couldn't send your message. Please try again.");
  }
}
