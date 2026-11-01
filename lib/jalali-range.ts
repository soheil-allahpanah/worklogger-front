import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

export type JalaliParts = { jy: number; jm: number; jd: number };
export type JalaliRange = { from: string; to: string };
export type DatePreset = "today" | "this-week" | "this-month" | "last-month";

export const DATE_PRESETS: DatePreset[] = [
  "today",
  "this-week",
  "this-month",
  "last-month",
];

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: "Today",
  "this-week": "This week",
  "this-month": "This month",
  "last-month": "Last month",
};

export const JALALI_MONTHS = [
  "Farvardin",
  "Ordibehesht",
  "Khordad",
  "Tir",
  "Mordad",
  "Shahrivar",
  "Mehr",
  "Aban",
  "Azar",
  "Dey",
  "Bahman",
  "Esfand",
] as const;

export function formatJalaliParts(jy: number, jm: number, jd: number): string {
  return `${String(jy).padStart(4, "0")}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

export function parseJalaliDate(value: string): JalaliParts | null {
  const match = value.trim().match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);
  if (jm < 1 || jm > 12) return null;
  const length = jalaaliMonthLength(jy, jm);
  if (jd < 1 || jd > length) return null;
  return { jy, jm, jd };
}

function tehranGregorian(now: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

/** UTC noon of the Tehran civil date, so adding days does not cross a DST boundary. */
export function tehranCivilUtc(now: Date): Date {
  const { year, month, day } = tehranGregorian(now);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function jalaliPartsFromUtc(date: Date): JalaliParts {
  return toJalaali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function utcFromJalali(parts: JalaliParts): Date {
  const { gy, gm, gd } = toGregorian(parts.jy, parts.jm, parts.jd);
  return new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0));
}

export function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function formatJalaliUtc(date: Date): string {
  const { jy, jm, jd } = jalaliPartsFromUtc(date);
  return formatJalaliParts(jy, jm, jd);
}

/** Saturday = 0 … Friday = 6. Iranian weeks start on Saturday. */
export function saturdayBasedWeekday(date: Date): number {
  return (date.getUTCDay() + 1) % 7;
}

export function todayJalali(now = new Date()): string {
  return formatJalaliUtc(tehranCivilUtc(now));
}

function shiftMonth(jy: number, jm: number, delta: number): { jy: number; jm: number } {
  const index = jy * 12 + (jm - 1) + delta;
  return { jy: Math.floor(index / 12), jm: (index % 12) + 1 };
}

export function jalaliRangeFor(preset: DatePreset, now = new Date()): JalaliRange {
  const today = tehranCivilUtc(now);
  if (preset === "today") {
    const date = formatJalaliUtc(today);
    return { from: date, to: date };
  }

  if (preset === "this-week") {
    const start = addUtcDays(today, -saturdayBasedWeekday(today));
    const end = addUtcDays(start, 6);
    return { from: formatJalaliUtc(start), to: formatJalaliUtc(end) };
  }

  const { jy, jm } = jalaliPartsFromUtc(today);
  const month = preset === "this-month" ? { jy, jm } : shiftMonth(jy, jm, -1);
  const length = jalaaliMonthLength(month.jy, month.jm);
  return {
    from: formatJalaliParts(month.jy, month.jm, 1),
    to: formatJalaliParts(month.jy, month.jm, length),
  };
}

export function matchDatePreset(
  from: string | undefined,
  to: string | undefined,
  now = new Date(),
): DatePreset | null {
  if (!from || !to) return null;
  for (const preset of DATE_PRESETS) {
    const range = jalaliRangeFor(preset, now);
    if (range.from === from && range.to === to) return preset;
  }
  return null;
}

export function orderedRange(from: string, to: string): JalaliRange {
  return from <= to ? { from, to } : { from: to, to: from };
}

export function eachJalaliDay(from: string, to: string, limit = 400): string[] {
  const startParts = parseJalaliDate(from);
  const endParts = parseJalaliDate(to);
  if (!startParts || !endParts) return [];

  const range = orderedRange(from, to);
  let cursor = utcFromJalali(parseJalaliDate(range.from)!);
  const last = utcFromJalali(parseJalaliDate(range.to)!);
  const days: string[] = [];

  while (cursor.getTime() <= last.getTime() && days.length < limit) {
    days.push(formatJalaliUtc(cursor));
    cursor = addUtcDays(cursor, 1);
  }

  return days;
}

export function previousRange(range: JalaliRange): JalaliRange {
  const length = Math.max(eachJalaliDay(range.from, range.to).length, 1);
  const start = utcFromJalali(parseJalaliDate(orderedRange(range.from, range.to).from)!);
  const prevEnd = addUtcDays(start, -1);
  const prevStart = addUtcDays(prevEnd, -(length - 1));
  return { from: formatJalaliUtc(prevStart), to: formatJalaliUtc(prevEnd) };
}

export function monthSpanLabel(from: string, to: string): string {
  const start = parseJalaliDate(from);
  const end = parseJalaliDate(to);
  if (!start || !end) return "";

  const ordered = from <= to ? { start, end } : { start: end, end: start };
  const startName = JALALI_MONTHS[ordered.start.jm - 1];
  const endName = JALALI_MONTHS[ordered.end.jm - 1];

  if (ordered.start.jy === ordered.end.jy && ordered.start.jm === ordered.end.jm) {
    return `${startName} ${ordered.start.jy}`;
  }
  if (ordered.start.jy === ordered.end.jy) {
    return `${startName}–${endName} ${ordered.start.jy}`;
  }
  return `${startName} ${ordered.start.jy} – ${endName} ${ordered.end.jy}`;
}

export type HeatCell = { jalali: string } | null;

/** Columns are weeks (Saturday on top). Cells outside the spanned months are null. */
export function buildHeatmapWeeks(from: string, to: string): HeatCell[][] {
  const start = parseJalaliDate(from);
  const end = parseJalaliDate(to);
  if (!start || !end) return [];

  const ordered = from <= to ? { start, end } : { start: end, end: start };
  const first = utcFromJalali({ jy: ordered.start.jy, jm: ordered.start.jm, jd: 1 });
  const lastLength = jalaaliMonthLength(ordered.end.jy, ordered.end.jm);
  const last = utcFromJalali({
    jy: ordered.end.jy,
    jm: ordered.end.jm,
    jd: lastLength,
  });
  const gridStart = addUtcDays(first, -saturdayBasedWeekday(first));
  const gridEnd = addUtcDays(last, 6 - saturdayBasedWeekday(last));
  const weeks: HeatCell[][] = [];

  for (
    let cursor = gridStart;
    cursor.getTime() <= gridEnd.getTime();
    cursor = addUtcDays(cursor, 7)
  ) {
    const column: HeatCell[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addUtcDays(cursor, offset);
      const parts = jalaliPartsFromUtc(date);
      const monthIndex = parts.jy * 12 + parts.jm;
      const inSpan =
        monthIndex >= ordered.start.jy * 12 + ordered.start.jm &&
        monthIndex <= ordered.end.jy * 12 + ordered.end.jm;
      column.push(inSpan ? { jalali: formatJalaliParts(parts.jy, parts.jm, parts.jd) } : null);
    }
    weeks.push(column);
  }

  return weeks;
}

export function comparisonPhrase(preset: DatePreset | null): string {
  switch (preset) {
    case "today":
      return "vs yesterday";
    case "this-week":
      return "vs last week";
    case "this-month":
      return "vs last month";
    case "last-month":
      return "vs the month before";
    default:
      return "vs previous period";
  }
}
