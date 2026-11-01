import { describe, expect, it } from "vitest";
import { toJalaali } from "jalaali-js";
import {
  buildHeatmapWeeks,
  jalaliRangeFor,
  matchDatePreset,
  monthSpanLabel,
  previousRange,
  todayJalali,
} from "@/lib/jalali-range";

const noonTehran = (isoDate: string) => new Date(`${isoDate}T08:30:00.000Z`);

describe("jalali ranges", () => {
  it("converts 1 Nov 2026 in Tehran to 10 Aban 1405", () => {
    const now = noonTehran("2026-11-01");
    expect(todayJalali(now)).toBe("1405/08/10");
    expect(toJalaali(2026, 11, 1)).toMatchObject({ jy: 1405, jm: 8, jd: 10 });
  });

  it("starts the Iranian week on Saturday", () => {
    const now = noonTehran("2026-11-01");
    expect(jalaliRangeFor("today", now)).toEqual({
      from: "1405/08/10",
      to: "1405/08/10",
    });
    expect(jalaliRangeFor("this-week", now)).toEqual({
      from: "1405/08/09",
      to: "1405/08/15",
    });
    expect(jalaliRangeFor("this-month", now)).toEqual({
      from: "1405/08/01",
      to: "1405/08/30",
    });
    expect(jalaliRangeFor("last-month", now)).toEqual({
      from: "1405/07/01",
      to: "1405/07/30",
    });
    expect(matchDatePreset("1405/08/09", "1405/08/15", now)).toBe("this-week");
  });

  it("rolls last month from Farvardin back to Esfand", () => {
    const now = noonTehran("2026-03-21");
    expect(jalaliRangeFor("today", now)).toEqual({
      from: "1405/01/01",
      to: "1405/01/01",
    });
    expect(jalaliRangeFor("last-month", now).from).toBe("1404/12/01");
    expect(jalaliRangeFor("last-month", now).to).toMatch(/^1404\/12\/(29|30)$/);
  });

  it("labels spanned months and aligns the heatmap to Saturday", () => {
    expect(monthSpanLabel("1405/07/20", "1405/08/10")).toBe("Mehr–Aban 1405");
    const weeks = buildHeatmapWeeks("1405/08/09", "1405/08/15");
    expect(weeks[0]?.[6]).toEqual({ jalali: "1405/08/01" });
    expect(weeks[0]?.[0]).toBeNull();
    expect(weeks.some((column) => column.some((cell) => cell?.jalali === "1405/08/30"))).toBe(
      true,
    );
  });

  it("uses an equal-length window for the previous period", () => {
    expect(previousRange({ from: "1405/08/09", to: "1405/08/15" })).toEqual({
      from: "1405/08/02",
      to: "1405/08/08",
    });
  });
});
