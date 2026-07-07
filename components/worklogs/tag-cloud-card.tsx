"use client";

import { computeTopTagsByHours } from "@/lib/worklog-utils";
import { getTagColor } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { WorklogDto } from "@/src/entities/worklog/worklog.schema";

const MIN_FONT_REM = 0.7;
const MAX_FONT_REM = 1.5;

export function TagCloudCard({
  worklogs,
  onTagClick,
}: {
  worklogs: WorklogDto[];
  onTagClick?: (tag: string) => void;
}) {
  const tags = computeTopTagsByHours(worklogs, 20);
  const maxSecs = tags[0]?.durationSecs ?? 1;

  return (
    <div className="flex h-36 flex-col rounded-xl border border-border bg-surface-elevated px-5 py-3">
      <p className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Top Tags
      </p>
      {tags.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No tags in current results
        </p>
      ) : (
        <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-x-3 gap-y-1 overflow-hidden">
          {tags.map(({ tag, durationSecs }) => {
            const colors = getTagColor(tag);
            const scale = durationSecs / maxSecs;
            const fontSize = MIN_FONT_REM + scale * (MAX_FONT_REM - MIN_FONT_REM);

            if (onTagClick) {
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className={cn(
                    "font-medium leading-tight transition-opacity hover:opacity-80",
                    colors.text,
                  )}
                  style={{ fontSize: `${fontSize}rem` }}
                  title={`${tag}: ${Math.round(durationSecs / 3600 * 10) / 10}h`}
                  aria-label={`Filter by tag ${tag}`}
                >
                  #{tag}
                </button>
              );
            }

            return (
              <span
                key={tag}
                className={cn("font-medium leading-tight", colors.text)}
                style={{ fontSize: `${fontSize}rem` }}
              >
                #{tag}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
