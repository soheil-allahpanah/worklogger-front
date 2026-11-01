"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Calendar, Plus, Star, X } from "lucide-react";
import { useSearchQuery } from "@/components/layout/search-query-provider";
import { QUICK_FILTER_TAG_STYLES } from "@/lib/tag-colors";
import { parseSavedFilters, SAVED_FILTERS_KEY, type SavedFilter } from "@/lib/saved-filters";
import {
  DATE_PRESET_LABELS,
  DATE_PRESETS,
  jalaliRangeFor,
  matchDatePreset,
  type DatePreset,
} from "@/lib/jalali-range";
import { cn } from "@/lib/utils";
import {
  parseSearchQuery,
  queryHasTag,
  toggleTagInSearchQuery,
  withDateRange,
} from "@/lib/worklog-utils";

const QUICK_TAGS = ["mahak", "trading", "linux"] as const;
const SAVED_FILTERS_EVENT = "wl-saved-filters-change";

function subscribeSavedFilters(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SAVED_FILTERS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SAVED_FILTERS_EVENT, callback);
  };
}

function savedFiltersSnapshot() {
  return localStorage.getItem(SAVED_FILTERS_KEY) ?? "";
}

export function QuickFilters() {
  const { search, commitSearch } = useSearchQuery();
  const storedFilters = useSyncExternalStore(
    subscribeSavedFilters,
    savedFiltersSnapshot,
    () => "",
  );
  const saved = useMemo(() => parseSavedFilters(storedFilters || null), [storedFilters]);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const parsed = parseSearchQuery(search);
  const activePreset = matchDatePreset(parsed.date?.from, parsed.date?.to);

  function persist(next: SavedFilter[]) {
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_FILTERS_EVENT));
  }

  function applyPreset(preset: DatePreset) {
    const range = jalaliRangeFor(preset);
    commitSearch(withDateRange(search, range.from, range.to));
  }

  function saveCurrent(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const query = search.trim();
    if (!trimmedName || !query) return;
    persist([
      ...saved,
      { id: crypto.randomUUID(), name: trimmedName.slice(0, 40), query },
    ].slice(-20));
    setName("");
    setNaming(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-xs font-semibold text-muted-foreground">Quick filters</p>
      {DATE_PRESETS.map((preset) => {
        const active = activePreset === preset;
        return (
          <button
            key={preset}
            type="button"
            aria-pressed={active}
            onClick={() => applyPreset(preset)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors",
              active
                ? "bg-primary font-semibold text-white"
                : "border border-border bg-surface font-medium text-foreground hover:bg-surface-elevated",
            )}
          >
            {preset === "today" && <Calendar className="h-3.5 w-3.5" />}
            {DATE_PRESET_LABELS[preset]}
          </button>
        );
      })}

      <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" aria-hidden />

      {QUICK_TAGS.map((tag) => {
        const active = queryHasTag(search, tag);
        const colors = QUICK_FILTER_TAG_STYLES[tag];
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={active}
            onClick={() => commitSearch(toggleTagInSearchQuery(search, tag))}
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity",
              colors.bg,
              colors.border,
              colors.text,
              active ? "opacity-100 ring-2 ring-primary/40" : "opacity-80 hover:opacity-100",
            )}
          >
            #{tag}
          </button>
        );
      })}

      <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" aria-hidden />

      <button
        type="button"
        onClick={() => commitSearch("")}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
        Clear
      </button>

      <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" aria-hidden />

      {saved.map((filter) => {
        const active = search.trim() === filter.query;
        return (
          <span
            key={filter.id}
            className={cn(
              "inline-flex items-center rounded-full border text-[13px]",
              active
                ? "border-primary bg-primary-soft text-foreground"
                : "border-dashed border-border text-muted-foreground",
            )}
          >
            <button
              type="button"
              onClick={() => commitSearch(filter.query)}
              className="inline-flex items-center gap-1.5 py-1.5 pl-3 pr-1"
            >
              <Star className="h-3.5 w-3.5" />
              {filter.name}
            </button>
            <button
              type="button"
              aria-label={`Remove saved filter ${filter.name}`}
              onClick={() => persist(saved.filter((entry) => entry.id !== filter.id))}
              className="pr-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      {naming ? (
        <form onSubmit={saveCurrent} className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Filter name"
            aria-label="Saved filter name"
            maxLength={40}
            className="h-8 w-36 rounded-full border border-border bg-surface px-3 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={!name.trim() || !search.trim()}
            className="rounded-full px-2 py-1 text-[13px] font-medium text-primary-soft-foreground disabled:opacity-40"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setNaming(false);
              setName("");
            }}
            className="rounded-full px-2 py-1 text-[13px] text-muted-foreground"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setNaming(true)}
          disabled={!search.trim()}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-[13px] font-medium text-primary-soft-foreground transition-opacity disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Save filter
        </button>
      )}
    </div>
  );
}
