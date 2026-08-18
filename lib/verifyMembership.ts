const PRODUCT_ID = "prod_rmcf99hfae56K";

export async function verifyMembership(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();

  const demoEmails = (process.env.DEMO_ACCESS_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (demoEmails.includes(normalizedEmail)) {
    return true;
  }

  const apiKey = process.env.WHOP_API_KEY;
  const companyId = process.env.WHOP_COMPANY_ID;

  if (!apiKey || !companyId) {
    throw new Error("Whop API credentials are not configured.");
  }

  let after: string | null = null;

  for (let page = 0; page < 20; page++) {
    const url = new URL("https://api.whop.com/api/v1/memberships");
    url.searchParams.set("company_id", companyId);
    url.searchParams.append("product_ids", PRODUCT_ID);
    url.searchParams.append("statuses", "active");
    url.searchParams.append("statuses", "trialing");
    url.searchParams.set("first", "50");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url.toString(), {
      headers: { Authorization: "Bearer " + apiKey },
    });

    if (!res.ok) {
      throw new Error("Whop membership lookup failed: " + res.status);
    }

    const data = await res.json();
    const items: any[] = data.data ?? [];

    const match = items.find(
      (m) => m.user && m.user.email && m.user.email.toLowerCase() === normalizedEmail
    );
    if (match) return true;

    if (!data.page_info || !data.page_info.has_next_page) break;
    after = data.page_info.end_cursor;
  }

  return false;
}
