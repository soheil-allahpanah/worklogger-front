import { describe, expect, it } from "vitest";
import { parseSavedFilters } from "@/lib/saved-filters";

describe("saved filters", () => {
  it("keeps complete records and drops malformed storage", () => {
    expect(
      parseSavedFilters(
        JSON.stringify([
          { id: "1", name: " Mahak this month ", query: " 1405/08/01..1405/08/30 #mahak " },
          { id: "2", name: "", query: "#linux" },
          { name: "missing id", query: "#linux" },
        ]),
      ),
    ).toEqual([
      { id: "1", name: "Mahak this month", query: "1405/08/01..1405/08/30 #mahak" },
    ]);
    expect(parseSavedFilters("not-json")).toEqual([]);
    expect(parseSavedFilters(null)).toEqual([]);
  });
});
