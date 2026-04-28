import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Try to fetch from Supabase
    const { data: dbData, error } = await supabase
      .from("portfolio")
      .select("content")
      .eq("id", 1)
      .maybeSingle();

    if (!error && dbData && dbData.content) {
      return NextResponse.json(dbData.content);
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
        console.log("Seeding Supabase with local data...");
        const { error: seedError } = await supabase
          .from("portfolio")
          .insert({ id: 1, content: localData });
        if (seedError) {
          console.error("Failed to seed Supabase:", seedError.message);
        } else {
          console.log("Supabase successfully seeded!");
        }
      }

      return NextResponse.json(localData);
    }

    return NextResponse.json({ error: "Data source not found" }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
