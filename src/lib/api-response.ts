import { NextResponse } from "next/server";

/**
 * Logs the real error server-side and returns a generic client-facing
 * message, so internal error strings (DB errors, filesystem errors, etc.)
 * never leak to callers.
 */
export function serverError(
  context: string,
  err: unknown,
  publicMessage = "Something went wrong. Please try again."
) {
  console.error(context, err instanceof Error ? err.message : err);
  return NextResponse.json({ error: publicMessage }, { status: 500 });
}
