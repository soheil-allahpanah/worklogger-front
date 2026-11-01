"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DurationTooltip, formatStatDuration } from "@/components/statistics/duration-tooltip";

export type TagBar = {
  tag: string;
  durationSecs: number;
  color: string;
};

export function TopTagsChart({ rows }: { rows: TagBar[] }) {
  return (
    <section className="flex h-full min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Top tags (hours)</h2>
      {rows.length === 0 ? (
        <p className="flex min-h-40 flex-1 items-center text-sm text-muted-foreground">No tags in this range</p>
      ) : (
        <div className="w-full min-w-0 flex-1" style={{ height: Math.max(rows.length * 36, 180) }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 480, height: Math.max(rows.length * 36, 180) }}
          >
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 0, right: 72, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="tag"
                width={108}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DurationTooltip />} />
              <Bar
                dataKey="durationSecs"
                name="Hours"
                radius={[0, 4, 4, 0]}
                barSize={14}
                isAnimationActive={false}
              >
                {rows.map((row) => (
                  <Cell key={row.tag} fill={row.color} />
                ))}
                <LabelList
                  dataKey="durationSecs"
                  position="right"
                  formatter={(value) => formatStatDuration(Number(value ?? 0))}
                  style={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
