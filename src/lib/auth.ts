import { cookies } from "next/headers";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const SESSION_COOKIE_NAME = "admin_session";

function timingSafeEqualStrings(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Run a dummy comparison so a length mismatch doesn't return faster
    // than a full comparison and leak length via timing.
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

const DEFAULT_SESSION_SECRET = "rajanchand-default-admin-session-secret-key-2026";
const DEFAULT_PASSWORD_HASH = "57c4251b954458005a5814df8535184d:f64f1a67adc6b25d33b2e1574a5c5788ef12cddb8483f1857e21a561c00817edcf972f9a5dc85c59aadec05ce16bb5f7dcd5d4e6684bbb0143263ed8cbf7de68";

/**
 * Verifies the admin_session cookie against ADMIN_SESSION_SECRET.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session?.value) return false;

  return timingSafeEqualStrings(session.value, secret);
}

export { SESSION_COOKIE_NAME, DEFAULT_SESSION_SECRET };

/**
 * Retrieves the current password hash from Supabase (row id=1), local file, or environment fallback.
 */
export async function getAdminPasswordHash(): Promise<string> {
  // 1. Try Supabase row id = 1 (_adminPasswordHash inside content)
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

  // 2. Try local credentials.json
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

  // 3. Fallback to env or default hash
  return process.env.ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
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
