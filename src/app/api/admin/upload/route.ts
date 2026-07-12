import { NextResponse } from "next/server";
import { headers } from "next/headers";
import path from "path";
import { supabase } from "@/lib/supabase";
import { isAdminAuthenticated, getClientIp } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-response";

const uploadRateLimiter = createRateLimiter({ max: 20, windowMs: 60 * 1000 });

// Allowed file extensions and MIME magic bytes for validation
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Magic byte signatures for file validation
const MAGIC_BYTES: Record<string, number[][]> = {
  ".png": [[0x89, 0x50, 0x4e, 0x47]],
  ".jpg": [[0xff, 0xd8, 0xff]],
  ".jpeg": [[0xff, 0xd8, 0xff]],
  ".webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  ".svg": [], // SVG validated by text content check
  ".pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  ".docx": [[0x50, 0x4b, 0x03, 0x04]], // PK.. (ZIP archive)
  ".doc": [[0xd0, 0xcf, 0x11, 0xe0]], // OLE compound file
};

// Map file extension to MIME type for Supabase Storage contentType
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
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

// Strips script content from SVGs before they land in a public Storage bucket.
function sanitizeSvg(buffer: Buffer): Buffer {
  const text = buffer.toString("utf8");
  const cleaned = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "");
  return Buffer.from(cleaned, "utf8");
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientIp = getClientIp(await headers());
    const rateCheck = uploadRateLimiter(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec) } }
      );
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
        { error: "Allowed formats: PNG, JPG, JPEG, WEBP, SVG, PDF, DOC, DOCX" },
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

    // SVGs can carry <script>/event-handler payloads that magic-byte checks don't
    const uploadBuffer = ext === ".svg" ? sanitizeSvg(buffer) : buffer;

    // Generate a secure, sanitized filename
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 50);
    const safeName = `${baseName}-${Date.now()}${ext}`;
    const bucketName = "images";

    // Ensure bucket exists (best-effort)
    try {
      await supabase.storage.createBucket(bucketName, { public: true });
    } catch {
      // Ignore - bucket likely exists or lack permissions
    }

    // Get correct MIME type
    const contentType = MIME_TYPES[ext] || file.type || "application/octet-stream";

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(safeName, uploadBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      return NextResponse.json(
        { error: `Storage failed: ${uploadError.message}. Please ensure a public bucket named '${bucketName}' exists in Supabase Storage.` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(safeName);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl, name: file.name, size: file.size, type: ext });
  } catch (error) {
    return serverError("Upload error:", error);
  }
}
