import { formatTotalDuration } from "@/lib/worklog-utils";
import type { WorklogFilterStatisticsDto } from "@/src/entities/worklog/worklog.schema";

export function StatsSummaryCard({
  statistics,
  totalItems,
}: {
  statistics: WorklogFilterStatisticsDto;
  totalItems: number;
}) {
  return (
    <div className="flex h-36 flex-col justify-center rounded-xl border border-border bg-surface-elevated px-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Summary
      </p>
      <p className="text-2xl font-semibold text-foreground">
        {formatTotalDuration(statistics.totalDurationSecs)}
      </p>
      <dl className="mt-3 flex gap-6 text-sm">
        <div>
          <dt className="text-muted-foreground">Days</dt>
          <dd className="font-medium text-foreground">{statistics.daysWorked}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Count</dt>
          <dd className="font-medium text-foreground">{totalItems}</dd>
        </div>
      </dl>
    </div>
  );
}
