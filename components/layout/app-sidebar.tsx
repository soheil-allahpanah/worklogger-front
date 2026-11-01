"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Clock,
  List,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth.actions";
import { useSearchQuery } from "@/components/layout/search-query-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { hrefWithSearchQuery } from "@/lib/search-query";
import { cn } from "@/lib/utils";
import { getDisplayName, queryHasTag, toggleTagInSearchQuery } from "@/lib/worklog-utils";

const SIDEBAR_TAGS = [
  { tag: "mahak", color: "#22c55e" },
  { tag: "trading", color: "#f59e0b" },
  { tag: "linux", color: "#3b82f6" },
] as const;

export function AppSidebar({ loginLabel }: { loginLabel: string }) {
  const pathname = usePathname();
  const { search, commitSearch } = useSearchQuery();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const displayName = getDisplayName(loginLabel);
  const initial = displayName.includes(" ")
    ? displayName
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : displayName.slice(0, 1).toUpperCase();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCollapsed(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const worklogsActive = pathname.startsWith("/dashboard");
  const statisticsActive = pathname.startsWith("/statistics");
  const themeLabel = theme === "light" ? "Dark theme" : "Light theme";

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col gap-6 border-r border-border bg-sidebar py-4 transition-[width] duration-200",
        collapsed ? "w-[72px] px-2" : "w-60 px-4",
      )}
    >
      <div className={cn("flex items-center gap-2.5 pl-2 pt-2", collapsed && "justify-center px-0 pl-0")}>
        <Clock className="h-[22px] w-[22px] shrink-0 text-primary" aria-hidden />
        <span className={cn("text-lg font-bold text-foreground", collapsed && "sr-only")}>
          Worklogger
        </span>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Primary">
        <SidebarLink
          href={hrefWithSearchQuery("/dashboard", search)}
          label="Worklogs"
          active={worklogsActive}
          collapsed={collapsed}
          icon={<List className="h-[18px] w-[18px] shrink-0" />}
        />
        <SidebarLink
          href={hrefWithSearchQuery("/statistics", search)}
          label="Statistics"
          active={statisticsActive}
          collapsed={collapsed}
          icon={<BarChart3 className="h-[18px] w-[18px] shrink-0" />}
        />
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={cn(
            "mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
          )}
          <span className={cn(collapsed && "sr-only")}>{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </nav>

      <div className="flex flex-col gap-0.5">
        <p
          className={cn(
            "px-3 text-[11px] font-semibold tracking-[1px] text-muted-foreground",
            collapsed && "sr-only",
          )}
        >
          TAGS
        </p>
        {SIDEBAR_TAGS.map((item) => {
          const active = queryHasTag(search, item.tag);
          return (
            <button
              key={item.tag}
              type="button"
              title={`Filter by #${item.tag}`}
              aria-pressed={active}
              onClick={() => commitSearch(toggleTagInSearchQuery(search, item.tag))}
              className={cn(
                "flex items-center gap-2.5 rounded-lg py-1.5 pl-3 text-[13px] text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground",
                collapsed && "justify-center px-0 pl-0",
                active && "bg-nav-active font-medium text-foreground",
              )}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className={cn(collapsed && "sr-only")}>{item.tag}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className={cn("flex flex-col gap-2 border-t border-border pt-3", collapsed && "items-center")}>
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          title={themeLabel}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4 shrink-0" />
          ) : (
            <Sun className="h-4 w-4 shrink-0" />
          )}
          <span className={cn(collapsed && "sr-only")}>{themeLabel}</span>
        </button>

        <div className={cn("flex items-center justify-between gap-2", collapsed && "flex-col")}>
          <div className="flex min-w-0 items-center gap-2.5" title={displayName}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-soft-foreground">
              {initial}
            </div>
            <span className={cn("truncate text-sm font-medium text-foreground", collapsed && "sr-only")}>
              {displayName}
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Log out"
              title="Logout"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn(collapsed && "sr-only")}>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  active,
  collapsed,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-nav-active font-semibold text-nav-active-foreground"
          : "font-medium text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
      )}
    >
      {icon}
      <span className={cn(collapsed && "sr-only")}>{label}</span>
    </Link>
  );
}
