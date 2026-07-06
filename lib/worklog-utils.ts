import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import { toJalaali } from "jalaali-js";

const TAG_REGEX = /#([\w-]+)/g;
const JALALI_DATE_REGEX = /\b(\d{4}[/-]\d{2}[/-]\d{2})\b/;

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

  const dateMatch = remaining.match(JALALI_DATE_REGEX);
  if (dateMatch) {
    const normalized = dateMatch[1].replace(/-/g, "/");
    filter.date = { from: normalized, to: normalized };
    remaining = remaining.replace(dateMatch[0], "").trim();
  }

  const durationMatch = remaining.match(/\b(\d+h(?:\d+m)?|\d+m|\d+s)\b/i);
  if (durationMatch) {
    filter.duration = { from: durationMatch[1], to: durationMatch[1] };
    remaining = remaining.replace(durationMatch[0], "").trim();
  }

  if (remaining.length > 0) {
    filter.description = { contains: remaining };
  }

  return filter;
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
