import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import { SESSION_COOKIE, readSessionEmail } from "@/lib/session";

export default async function DashboardPage() {
  const cookieStore = await cookies();

  // Any non-empty cookie used to be enough to get in here. The value is now
  // signed, so a cookie the server did not issue is rejected.
  const email = readSessionEmail(cookieStore.get(SESSION_COOKIE)?.value);

  if (!email) {
    redirect("/welcome");
  }

  return <DashboardClient email={email} />;
}
