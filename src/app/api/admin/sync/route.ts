import { NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { isAdminAuthenticated, getClientIp } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";
import { sanitizeObject } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const syncRateLimiter = createRateLimiter({ max: 10, windowMs: 60 * 1000 });

async function checkRateLimit() {
  const clientIp = getClientIp(await headers());
  return syncRateLimiter(clientIp);
}

export async function POST(request: Request) {
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

    const { action } = await request.json();

    if (action !== "push" && action !== "pull") {
      return NextResponse.json({ error: "Invalid action. Must be 'push' or 'pull'" }, { status: 400 });
    }

    const dataFilePath = path.join(process.cwd(), "src/lib/data.json");

    if (action === "push") {
      // 1. Read local JSON
      if (!fs.existsSync(dataFilePath)) {
        return NextResponse.json({ error: "Local data.json not found" }, { status: 404 });
      }
      const fileContent = fs.readFileSync(dataFilePath, "utf8");
      const localData = JSON.parse(fileContent);

      const sanitizedData = sanitizeObject(localData);

      // 2. Write to Supabase (id=1)
      const { error } = await supabase
        .from("portfolio")
        .upsert({
          id: 1,
          content: sanitizedData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        return NextResponse.json({ error: `Supabase write failed: ${error.message}` }, { status: 500 });
      }

      // Revalidate site pages
      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath("/dissertions");

      return NextResponse.json({
        success: true,
        message: "Successfully pushed local data.json to Supabase database!"
      });

    } else {
      // action === "pull"
      // 1. Read from Supabase (id=1)
      const { data: dbData, error } = await supabase
        .from("portfolio")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: `Supabase read failed: ${error.message}` }, { status: 500 });
      }

      if (!dbData || !dbData.content) {
        return NextResponse.json({ error: "No portfolio content found in Supabase to pull" }, { status: 404 });
      }

      // 2. Write to local file
      const sanitizedData = sanitizeObject(dbData.content);
      fs.writeFileSync(dataFilePath, JSON.stringify(sanitizedData, null, 2), "utf8");

      // Revalidate site pages
      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath("/dissertions");

      return NextResponse.json({
        success: true,
        message: "Successfully pulled Supabase data into local data.json!"
      });
    }
  } catch (error) {
    return serverError("Sync POST error:", error);
  }
}
