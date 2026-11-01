"use client";

import { useState } from "react";
import { useSearchQuery } from "@/components/layout/search-query-provider";
import {
  DATE_PRESET_LABELS,
  DATE_PRESETS,
  jalaliRangeFor,
  matchDatePreset,
  type DatePreset,
} from "@/lib/jalali-range";
import { cn } from "@/lib/utils";
import { normalizeJalaliDate, withDateRange } from "@/lib/worklog-utils";

const RANGE_TEXT =
  /^(\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{8})\s*(?:\.\.|–|—)\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{8})$/;

export function StatisticsRangePicker({ from, to }: { from: string; to: string }) {
  const { setSearch } = useSearchQuery();
  const [draft, setDraft] = useState<string | null>(null);
  const active = matchDatePreset(from, to);
  const shown = draft ?? `${from} – ${to}`;

  function applyPreset(preset: DatePreset) {
    const range = jalaliRangeFor(preset);
    setDraft(null);
    setSearch((current) => withDateRange(current, range.from, range.to));
  }

  function commit(value: string) {
    const match = value.trim().match(RANGE_TEXT);
    if (!match) {
      setDraft(null);
      return;
    }
    const start = normalizeJalaliDate(match[1]);
    const end = normalizeJalaliDate(match[2]);
    if (!start || !end) {
      setDraft(null);
      return;
    }
    setDraft(null);
    setSearch((current) => withDateRange(current, start, end));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex flex-wrap rounded-lg bg-segment-track p-[3px]"
        role="group"
        aria-label="Quick ranges"
      >
        {DATE_PRESETS.map((preset) => {
          const selected = active === preset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={selected}
              onClick={() => applyPreset(preset)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] transition-colors",
                selected
                  ? "bg-segment-active font-semibold text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  : "font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {DATE_PRESET_LABELS[preset]}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={active === null}
          onClick={() => document.getElementById("stats-range")?.focus()}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] transition-colors",
            active === null
              ? "bg-segment-active font-semibold text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Custom
        </button>
      </div>
      <input
        id="stats-range"
        value={shown}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== null) commit(draft);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && draft !== null) {
            event.preventDefault();
            commit(draft);
          }
        }}
        aria-label="Jalali date range"
        spellCheck={false}
        className="h-8 min-w-[210px] rounded-lg border border-border bg-surface px-3 text-[13px] text-muted-foreground outline-none focus:text-foreground focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}
