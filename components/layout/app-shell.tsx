"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SearchQueryProvider } from "@/components/layout/search-query-provider";

export function AppShell({
  loginLabel,
  children,
}: {
  loginLabel: string;
  children: React.ReactNode;
}) {
  return (
    <SearchQueryProvider>
      <div className="flex h-dvh min-h-screen overflow-hidden bg-background">
        <AppSidebar loginLabel={loginLabel} />
        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </SearchQueryProvider>
  );
}
