import { NextRequest, NextResponse } from "next/server";
import { verifyMembership } from "@/lib/verifyMembership";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/session";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  try {
    const isMember = await verifyMembership(email);
    if (!isMember) {
      return NextResponse.json(
        { error: "No active AstraWealth membership found for that email." },
        { status: 403 }
      );
    }

    // The cookie used to be the email in plain text, which meant anyone could
    // type one. It is now signed - see lib/session.ts.
    const token = createSessionToken(email);
    if (!token) {
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable. Please try again shortly." },
        { status: 503 }
      );
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("verifyMembership failed:", err);
    return NextResponse.json(
      { error: "Could not verify membership right now. Try again shortly." },
      { status: 502 }
    );
  }
}
