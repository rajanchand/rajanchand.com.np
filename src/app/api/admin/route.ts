import { NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import {
  isAdminAuthenticated,
  getClientIp,
  preserveAdminSecrets,
  stripAdminSecrets,
} from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { serverError } from "@/lib/api-response";
import { assertSameOrigin } from "@/lib/request-security";
import {
  canonicalizePortfolioContent,
  getPortfolioValidationIssues,
} from "@/lib/portfolio-validation";

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
      return NextResponse.json(stripAdminSecrets(dbData.content));
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

    return NextResponse.json(stripAdminSecrets(localData));
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

    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const rateCheck = await checkRateLimit();
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    const updatedData = await request.json();

    const sanitizedData = canonicalizePortfolioContent(sanitizeObject(updatedData));
    const validationIssues = getPortfolioValidationIssues(sanitizedData);
    if (validationIssues.length > 0) {
      return NextResponse.json(
        {
          error: validationIssues[0],
          issues: validationIssues.slice(0, 10),
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (sanitizedData.siteConfig.email) {
      const email = sanitizedData.siteConfig.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
      }
    }

    // Preserve existing admin credentials when saving content edits
    try {
      const { data: existingData, error: credentialsError } = await supabase
        .from("portfolio")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      if (credentialsError) throw credentialsError;
      preserveAdminSecrets(sanitizedData, existingData?.content);
    } catch (e: unknown) {
      console.error("Failed to preserve admin credentials during save:", e);
      return NextResponse.json(
        { error: "Could not safely preserve admin credentials. No portfolio changes were applied." },
        { status: 502 }
      );
    }

    // Supabase is the production source of truth. Do not report a successful
    // save or mutate the local mirror until this write succeeds.
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

    if (dbError) {
      const errMsg = dbError.message || "Connection refused";
      console.error("Supabase upsert error:", errMsg);
      return NextResponse.json(
        { error: "Supabase update failed. No portfolio changes were applied." },
        { status: 502 }
      );
    }

    // Best-effort development mirror. Production/serverless filesystems may
    // be read-only or ephemeral, so failure here must not invalidate the DB save.
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(sanitizedData, null, 2), "utf8");
    } catch (fsErr) {
      console.warn("Local filesystem mirror skipped/failed:", fsErr);
    }

    // Force revalidation of all site pages
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/demos");
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
      success: true,
      message: "Portfolio updated successfully."
    });
  } catch (error) {
    return serverError("Admin POST error:", error);
  }
}

