"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { DurationTooltip, formatStatDuration } from "@/components/statistics/duration-tooltip";
import { percentShares, PROJECT_GROUPS, type ProjectKey } from "@/lib/statistics";

export function ProjectShareChart({
  totals,
  totalSecs,
}: {
  totals: Record<ProjectKey, number>;
  totalSecs: number;
}) {
  const values = PROJECT_GROUPS.map((group) => totals[group.key]);
  const percents = percentShares(values);
  const slices = PROJECT_GROUPS.map((group, index) => ({
    key: group.key,
    label: group.label,
    color: group.color,
    secs: totals[group.key],
    percent: percents[index] ?? 0,
  }));
  const visible = slices.filter((slice) => slice.secs > 0);
  const legend = [...slices].sort((a, b) => b.secs - a.secs || a.label.localeCompare(b.label));

  return (
    <section className="flex h-full min-w-0 w-full flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Project share</h2>
      {totalSecs <= 0 ? (
        <p className="flex min-h-40 flex-1 items-center text-sm text-muted-foreground">No hours in this range</p>
      ) : (
        <div className="flex min-h-40 flex-1 flex-wrap items-center gap-5">
          <div className="relative h-40 w-40 shrink-0">
            <PieChart width={160} height={160}>
              <Pie
                data={visible}
                dataKey="secs"
                nameKey="label"
                cx={80}
                cy={80}
                innerRadius={52}
                outerRadius={72}
                paddingAngle={visible.length > 1 ? 2 : 0}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {visible.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip content={<DurationTooltip />} />
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-sm font-bold text-foreground">
              {formatStatDuration(totalSecs)}
            </div>
          </div>
          <ul className="flex flex-col gap-2 text-xs text-foreground">
            {legend.map((item) => (
              <li key={item.key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                {item.label} {item.percent}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
