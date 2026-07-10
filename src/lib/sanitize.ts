/**
 * Recursive blocklist-based string stripper (script tags, javascript: URLs,
 * inline event handlers). Defense-in-depth on top of React's default text
 * escaping — not a substitute for it.
 */
export function sanitizeObject<T>(value: T): T {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "") as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    const record = value as Record<string, unknown>;
    for (const key in record) {
      if (Object.prototype.hasOwnProperty.call(record, key)) {
        sanitized[key] = sanitizeObject(record[key]);
      }
    }
    return sanitized as T;
  }

  return value;
}
