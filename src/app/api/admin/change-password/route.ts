import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { isAdminAuthenticated, verifyAdminPassword, getClientIp } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const changePasswordRateLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }); // 5 attempts per 15 mins

async function checkRateLimit() {
  const clientIp = getClientIp(await headers());
  return changePasswordRateLimiter(clientIp);
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, Buffer.from(salt, "hex"), 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = await checkRateLimit();
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many password change attempts. Please try again in ${Math.ceil(rateCheck.retryAfterSec / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    // 1. Verify current password
    const isCurrentValid = await verifyAdminPassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // 2. Generate new hash
    const newHash = hashPassword(newPassword);

    // 3. Write locally to src/lib/credentials.json
    try {
      const credPath = path.join(process.cwd(), "src/lib/credentials.json");
      const credData = { passwordHash: newHash, updated_at: new Date().toISOString() };
      fs.writeFileSync(credPath, JSON.stringify(credData, null, 2), "utf8");
    } catch (fsErr) {
      console.warn("Failed to write credentials.json locally (likely serverless environment):", fsErr);
    }

    // 4. Write to Supabase under row id = 2
    let dbError = null;
    try {
      const { error } = await supabase
        .from("portfolio")
        .upsert({
          id: 2,
          content: { passwordHash: newHash },
          updated_at: new Date().toISOString()
        });
      dbError = error;
    } catch (dbErr: unknown) {
      console.error("Supabase upsert crashed for password hash:", dbErr instanceof Error ? dbErr.message : dbErr);
      dbError = dbErr;
    }

    if (dbError) {
      console.error("Database update error for password:", dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json({
        success: true,
        message: "Password updated locally, but failed to sync to Supabase database. Make sure Supabase connection is functional."
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!"
    });
  } catch (error) {
    return serverError("Change password error:", error);
  }
}
