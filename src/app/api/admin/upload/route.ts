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

// Allowed file extensions and MIME magic bytes for validation
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Magic byte signatures for image file validation
const MAGIC_BYTES: Record<string, number[][]> = {
  ".png": [[0x89, 0x50, 0x4e, 0x47]],
  ".jpg": [[0xff, 0xd8, 0xff]],
  ".jpeg": [[0xff, 0xd8, 0xff]],
  ".webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  ".svg": [], // SVG validated by text content check
};

function validateMagicBytes(buffer: Buffer, ext: string): boolean {
  const signatures = MAGIC_BYTES[ext];
  if (!signatures || signatures.length === 0) {
    // For SVG, check that content starts with XML/SVG markers
    if (ext === ".svg") {
      const text = buffer.slice(0, 500).toString("utf8").trim().toLowerCase();
      return text.startsWith("<?xml") || text.startsWith("<svg");
    }
    return true;
  }

  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte)
  );
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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Allowed file formats: PNG, JPG, JPEG, WEBP, SVG" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes to prevent disguised files
    if (!validateMagicBytes(buffer, ext)) {
      return NextResponse.json(
        { error: "File content does not match its extension. Upload rejected." },
        { status: 400 }
      );
    }

    // Generate a secure, sanitized filename
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 50);
    const safeName = `${baseName}-${Date.now()}${ext}`;
    const publicPath = path.join(process.cwd(), "public/images", safeName);

    // Ensure public/images directory exists
    const imagesDir = path.join(process.cwd(), "public/images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Verify the resolved path is within public/images to prevent path traversal
    const resolvedPath = path.resolve(publicPath);
    const resolvedImagesDir = path.resolve(imagesDir);
    if (!resolvedPath.startsWith(resolvedImagesDir)) {
      return NextResponse.json(
        { error: "Invalid file path detected" },
        { status: 400 }
      );
    }

    fs.writeFileSync(publicPath, buffer);
    const imageUrl = `/images/${safeName}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
