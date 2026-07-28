import { cookies } from "next/headers";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

function timingSafeEqualStrings(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/** Fails closed — never falls back to a hardcoded secret. */
export function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  return secret;
}

/**
 * Creates a time-limited HMAC session token.
 * Format: `<expiresAtMs>.<hmac>`
 */
export function createAdminSessionToken(secret: string = getSessionSecret() || ""): string | null {
  if (!secret) return null;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const sig = crypto.createHmac("sha256", secret).update(`session:${payload}`).digest("hex");
  return `${payload}.${sig}`;
}

/** Verifies a signed session token (Node runtime). */
export function verifyAdminSessionToken(
  token: string | undefined | null,
  secret: string = getSessionSecret() || ""
): boolean {
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!expiresAtStr || !sig || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(`session:${expiresAtStr}`).digest("hex");
  return timingSafeEqualStrings(sig, expected);
}

/**
 * Verifies the admin_session cookie against a signed, expiring token.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getSessionSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return verifyAdminSessionToken(session?.value, secret);
}

export { SESSION_COOKIE_NAME, SESSION_TTL_MS };

const CREDENTIALS_PATH = path.join(process.cwd(), "src/lib/credentials.json");
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_EMAIL = "rajanchand48@gmail.com";
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,32}$/;

export type AdminCredentialsFile = {
  username?: string;
  passwordHash?: string;
  updated_at?: string;
};

/** Strip private admin credential fields before returning portfolio content publicly. */
export function stripAdminSecrets<T extends Record<string, unknown>>(content: T): T {
  const copy = { ...content };
  delete (copy as Record<string, unknown>)._adminPasswordHash;
  delete (copy as Record<string, unknown>)._adminUsername;
  return copy;
}

/** Copy admin credential fields from existing Supabase content into a payload being saved. */
export function preserveAdminSecrets(
  target: Record<string, unknown>,
  existingContent: Record<string, unknown> | null | undefined
): void {
  if (!existingContent || typeof existingContent !== "object") return;
  if (typeof existingContent._adminPasswordHash === "string" && existingContent._adminPasswordHash) {
    target._adminPasswordHash = existingContent._adminPasswordHash;
  }
  if (typeof existingContent._adminUsername === "string" && existingContent._adminUsername) {
    target._adminUsername = existingContent._adminUsername;
  }
}

function readLocalCredentials(): AdminCredentialsFile | null {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) return null;
    const fileContent = fs.readFileSync(CREDENTIALS_PATH, "utf8");
    const credData = JSON.parse(fileContent) as AdminCredentialsFile;
    return credData && typeof credData === "object" ? credData : null;
  } catch (err) {
    console.warn("Local credentials read failed:", err);
    return null;
  }
}

let supabaseAdminContentCache: { at: number; content: Record<string, unknown> | null } | null = null;

async function readSupabaseAdminContent(): Promise<Record<string, unknown> | null> {
  const now = Date.now();
  if (supabaseAdminContentCache && now - supabaseAdminContentCache.at < 1500) {
    return supabaseAdminContentCache.content;
  }

  try {
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase
      .from("portfolio")
      .select("content")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data?.content && typeof data.content === "object") {
      const content = data.content as Record<string, unknown>;
      supabaseAdminContentCache = { at: now, content };
      return content;
    }
  } catch (err) {
    console.warn("Supabase fetch failed for admin credentials:", err);
  }

  supabaseAdminContentCache = { at: now, content: null };
  return null;
}

/** Clear cached Supabase admin content after credential writes. */
export function invalidateAdminCredentialsCache(): void {
  supabaseAdminContentCache = null;
}

/**
 * Retrieves the current password hash from Supabase, local file, or env.
 * No hardcoded fallback — admin login fails closed when unset.
 */
export async function getAdminPasswordHash(): Promise<string | null> {
  const supabaseContent = await readSupabaseAdminContent();
  if (typeof supabaseContent?._adminPasswordHash === "string" && supabaseContent._adminPasswordHash) {
    return supabaseContent._adminPasswordHash;
  }

  const local = readLocalCredentials();
  if (local?.passwordHash) return local.passwordHash;

  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
}

/**
 * Resolves the admin username.
 * Precedence: Supabase → credentials.json → ADMIN_USERNAME env → default "admin".
 */
export async function getAdminUsername(): Promise<string> {
  const supabaseContent = await readSupabaseAdminContent();
  if (typeof supabaseContent?._adminUsername === "string" && supabaseContent._adminUsername.trim()) {
    return supabaseContent._adminUsername.trim();
  }

  const local = readLocalCredentials();
  if (local?.username?.trim()) return local.username.trim();

  const fromEnv = process.env.ADMIN_USERNAME?.trim();
  if (fromEnv) return fromEnv;

  return DEFAULT_ADMIN_USERNAME;
}

/** OTP / security alert recipient. Env ADMIN_EMAIL overrides the default site owner email. */
export function getAdminEmail(): string {
  const fromEnv = process.env.ADMIN_EMAIL?.trim();
  if (fromEnv && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEnv)) return fromEnv;
  return DEFAULT_ADMIN_EMAIL;
}

export function isValidAdminUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

export function hashAdminPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, Buffer.from(salt, "hex"), 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function writeLocalCredentials(data: AdminCredentialsFile): boolean {
  try {
    const existing = readLocalCredentials() || {};
    const next: AdminCredentialsFile = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(next, null, 2), "utf8");
    return true;
  } catch (err) {
    console.warn("Failed to write credentials.json locally (likely serverless):", err);
    return false;
  }
}

/**
 * Verifies a plaintext password against the configured admin password hash.
 * Fails closed if unset or malformed.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const targetHash = await getAdminPasswordHash();
  if (!targetHash) return false;

  const [saltHex, keyHex] = targetHash.split(":");
  if (!saltHex || !keyHex || keyHex.length % 2 !== 0) return false;

  const targetKey = Buffer.from(keyHex, "hex");
  const derivedKey = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), targetKey.length);

  if (derivedKey.length !== targetKey.length) return false;
  return crypto.timingSafeEqual(derivedKey, targetKey);
}

/** Case-insensitive username check with timing-safe compare on normalized forms. */
export async function verifyAdminUsername(username: string): Promise<boolean> {
  if (!username || typeof username !== "string") return false;
  const expected = (await getAdminUsername()).toLowerCase();
  const provided = username.trim().toLowerCase();
  return timingSafeEqualStrings(provided, expected);
}

export function getClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") || "unknown";
}

const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_REGEX = /^[0-9a-fA-F:]+$/;

/** Minimal shape validation — enough to reject header injection before it reaches an outbound URL. */
export function isValidIp(ip: string): boolean {
  if (!ip || ip === "unknown") return false;

  const v4Match = ip.match(IPV4_REGEX);
  if (v4Match) {
    return v4Match.slice(1).every((octet) => Number(octet) <= 255);
  }

  return ip.includes(":") && ip.length <= 45 && IPV6_REGEX.test(ip);
}

/** Cookie options shared by admin session/OTP setters. */
export function secureCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: maxAgeSec,
    path: "/",
  };
}
