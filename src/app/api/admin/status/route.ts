import { NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { isAdminAuthenticated, getClientIp, getSessionSecret, getAdminUsername } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const statusRateLimiter = createRateLimiter({ max: 30, windowMs: 60 * 1000 });
const DATA_JSON_PATH = path.join(process.cwd(), "src", "lib", "data.json");
const CREDENTIALS_JSON_PATH = path.join(process.cwd(), "src", "lib", "credentials.json");

async function checkRateLimit() {
  const clientIp = getClientIp(await headers());
  return statusRateLimiter(clientIp);
}

function checkFileWriteable(fullPath: string): { exists: boolean; writeable: boolean } {
  const exists = fs.existsSync(fullPath);
  let writeable = false;
  if (exists) {
    try {
      fs.accessSync(fullPath, fs.constants.W_OK);
      writeable = true;
    } catch {
      writeable = false;
    }
  }
  return { exists, writeable };
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

    // 1. Check Supabase Connectivity and latency
    const startDb = Date.now();
    let supabaseStatus = "disconnected";
    let dbLatencyMs = 0;
    let visitorsCount = 0;
    let messagesTotal = 0;
    let messagesUnread = 0;
    let portfolioExists = false;
    let dbErrorMsg = null;

    try {
      // Check portfolio table
      const { data: portData, error: portError } = await supabase
        .from("portfolio")
        .select("id")
        .eq("id", 1)
        .maybeSingle();

      if (portError) {
        dbErrorMsg = portError.message;
      } else {
        supabaseStatus = "connected";
        portfolioExists = !!portData;
        dbLatencyMs = Date.now() - startDb;

        // Fetch counts
        const { count: vCount } = await supabase
          .from("visitors")
          .select("*", { count: "exact", head: true });
        visitorsCount = vCount || 0;

        const { data: msgData, error: msgErr } = await supabase
          .from("messages")
          .select("status");
        if (!msgErr && msgData) {
          messagesTotal = msgData.length;
          messagesUnread = msgData.filter((m) => m.status === "unread").length;
        }
      }
    } catch (e: unknown) {
      supabaseStatus = "error";
      dbErrorMsg = e instanceof Error ? e.message : String(e);
    }

    // 2. Report local source-file status without creating probe files.
    // Production/serverless filesystems are commonly read-only and ephemeral.
    const dataJsonStatus = checkFileWriteable(DATA_JSON_PATH);
    const credentialsJsonStatus = checkFileWriteable(CREDENTIALS_JSON_PATH);

    // 3. Environment status — session secret must be ≥32 chars (same rule as login)
    const envStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      adminSessionSecret: !!getSessionSecret(),
      adminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
      adminUsernameEnv: !!process.env.ADMIN_USERNAME?.trim(),
      adminEmailEnv: !!process.env.ADMIN_EMAIL?.trim(),
      resendApiKey: !!process.env.RESEND_API_KEY,
    };

    const adminUsername = await getAdminUsername();

    return NextResponse.json({
      supabase: {
        status: supabaseStatus,
        latencyMs: dbLatencyMs,
        portfolioExists,
        visitorsCount,
        messages: {
          total: messagesTotal,
          unread: messagesUnread,
        },
        error: dbErrorMsg,
      },
      localFiles: {
        dataJson: dataJsonStatus,
        credentialsJson: credentialsJsonStatus,
      },
      environment: envStatus,
      admin: {
        username: adminUsername,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return serverError("Status GET error:", error);
  }
}
