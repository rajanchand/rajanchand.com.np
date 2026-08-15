import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";
import { getClientIp, stripAdminSecrets } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const portfolioRateLimiter = createRateLimiter({ max: 30, windowMs: 60 * 1000 });

export async function GET() {
  try {
    const clientIp = getClientIp(await headers());
    const rateCheck = portfolioRateLimiter(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
    }

    // Try to fetch from Supabase
    const { data: dbData, error } = await supabase
      .from("portfolio")
      .select("content")
      .eq("id", 1)
      .maybeSingle();

    if (!error && dbData && dbData.content) {
      return NextResponse.json(stripAdminSecrets(dbData.content));
    }

    if (error) {
      console.warn("Supabase query warning (falling back to data.json):", error.message);
    }

    // Fallback to local data.json
    const dataFilePath = path.join(process.cwd(), "src/lib/data.json");
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, "utf8");
      const localData = JSON.parse(fileContent);

      // Auto-seed Supabase if the table exists but is empty
      if (!error && !dbData) {
        const { error: seedError } = await supabase
          .from("portfolio")
          .insert({ id: 1, content: localData });
        if (seedError) {
          console.error("Failed to seed Supabase:", seedError.message);
        }
      }

      return NextResponse.json(stripAdminSecrets(localData));
    }

    return NextResponse.json({ error: "Data source not found" }, { status: 404 });
  } catch (error) {
    return serverError("Portfolio GET error:", error);
  }
}
