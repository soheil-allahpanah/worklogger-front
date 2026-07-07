"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { getDisplayName, getInitials } from "@/lib/worklog-utils";

export function DashboardHeader({ loginLabel }: { loginLabel: string }) {
  const displayName = getDisplayName(loginLabel);
  const initials = getInitials(displayName);

  return (
    <header className="flex items-center justify-between border-b border-border pb-2">
      <h1 className="text-xl font-bold text-foreground">Worklogs Dashboard</h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground">{displayName}</span>
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="icon" className="h-8 w-8" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
