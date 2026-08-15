import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import {
  isAdminAuthenticated,
  verifyAdminPassword,
  getClientIp,
  getAdminUsername,
  isValidAdminUsername,
  hashAdminPassword,
  writeLocalCredentials,
  invalidateAdminCredentialsCache,
} from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";
import { assertSameOrigin } from "@/lib/request-security";

export const dynamic = "force-dynamic";

const changePasswordRateLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

async function checkRateLimit() {
  const clientIp = getClientIp(await headers());
  return changePasswordRateLimiter(clientIp);
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = await getAdminUsername();
    return NextResponse.json({ success: true, username });
  } catch (error) {
    return serverError("Get admin credentials error:", error);
  }
}

export async function POST(request: Request) {
  try {
    const originBlock = assertSameOrigin(request);
    if (originBlock) return originBlock;

    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const rateCheck = await checkRateLimit();
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many credential change attempts. Please try again in ${Math.ceil(rateCheck.retryAfterSec / 60)} minute(s).`,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    const { currentPassword, newPassword, newUsername } = await request.json();

    if (
      !currentPassword ||
      typeof currentPassword !== "string" ||
      currentPassword.length > 200
    ) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    const wantsPasswordChange = typeof newPassword === "string" && newPassword.length > 0;
    const wantsUsernameChange = typeof newUsername === "string" && newUsername.trim().length > 0;

    if (!wantsPasswordChange && !wantsUsernameChange) {
      return NextResponse.json(
        { error: "Provide a new username and/or a new password to update" },
        { status: 400 }
      );
    }

    if (wantsPasswordChange && newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (wantsPasswordChange && newPassword.length > 200) {
      return NextResponse.json(
        { error: "New password must not exceed 200 characters" },
        { status: 400 }
      );
    }

    if (wantsUsernameChange && !isValidAdminUsername(newUsername.trim())) {
      return NextResponse.json(
        {
          error:
            "Username must be 3–32 characters and only use letters, numbers, dots, underscores, or hyphens",
        },
        { status: 400 }
      );
    }

    const isCurrentValid = await verifyAdminPassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const currentUsername = await getAdminUsername();
    const nextUsername = wantsUsernameChange ? newUsername.trim() : currentUsername;
    const nextHash = wantsPasswordChange ? hashAdminPassword(newPassword) : null;

    let dbError: unknown = null;
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from("portfolio")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      if (fetchError) {
        dbError = fetchError;
      } else if (!existingData?.content || typeof existingData.content !== "object") {
        dbError = new Error(
          "Portfolio content missing in Supabase; refusing to overwrite with credentials-only payload"
        );
      } else {
        const updatedContent: Record<string, unknown> = {
          ...existingData.content,
          _adminUsername: nextUsername,
        };
        if (nextHash) {
          updatedContent._adminPasswordHash = nextHash;
        }

        const { error } = await supabase.from("portfolio").upsert({
          id: 1,
          content: updatedContent,
          updated_at: new Date().toISOString(),
        });
        dbError = error;
      }
    } catch (dbErr: unknown) {
      console.error(
        "Supabase upsert crashed for admin credentials:",
        dbErr instanceof Error ? dbErr.message : dbErr
      );
      dbError = dbErr;
    }

    invalidateAdminCredentialsCache();

    if (dbError) {
      console.error(
        "Database update error for credentials:",
        dbError instanceof Error ? dbError.message : dbError
      );
      return NextResponse.json(
        {
          error:
            "Failed to update credentials in Supabase. No credential changes were applied.",
        },
        { status: 500 }
      );
    }

    // Supabase is the production source of truth. The local file is only a
    // best-effort development mirror and must never be written first.
    writeLocalCredentials({
      username: nextUsername,
      ...(nextHash ? { passwordHash: nextHash } : {}),
    });

    const parts: string[] = [];
    if (wantsUsernameChange) parts.push("username");
    if (wantsPasswordChange) parts.push("password");

    return NextResponse.json({
      success: true,
      username: nextUsername,
      message: `Admin ${parts.join(" and ")} updated successfully!`,
    });
  } catch (error) {
    return serverError("Change password error:", error);
  }
}
