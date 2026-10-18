import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signed session cookie.
 *
 * Before this file, `aw_session` held the member's email in plain text and
 * `/dashboard` let anyone in who had a non-empty cookie of that name. Setting
 * `aw_session=anything` in devtools was enough to open the paid tier, and the
 * paid API routes checked nothing at all. A signed token fixes both: the
 * server can tell a cookie it issued from one a visitor typed.
 *
 * Format: base64url(email) "." expiresAtSeconds "." HMAC-SHA256(payload)
 *
 * Requires AW_SESSION_SECRET. Generate one with:
 *
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * and set it in the Vercel project (all environments). Without it the module
 * fails closed - no token is issued and none is accepted - because a paywall
 * that degrades to open is not a paywall.
 */

export const SESSION_COOKIE = "aw_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

const MIN_SECRET_LENGTH = 32;

export function sessionSecretIsConfigured(): boolean {
  return getSecret() !== null;
}

function getSecret(): string | null {
  const secret = process.env.AW_SESSION_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Returns null when AW_SESSION_SECRET is missing - the caller must handle it. */
export function createSessionToken(email: string): string | null {
  const secret = getSecret();
  if (!secret) {
    console.error(
      "AW_SESSION_SECRET is not set (or is shorter than " +
        MIN_SECRET_LENGTH +
        " characters). Refusing to issue a session."
    );
    return null;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload =
    Buffer.from(email.trim().toLowerCase(), "utf8").toString("base64url") +
    "." +
    expiresAt;

  return payload + "." + sign(payload, secret);
}

/** The email this token was issued for, or null if it is forged or expired. */
export function readSessionEmail(token: string | undefined | null): string | null {
  const secret = getSecret();
  if (!secret || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedEmail, expiresAtRaw, providedSignature] = parts;
  const payload = encodedEmail + "." + expiresAtRaw;
  const expected = sign(payload, secret);

  const a = Buffer.from(providedSignature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return null;
  }

  const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
  return email.includes("@") ? email : null;
}
