"use client";

import { getTagColor } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { TagStatDto } from "@/src/entities/worklog/tag-stats.schema";

const MIN_FONT_REM = 0.7;
const MAX_FONT_REM = 1.5;
const DISPLAY_LIMIT = 20;

export function TagCloudCard({
  tags,
  isLoading,
  onTagClick,
}: {
  tags: TagStatDto[];
  isLoading?: boolean;
  onTagClick?: (tag: string) => void;
}) {
  const topTags = tags.slice(0, DISPLAY_LIMIT);
  const maxSecs = topTags[0]?.durationSecs ?? 1;

  return (
    <div className="flex h-36 flex-col rounded-xl border border-border bg-surface-elevated px-5 py-3">
      <p className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Top Tags
      </p>
      {isLoading ? (
        <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading tags...
        </p>
      ) : topTags.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No tags in current results
        </p>
      ) : (
        <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-x-3 gap-y-1 overflow-hidden">
          {topTags.map(({ tag, durationSecs, daysWorked }) => {
            const colors = getTagColor(tag);
            const scale = durationSecs / maxSecs;
            const fontSize = MIN_FONT_REM + scale * (MAX_FONT_REM - MIN_FONT_REM);
            const hours = Math.round((durationSecs / 3600) * 10) / 10;
            const title = `${tag}: ${hours}h over ${daysWorked} day${daysWorked === 1 ? "" : "s"}`;

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
                  title={title}
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
                title={title}
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
