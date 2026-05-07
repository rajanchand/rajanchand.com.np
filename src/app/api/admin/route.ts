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

    // Try fetching from Supabase
    const { data: dbData, error } = await supabase
      .from("portfolio")
      .select("content")
      .eq("id", 1)
      .maybeSingle();

    if (!error && dbData && dbData.content) {
      return NextResponse.json(dbData.content);
    }

    if (error) {
      console.warn("Supabase query warning in GET (falling back to data.json):", error.message);
    }

    // Fallback to local data.json
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dataFilePath, "utf8");
    const localData = JSON.parse(fileContent);

    // Auto-seed Supabase if table exists but is empty
    if (!error && !dbData) {
      console.log("Auto-seeding Supabase in GET admin API...");
      const { error: seedError } = await supabase
        .from("portfolio")
        .insert({ id: 1, content: localData });
      if (seedError) {
        console.error("Auto-seeding failed:", seedError.message);
      } else {
        console.log("Auto-seeding succeeded!");
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

    // 2. Write to Supabase database
    const { error: dbError } = await supabase
      .from("portfolio")
      .upsert({ 
        id: 1, 
        content: sanitizedData, 
        updated_at: new Date().toISOString() 
      });

    let message = "Data updated successfully!";
    if (dbError) {
      console.error("Supabase upsert error:", dbError.message);
      message = `Data updated locally, but Supabase update failed: ${dbError.message}. Make sure the 'portfolio' table has been created in your Supabase database.`;
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

