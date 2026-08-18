import { NextRequest, NextResponse } from "next/server";
import { verifyMembership } from "@/lib/verifyMembership";

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

    const res = NextResponse.json({ success: true });
    res.cookies.set("aw_session", email.toLowerCase(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
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
