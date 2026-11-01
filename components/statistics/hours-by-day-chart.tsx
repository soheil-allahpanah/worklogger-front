"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DurationTooltip } from "@/components/statistics/duration-tooltip";
import { PROJECT_GROUPS, type DayBucket } from "@/lib/statistics";

export function HoursByDayChart({ days }: { days: DayBucket[] }) {
  const hasData = days.some((day) => day.total > 0);

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Hours per day by project</h2>
        <ul className="flex flex-wrap gap-3">
          {PROJECT_GROUPS.map((group) => (
            <li
              key={group.key}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: group.color }}
                aria-hidden
              />
              {group.label}
            </li>
          ))}
        </ul>
      </header>
      {hasData ? (
        <div className="h-[220px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={days.length > 16 ? Math.ceil(days.length / 10) : 0}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--surface-elevated)" }}
                content={<DurationTooltip />}
              />
              {PROJECT_GROUPS.map((group) => (
                <Bar
                  key={group.key}
                  dataKey={group.key}
                  name={group.label}
                  stackId="hours"
                  fill={group.color}
                  maxBarSize={36}
                  radius={group.key === "other" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          No hours in this range
        </p>
      )}
    </section>
  );
}
