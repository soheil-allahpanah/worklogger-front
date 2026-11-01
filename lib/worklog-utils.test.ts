import { describe, expect, it } from "vitest";
import {
  parseSearchQuery,
  queryHasTag,
  stripDateTokens,
  toggleTagInSearchQuery,
  withDateRange,
} from "@/lib/worklog-utils";

describe("search date ranges", () => {
  it("replaces a date token and keeps tags, duration, and description", () => {
    expect(withDateRange("notes #mahak 1404/01/01..1404/01/07 2h", "1405/08/09", "1405/08/15")).toBe(
      "1405/08/09..1405/08/15 notes #mahak 2h",
    );
    expect(stripDateTokens("14050810 #linux")).toBe("#linux");
  });

  it("writes a range the existing parser understands", () => {
    const query = withDateRange("#trading", "1405/08/01", "1405/08/30");
    expect(parseSearchQuery(query)).toEqual({
      tags: { in_list: ["trading"] },
      date: { from: "1405/08/01", to: "1405/08/30" },
    });
  });

  it("toggles a tag without disturbing the rest of the query", () => {
    expect(toggleTagInSearchQuery("1405/08/10..1405/08/10", "mahak")).toBe(
      "1405/08/10..1405/08/10 #mahak",
    );
    expect(queryHasTag("1405/08/10..1405/08/10 #Mahak", "mahak")).toBe(true);
    expect(toggleTagInSearchQuery("1405/08/10..1405/08/10 #Mahak #linux", "mahak")).toBe(
      "1405/08/10..1405/08/10 #linux",
    );
  });
});
