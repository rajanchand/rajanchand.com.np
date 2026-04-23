import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

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

    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: "Data file not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    // Write to the local JSON file
    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2), "utf8");

    // Force revalidation of all site pages
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/dissertions");
    
    // Also revalidate dynamic slug posts
    if (updatedData.blogPosts && Array.isArray(updatedData.blogPosts)) {
      updatedData.blogPosts.forEach((post: any) => {
        if (post.slug) {
          revalidatePath(`/blog/${post.slug}`);
        }
      });
    }

    return NextResponse.json({ success: true, message: "Data updated and site revalidated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
