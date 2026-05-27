import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

// Helper to check authentication
async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "rajan-portfolio-secure-token-2026";
}

const dataFilePath = path.join(process.cwd(), "src/lib/data.json");

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try fetching from Supabase with safe try-catch wrapper
    let dbData = null;
    let dbError: unknown = null;
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
        console.log("Auto-seeding Supabase in GET admin API...");
        const { error: seedError } = await supabase
          .from("portfolio")
          .insert({ id: 1, content: localData });
        if (seedError) {
          console.error("Auto-seeding failed:", seedError.message);
        } else {
          console.log("Auto-seeding succeeded!");
        }
      } catch (seedErr: unknown) {
        const error = seedErr as Error;
        console.error("Auto-seeding crash:", error.message || error);
      }
    }

    return NextResponse.json(localData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedData = await request.json();

    // Validate the incoming JSON is sound
    if (!updatedData.siteConfig || !updatedData.experience || !updatedData.projects) {
      return NextResponse.json({ error: "Invalid data structure" }, { status: 400 });
    }

    // Input sanitization to prevent XSS (recursive stripper)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function sanitizeObject(obj: any): any {
      if (!obj) return obj;
      if (typeof obj === "string") {
        return obj
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      }
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }
      if (typeof obj === "object") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sanitized: any = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      return obj;
    }

    const sanitizedData = sanitizeObject(updatedData);

    // Validate email format if provided
    if (sanitizedData.siteConfig.email) {
      const email = sanitizedData.siteConfig.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
      }
    }

    // 1. Write to the local JSON file (so local environment stays in sync)
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(sanitizedData, null, 2), "utf8");
    } catch (fsErr) {
      console.warn("Local filesystem write skipped/failed (likely serverless environment):", fsErr);
    }

    // 2. Write to Supabase database with safe try-catch wrapper
    let dbError = null;
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
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

