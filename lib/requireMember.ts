import { NextRequest, NextResponse } from "next/server";
import { readSessionEmail, SESSION_COOKIE } from "./session";

/**
 * Gate for the paid API routes.
 *
 * The consultant, daily-intelligence and monthly-report endpoints each spend
 * a Gemini call on every request. Until this existed, any of them could be
 * called by anyone with curl, which meant the paid features were free and the
 * bill was not. Every one of them now starts with:
 *
 *   const denied = requireMember(req);
 *   if (denied) return denied;
 */
export function requireMember(req: NextRequest): NextResponse | null {
  const email = readSessionEmail(req.cookies.get(SESSION_COOKIE)?.value);

  if (!email) {
    return NextResponse.json(
      { error: "Sign in with the email you used at checkout." },
      { status: 401 }
    );
  }

  return null;
}

/** The signed-in member's email, or null. */
export function memberEmail(req: NextRequest): string | null {
  return readSessionEmail(req.cookies.get(SESSION_COOKIE)?.value);
}
