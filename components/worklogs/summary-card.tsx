import { TagBadge } from "@/components/worklogs/tag-badge";
import { formatTotalDuration } from "@/lib/worklog-utils";
import type {
  WorklogDto,
  WorklogFilterStatisticsDto,
} from "@/src/entities/worklog/worklog.schema";

export function SummaryCard({
  statistics,
  worklogs,
  totalItems,
  onTagClick,
}: {
  statistics: WorklogFilterStatisticsDto;
  worklogs: WorklogDto[];
  totalItems: number;
  onTagClick?: (tag: string) => void;
}) {
  const tags = [...new Set(worklogs.flatMap((w) => w.tags))].slice(0, 8);

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Filtered Summary
      </p>
      <p className="text-2xl font-semibold text-foreground">
        {formatTotalDuration(statistics.totalDurationSecs)}
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Days worked</dt>
          <dd className="font-medium text-foreground">{statistics.daysWorked}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Total logs</dt>
          <dd className="font-medium text-foreground">{totalItems}</dd>
        </div>
      </dl>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onClick={onTagClick} />
          ))}
        </div>
      )}
    </div>
  );
}
