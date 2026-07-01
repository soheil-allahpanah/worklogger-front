import { TagBadge } from "@/components/worklogs/tag-badge";
import { formatTotalDuration } from "@/lib/worklog-utils";
import type { WorklogDto } from "@/src/entities/worklog/worklog.schema";

export function SummaryCard({ worklogs }: { worklogs: WorklogDto[] }) {
  const totalSecs = worklogs.reduce((sum, w) => sum + w.durationSecs, 0);
  const tags = [...new Set(worklogs.flatMap((w) => w.tags))].slice(0, 8);

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Total Time (This Week)
      </p>
      <p className="mb-4 text-2xl font-semibold text-foreground">
        {formatTotalDuration(totalSecs)}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
