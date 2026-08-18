import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("aw_session");

  if (!session || !session.value) {
    redirect("/welcome");
  }

  return <DashboardClient email={session.value} />;
}
