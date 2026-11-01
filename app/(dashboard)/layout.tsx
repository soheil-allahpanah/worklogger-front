import { AppShell } from "@/components/layout/app-shell";
import { getLoginLabel } from "@/src/infrastructure/auth/cookies";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loginLabel = (await getLoginLabel()) ?? "User";

  return <AppShell loginLabel={loginLabel}>{children}</AppShell>;
}
