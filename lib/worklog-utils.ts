import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import { toJalaali } from "jalaali-js";

const TAG_REGEX = /#([\w-]+)/g;
const JALALI_DATE_PART = String.raw`\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{8}`;
const DURATION_PART = String.raw`\d+h(?:\d+m)?|\d+m|\d+s`;

/** Normalize duration input to a standard token the API accepts (e.g. 2h, 30m, 2h30m). */
export function normalizeDuration(input: string): string | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized.match(/^(?:\d+h(?:\d+m)?|\d+m|\d+s)$/)) {
    return null;
  }

  return parseDurationToSecs(normalized) ? normalized : null;
}

function extractDurationFilter(remaining: string): {
  durationFilter?: { from?: string; to?: string };
  rest: string;
} {
  const cleanup = (value: string) => value.replace(/\s+/g, " ").trim();

  const fullRange = remaining.match(
    new RegExp(String.raw`\b(${DURATION_PART})\.\.(${DURATION_PART})\b`, "i"),
  );
  if (fullRange) {
    const from = normalizeDuration(fullRange[1]);
    const to = normalizeDuration(fullRange[2]);
    if (from && to) {
      return {
        durationFilter: { from, to },
        rest: cleanup(remaining.replace(fullRange[0], " ")),
      };
    }
  }

  const sinceRange = remaining.match(
    new RegExp(String.raw`\b(${DURATION_PART})\.\.(?!\d)`, "i"),
  );
  if (sinceRange) {
    const from = normalizeDuration(sinceRange[1]);
    if (from) {
      return {
        durationFilter: { from },
        rest: cleanup(remaining.replace(sinceRange[0], " ")),
      };
    }
  }

  const untilRange = remaining.match(
    new RegExp(String.raw`\.\.(${DURATION_PART})\b`, "i"),
  );
  if (untilRange) {
    const to = normalizeDuration(untilRange[1]);
    if (to) {
      return {
        durationFilter: { to },
        rest: cleanup(remaining.replace(untilRange[0], " ")),
      };
    }
  }

  const single = remaining.match(new RegExp(String.raw`\b(${DURATION_PART})\b`, "i"));
  if (single) {
    const duration = normalizeDuration(single[1]);
    if (duration) {
      return {
        durationFilter: { from: duration, to: duration },
        rest: cleanup(remaining.replace(single[0], " ")),
      };
    }
  }

  return { rest: remaining };
}

/** Normalize flexible Jalali input to YYYY/MM/DD for the API. */
export function normalizeJalaliDate(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const compact = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    return formatJalaliDate(compact[1], compact[2], compact[3]);
  }

  const separated = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (separated) {
    return formatJalaliDate(separated[1], separated[2], separated[3]);
  }

  return null;
}

function formatJalaliDate(year: string, month: string, day: string): string | null {
  const y = Number.parseInt(year, 10);
  const m = Number.parseInt(month, 10);
  const d = Number.parseInt(day, 10);

  if (y < 1300 || y > 1500 || m < 1 || m > 12 || d < 1 || d > 31) {
    return null;
  }

  return `${String(y).padStart(4, "0")}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
}

function extractDateFilter(remaining: string): {
  dateFilter?: { from?: string; to?: string };
  rest: string;
} {
  const cleanup = (value: string) => value.replace(/\s+/g, " ").trim();

  const fullRange = remaining.match(
    new RegExp(String.raw`\b(${JALALI_DATE_PART})\.\.(${JALALI_DATE_PART})\b`),
  );
  if (fullRange) {
    const from = normalizeJalaliDate(fullRange[1]);
    const to = normalizeJalaliDate(fullRange[2]);
    if (from && to) {
      return {
        dateFilter: { from, to },
        rest: cleanup(remaining.replace(fullRange[0], " ")),
      };
    }
  }

  const sinceRange = remaining.match(
    new RegExp(String.raw`\b(${JALALI_DATE_PART})\.\.(?!\d)`),
  );
  if (sinceRange) {
    const from = normalizeJalaliDate(sinceRange[1]);
    if (from) {
      return {
        dateFilter: { from },
        rest: cleanup(remaining.replace(sinceRange[0], " ")),
      };
    }
  }

  const untilRange = remaining.match(
    new RegExp(String.raw`\.\.(${JALALI_DATE_PART})\b`),
  );
  if (untilRange) {
    const to = normalizeJalaliDate(untilRange[1]);
    if (to) {
      return {
        dateFilter: { to },
        rest: cleanup(remaining.replace(untilRange[0], " ")),
      };
    }
  }

  const single = remaining.match(new RegExp(String.raw`\b(${JALALI_DATE_PART})\b`));
  if (single) {
    const date = normalizeJalaliDate(single[1]);
    if (date) {
      return {
        dateFilter: { from: date, to: date },
        rest: cleanup(remaining.replace(single[0], " ")),
      };
    }
  }

  return { rest: remaining };
}

/** Today's Jalali date in Asia/Tehran, formatted as YYYY/MM/DD (matches the API default). */
export function todayJalaliInTehran(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  const { jy, jm, jd } = toJalaali(year, month, day);

  return `${String(jy).padStart(4, "0")}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

export function parseSearchQuery(query: string): FilterWorklogsInput {
  const trimmed = query.trim();
  if (!trimmed) {
    return { paging: { page: 1, size: 50 } };
  }

  const tags: string[] = [];
  let remaining = trimmed;

  for (const match of trimmed.matchAll(TAG_REGEX)) {
    if (match[1]) tags.push(match[1]);
    remaining = remaining.replace(match[0], " ");
  }

  remaining = remaining.replace(/\s+/g, " ").trim();

  const filter: FilterWorklogsInput = {
    paging: { page: 1, size: 50 },
  };

  if (tags.length > 0) {
    filter.tags = { in_list: tags };
  }

  const { dateFilter, rest: afterDate } = extractDateFilter(remaining);
  if (dateFilter) {
    filter.date = dateFilter;
  }
  remaining = afterDate;

  const { durationFilter, rest: afterDuration } = extractDurationFilter(remaining);
  if (durationFilter) {
    filter.duration = durationFilter;
  }
  remaining = afterDuration;

  if (remaining.length > 0) {
    filter.description = { contains: remaining };
  }

  return filter;
}

/** Append `#tag` to a search query if that tag is not already included. */
export function appendTagToSearchQuery(query: string, tag: string): string {
  const normalizedTag = tag.trim().replace(/^#/, "");
  if (!normalizedTag) return query;

  const existingTags = new Set<string>();
  for (const match of query.matchAll(TAG_REGEX)) {
    if (match[1]) existingTags.add(match[1].toLowerCase());
  }

  if (existingTags.has(normalizedTag.toLowerCase())) {
    return query;
  }

  const trimmed = query.trim();
  return trimmed ? `${trimmed} #${normalizedTag}` : `#${normalizedTag}`;
}

export function formatDuration(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${secs}s`;
}

export function formatTotalDuration(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours} hrs ${minutes} mins`;
  if (hours > 0) return `${hours} hrs`;
  return `${minutes} mins`;
}

export function parseDurationToHoursMinutes(secs: number): {
  hours: string;
  minutes: string;
} {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  return {
    hours: hours.toString(),
    minutes: minutes.toString(),
  };
}

export function parseDurationToSecs(input: string): number | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;

  let total = 0;
  const hourMatch = normalized.match(/(\d+)h/);
  const minMatch = normalized.match(/(\d+)m/);
  const secMatch = normalized.match(/(\d+)s/);

  if (hourMatch) total += parseInt(hourMatch[1], 10) * 3600;
  if (minMatch) total += parseInt(minMatch[1], 10) * 60;
  if (secMatch) total += parseInt(secMatch[1], 10);

  if (!hourMatch && !minMatch && !secMatch) {
    const asNumber = parseInt(normalized, 10);
    if (!Number.isNaN(asNumber)) return asNumber;
    return null;
  }

  return total > 0 ? total : null;
}

export function getInitials(label: string): string {
  const parts = label.split(/[@.\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return label.slice(0, 2).toUpperCase();
}

export function getDisplayName(label: string): string {
  const local = label.split("@")[0];
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function computeTopTagsByHours(
  worklogs: { tags: string[]; durationSecs: number }[],
  limit = 20,
): { tag: string; durationSecs: number }[] {
  const totals = new Map<string, number>();

  for (const worklog of worklogs) {
    for (const tag of worklog.tags) {
      totals.set(tag, (totals.get(tag) ?? 0) + worklog.durationSecs);
    }
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, durationSecs]) => ({ tag, durationSecs }));
}

export function groupLabelForDate(jalaliDate: string, datetime: string): string {
  const date = new Date(datetime);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  if (isToday) return `Today, ${formatted}`;
  return `${jalaliDate} · ${formatted}`;
}
