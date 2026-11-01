import {
  eachJalaliDay,
  jalaliRangeFor,
  orderedRange,
  type JalaliRange,
} from "@/lib/jalali-range";

export const PROJECT_GROUPS = [
  { key: "mahak", label: "Mahak", color: "#22c55e" },
  { key: "trading", label: "Trading", color: "#f59e0b" },
  { key: "linux", label: "Linux", color: "#3b82f6" },
  { key: "other", label: "Other", color: "#94a3b8" },
] as const;

export type ProjectKey = (typeof PROJECT_GROUPS)[number]["key"];

export type StatsWorklog = {
  jalaliDate: string;
  durationSecs: number;
  tags: string[];
};

export type DayBucket = {
  date: string;
  label: string;
  mahak: number;
  trading: number;
  linux: number;
  other: number;
  total: number;
};

const PROJECT_KEYS: ProjectKey[] = ["mahak", "trading", "linux", "other"];

export function projectColor(key: ProjectKey): string {
  return PROJECT_GROUPS.find((group) => group.key === key)?.color ?? "#94a3b8";
}

/** Split a worklog across the project tags it carries. Unmatched logs go to Other. */
export function projectKeysForTags(tags: string[]): ProjectKey[] {
  const lower = new Set(tags.map((tag) => tag.toLowerCase()));
  const matched = (["mahak", "trading", "linux"] as const).filter((key) => lower.has(key));
  return matched.length > 0 ? [...matched] : ["other"];
}

export function chartDomain(
  date: { from?: string; to?: string } | undefined,
  itemDates: string[],
  now = new Date(),
): JalaliRange {
  const today = jalaliRangeFor("today", now).from;
  if (date?.from && date?.to) return orderedRange(date.from, date.to);
  if (date?.from) return orderedRange(date.from, today);
  if (date?.to) {
    const earliest = [...itemDates].sort()[0] ?? date.to;
    return orderedRange(earliest, date.to);
  }
  const sorted = [...itemDates].filter(Boolean).sort();
  if (sorted.length > 0) return orderedRange(sorted[0]!, sorted[sorted.length - 1]!);
  return jalaliRangeFor("this-week", now);
}

export function aggregateDays(items: StatsWorklog[], domain: JalaliRange): DayBucket[] {
  const days = eachJalaliDay(domain.from, domain.to);
  const buckets = new Map<string, DayBucket>();

  for (const day of days) {
    buckets.set(day, {
      date: day,
      label: day.slice(5),
      mahak: 0,
      trading: 0,
      linux: 0,
      other: 0,
      total: 0,
    });
  }

  for (const item of items) {
    const bucket = buckets.get(item.jalaliDate);
    if (!bucket) continue;
    const keys = projectKeysForTags(item.tags);
    const share = item.durationSecs / keys.length;
    for (const key of keys) bucket[key] += share;
    bucket.total += item.durationSecs;
  }

  return days.map((day) => buckets.get(day)!);
}

export function projectTotals(days: DayBucket[]): Record<ProjectKey, number> {
  const totals: Record<ProjectKey, number> = { mahak: 0, trading: 0, linux: 0, other: 0 };
  for (const day of days) {
    for (const key of PROJECT_KEYS) totals[key] += day[key];
  }
  return totals;
}

export function busiestDay(days: DayBucket[]): { date: string; durationSecs: number } | null {
  let best: { date: string; durationSecs: number } | null = null;
  for (const day of days) {
    if (day.total <= 0) continue;
    if (
      !best ||
      day.total > best.durationSecs ||
      (day.total === best.durationSecs && day.date < best.date)
    ) {
      best = { date: day.date, durationSecs: day.total };
    }
  }
  return best;
}

/** Largest-remainder rounding so the displayed shares add up to 100. */
export function percentShares(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);

  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (const entry of order) {
    if (remainder <= 0) break;
    floors[entry.index] += 1;
    remainder -= 1;
  }

  return floors;
}

export function periodDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function dominantProject(tag: string, items: StatsWorklog[]): ProjectKey {
  const known = (["mahak", "trading", "linux"] as const).find(
    (project) => project === tag.toLowerCase(),
  );
  if (known) return known;

  const totals: Record<ProjectKey, number> = { mahak: 0, trading: 0, linux: 0, other: 0 };
  const needle = tag.toLowerCase();
  for (const item of items) {
    if (!item.tags.some((entry) => entry.toLowerCase() === needle)) continue;
    const keys = projectKeysForTags(item.tags);
    const share = item.durationSecs / keys.length;
    for (const key of keys) totals[key] += share;
  }

  let winner: ProjectKey = "other";
  let best = 0;
  for (const key of PROJECT_KEYS) {
    if (totals[key] > best) {
      best = totals[key];
      winner = key;
    }
  }
  return winner;
}

export function heatLevel(durationSecs: number, maxSecs: number): 0 | 1 | 2 | 3 {
  if (durationSecs <= 0 || maxSecs <= 0) return 0;
  const ratio = durationSecs / maxSecs;
  if (ratio < 0.34) return 1;
  if (ratio < 0.67) return 2;
  return 3;
}
