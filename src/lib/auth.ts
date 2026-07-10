import { cookies } from "next/headers";
import crypto from "crypto";

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

/**
 * Verifies the admin_session cookie against ADMIN_SESSION_SECRET.
 * Fails closed: if the secret isn't configured, every request is unauthenticated.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session?.value) return false;

  return timingSafeEqualStrings(session.value, secret);
}

export { SESSION_COOKIE_NAME };

/**
 * Verifies a plaintext password against ADMIN_PASSWORD_HASH, which must be
 * formatted as "<hex salt>:<hex scrypt-derived key>". Fails closed if unset
 * or malformed — there is no hardcoded fallback password.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const targetHash = process.env.ADMIN_PASSWORD_HASH;
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
