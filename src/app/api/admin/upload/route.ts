import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

// Helper to check authentication
async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "rajan-portfolio-secure-token-2026";
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
    
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ error: "Allowed file formats: PNG, JPG, JPEG, WEBP, SVG" }, { status: 400 });
    }

    // Save with unique name to prevent collisions but keep it clean
    const safeName = `${file.name.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}${ext}`;
    const publicPath = path.join(process.cwd(), "public/images", safeName);
    
    // Ensure public/images directory exists
    const imagesDir = path.join(process.cwd(), "public/images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    fs.writeFileSync(publicPath, buffer);
    const imageUrl = `/images/${safeName}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
