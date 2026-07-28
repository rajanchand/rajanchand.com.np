import { NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { isAdminAuthenticated, getClientIp } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { serverError } from "@/lib/api-response";
import { assertSameOrigin } from "@/lib/request-security";

const dataFilePath = path.join(process.cwd(), "src/lib/data.json");
const adminRateLimiter = createRateLimiter({ max: 30, windowMs: 60 * 1000 });

async function checkRateLimit() {
  const clientIp = getClientIp(await headers());
  return adminRateLimiter(clientIp);
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

    // Try fetching from Supabase with safe try-catch wrapper
    let dbData = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbError: any = null;
    try {
      const response = await supabase
        .from("portfolio")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      dbData = response.data;
      dbError = response.error;
    } catch (e: unknown) {
      const error = e as Error;
      console.warn("Supabase network crash in GET (using local data.json fallback):", error.message || error);
      dbError = error;
    }

    if (!dbError && dbData && dbData.content) {
      return NextResponse.json(dbData.content);
    }

    if (dbError) {
      console.warn("Supabase query warning in GET (falling back to data.json):", dbError.message || dbError);
    }

    // Fallback to local data.json
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dataFilePath, "utf8");
    const localData = JSON.parse(fileContent);

    // Auto-seed Supabase if table exists but is empty (wrapped in try-catch)
    if (!dbError && !dbData) {
      try {
        const { error: seedError } = await supabase
          .from("portfolio")
          .insert({ id: 1, content: localData });
        if (seedError) {
          console.error("Auto-seeding failed:", seedError.message);
        }
      } catch (seedErr: unknown) {
        const error = seedErr as Error;
        console.error("Auto-seeding crash:", error.message || error);
      }
    }

    return NextResponse.json(localData);
  } catch (error) {
    return serverError("Admin GET error:", error);
  }
}

export async function POST(request: Request) {
  try {
    const originBlock = assertSameOrigin(request);
    if (originBlock) return originBlock;

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

    const updatedData = await request.json();

    // Validate the incoming JSON is sound
    if (!updatedData.siteConfig || !updatedData.experience || !updatedData.projects) {
      return NextResponse.json({ error: "Invalid data structure" }, { status: 400 });
    }

    const sanitizedData = sanitizeObject(updatedData);

    // Validate email format if provided
    if (sanitizedData.siteConfig.email) {
      const email = sanitizedData.siteConfig.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
      }
    }

    // Preserve existing admin credentials when saving content edits
    try {
      const { preserveAdminSecrets } = await import("@/lib/auth");
      const { data: existingData } = await supabase
        .from("portfolio")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      preserveAdminSecrets(sanitizedData, existingData?.content);
    } catch (e: unknown) {
      console.warn("Failed to fetch existing admin credentials during save:", e);
    }

    // 1. Write to the local JSON file (so local environment stays in sync)
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(sanitizedData, null, 2), "utf8");
    } catch (fsErr) {
      console.warn("Local filesystem write skipped/failed (likely serverless environment):", fsErr);
    }

    // 2. Write to Supabase database with safe try-catch wrapper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbError: any = null;
    try {
      const response = await supabase
        .from("portfolio")
        .upsert({ 
          id: 1, 
          content: sanitizedData, 
          updated_at: new Date().toISOString() 
        });
      dbError = response.error;
    } catch (dbErr: unknown) {
      const error = dbErr as Error;
      console.error("Supabase upsert crashed:", error.message || error);
      dbError = error;
    }

    let message = "Data updated successfully!";
    if (dbError) {
      const errMsg = dbError.message || "Connection refused";
      console.error("Supabase upsert error:", errMsg);
      message = `Data updated locally, but Supabase update failed: ${errMsg}. Make sure the 'portfolio' table has been created in your Supabase database.`;
    }

    // Force revalidation of all site pages
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/dissertions");
    
    // Also revalidate dynamic slug posts
    if (updatedData.blogPosts && Array.isArray(updatedData.blogPosts)) {
      updatedData.blogPosts.forEach((post: { slug?: string }) => {
        if (post.slug) {
          revalidatePath(`/blog/${post.slug}`);
        }
      });
    }

    return NextResponse.json({
      success: !dbError,
      message
    });
  } catch (error) {
    return serverError("Admin POST error:", error);
  }
}

