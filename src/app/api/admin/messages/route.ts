import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { isAdminAuthenticated, getClientIp } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const messagesRateLimiter = createRateLimiter({ max: 30, windowMs: 60 * 1000 });

async function checkRateLimit() {
  const clientIp = getClientIp(await headers());
  return messagesRateLimiter(clientIp);
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = await checkRateLimit();
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return serverError("Messages GET error:", error);
    }

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    return serverError("Messages GET error:", error);
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = await checkRateLimit();
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    const { id, status } = await request.json();

    if (!id || (status !== "read" && status !== "unread")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { error } = await supabase.from("messages").update({ status }).eq("id", id);

    if (error) {
      return serverError("Messages PATCH error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("Messages PATCH error:", error);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = await checkRateLimit();
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      return serverError("Messages DELETE error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("Messages DELETE error:", error);
  }
}
