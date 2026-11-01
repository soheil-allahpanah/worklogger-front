"use client";

import { formatStatDuration } from "@/components/statistics/duration-tooltip";
import { buildHeatmapWeeks, monthSpanLabel } from "@/lib/jalali-range";
import { heatLevel, type DayBucket } from "@/lib/statistics";

export function ActivityHeatmap({
  from,
  to,
  days,
}: {
  from: string;
  to: string;
  days: DayBucket[];
}) {
  const totals = new Map(days.map((day) => [day.date, day.total]));
  const weeks = buildHeatmapWeeks(from, to);
  const max = days.reduce((highest, day) => Math.max(highest, day.total), 0);
  const title = monthSpanLabel(from, to);

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Activity · {title}</h2>
      <div className="flex gap-1 overflow-x-auto" role="grid" aria-label={`Activity for ${title}`}>
        {weeks.map((column, columnIndex) => (
          <div key={column[0]?.jalali ?? `pad-${columnIndex}`} className="flex flex-col gap-1">
            {column.map((cell, rowIndex) =>
              cell ? (
                <span
                  key={cell.jalali}
                  role="gridcell"
                  title={`${cell.jalali}: ${formatStatDuration(totals.get(cell.jalali) ?? 0)}`}
                  className="h-[18px] w-[18px] rounded-[4px]"
                  style={{
                    backgroundColor: `var(--heat-${heatLevel(totals.get(cell.jalali) ?? 0, max)})`,
                  }}
                />
              ) : (
                <span key={`empty-${columnIndex}-${rowIndex}`} className="h-[18px] w-[18px]" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3].map((level) => (
          <span
            key={level}
            className="h-3 w-3 rounded-[3px]"
            style={{ backgroundColor: `var(--heat-${level})` }}
            aria-hidden
          />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
