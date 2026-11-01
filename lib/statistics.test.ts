import { describe, expect, it } from "vitest";
import {
  aggregateDays,
  busiestDay,
  chartDomain,
  dominantProject,
  heatLevel,
  percentShares,
  periodDelta,
  projectKeysForTags,
  projectTotals,
} from "@/lib/statistics";

const noon = new Date("2026-11-01T08:30:00.000Z");

describe("statistics aggregation", () => {
  it("splits a log across every project tag it carries", () => {
    expect(projectKeysForTags(["Mahak", "trading"])).toEqual(["mahak", "trading"]);
    expect(projectKeysForTags(["volunteer"])).toEqual(["other"]);

    const days = aggregateDays(
      [
        { jalaliDate: "1405/08/10", durationSecs: 3600, tags: ["mahak", "trading"] },
        { jalaliDate: "1405/08/10", durationSecs: 1800, tags: ["linux"] },
        { jalaliDate: "1405/08/09", durationSecs: 600, tags: ["research"] },
      ],
      { from: "1405/08/09", to: "1405/08/10" },
    );

    const tenth = days.find((day) => day.date === "1405/08/10");
    expect(tenth?.mahak).toBe(1800);
    expect(tenth?.trading).toBe(1800);
    expect(tenth?.linux).toBe(1800);
    expect(tenth?.total).toBe(5400);

    const totals = projectTotals(days);
    expect(totals.mahak + totals.trading + totals.linux + totals.other).toBe(6000);
    expect(busiestDay(days)).toEqual({ date: "1405/08/10", durationSecs: 5400 });
  });

  it("picks the earliest day when two days tie", () => {
    const days = aggregateDays(
      [
        { jalaliDate: "1405/08/11", durationSecs: 100, tags: ["mahak"] },
        { jalaliDate: "1405/08/10", durationSecs: 100, tags: ["mahak"] },
      ],
      { from: "1405/08/10", to: "1405/08/11" },
    );
    expect(busiestDay(days)?.date).toBe("1405/08/10");
  });

  it("rounds shares so they add up to 100", () => {
    expect(percentShares([1, 1, 1]).reduce((sum, value) => sum + value, 0)).toBe(100);
    expect(percentShares([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it("colors a tag by the project it belongs to", () => {
    const items = [
      { jalaliDate: "1405/08/10", durationSecs: 10, tags: ["volunteer", "mahak"] },
      { jalaliDate: "1405/08/10", durationSecs: 2, tags: ["volunteer", "linux"] },
    ];
    expect(dominantProject("volunteer", items)).toBe("mahak");
    expect(dominantProject("linux", items)).toBe("linux");
    expect(dominantProject("frontend", [])).toBe("other");
  });

  it("defaults an empty filter to this week and reports a real delta", () => {
    expect(chartDomain(undefined, [], noon)).toEqual({
      from: "1405/08/09",
      to: "1405/08/15",
    });
    expect(chartDomain(undefined, ["1405/08/14", "1405/08/04", "1405/08/10"], noon)).toEqual({
      from: "1405/08/04",
      to: "1405/08/14",
    });
    expect(chartDomain({ to: "1405/08/10" }, ["1405/08/04", "1405/08/08"], noon)).toEqual({
      from: "1405/08/04",
      to: "1405/08/10",
    });
    expect(periodDelta(3600, 3000)).toBe(20);
    expect(periodDelta(100, 0)).toBeNull();
    expect(heatLevel(0, 10)).toBe(0);
    expect(heatLevel(10, 10)).toBe(3);
  });
});
