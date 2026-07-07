import { DashboardClient } from "@/components/worklogs/dashboard-client";
import { getLoginLabel } from "@/src/infrastructure/auth/cookies";

export default async function DashboardPage() {
  const loginLabel = (await getLoginLabel()) ?? "User";

  return <DashboardClient loginLabel={loginLabel} />;
}
