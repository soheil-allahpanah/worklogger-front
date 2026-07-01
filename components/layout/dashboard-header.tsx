"use client";

import { Bell, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { getDisplayName, getInitials } from "@/lib/worklog-utils";

export function DashboardHeader({ loginLabel }: { loginLabel: string }) {
  const displayName = getDisplayName(loginLabel);
  const initials = getInitials(displayName);

  return (
    <header className="flex items-center justify-between border-b border-border pb-6">
      <h1 className="text-3xl font-bold text-foreground">Worklogs Dashboard</h1>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground">{displayName}</span>
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
