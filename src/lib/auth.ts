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

/**
 * Retrieves the current password hash from Supabase, local file, or env.
 * No hardcoded fallback — admin login fails closed when unset.
 */
export async function getAdminPasswordHash(): Promise<string | null> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase
      .from("portfolio")
      .select("content")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data?.content?._adminPasswordHash) {
      return data.content._adminPasswordHash;
    }
  } catch (err) {
    console.warn("Supabase fetch failed in getAdminPasswordHash:", err);
  }

  try {
    const credPath = path.join(process.cwd(), "src/lib/credentials.json");
    if (fs.existsSync(credPath)) {
      const fileContent = fs.readFileSync(credPath, "utf8");
      const credData = JSON.parse(fileContent);
      if (credData.passwordHash) {
        return credData.passwordHash;
      }
    }
  } catch (err) {
    console.warn("Local credentials read failed:", err);
  }

  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
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
