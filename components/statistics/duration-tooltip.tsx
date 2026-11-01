"use client";

import { formatDuration } from "@/lib/worklog-utils";

export function formatStatDuration(secs: number): string {
  if (!Number.isFinite(secs) || secs <= 0) return "0m";
  return formatDuration(Math.round(secs));
}

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { date?: string; tag?: string; label?: string };
};

export function DurationTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  const title =
    (typeof label === "string" && label) ||
    payload[0]?.payload?.date ||
    payload[0]?.payload?.tag ||
    "";
  const rows = payload.filter((entry) => Number(entry.value) > 0);

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      {title ? <p className="mb-1 font-medium text-foreground">{title}</p> : null}
      {(rows.length > 0 ? rows : payload).map((entry) => (
        <p key={String(entry.name)} className="text-muted-foreground">
          <span style={{ color: entry.color }}>{entry.name}</span>
          {": "}
          {formatStatDuration(Number(entry.value))}
        </p>
      ))}
    </div>
  );
}
