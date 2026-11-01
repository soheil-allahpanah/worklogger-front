import { describe, expect, it } from "vitest";
import { hrefWithSearchQuery, readSearchQuery, withSearchQuery } from "@/lib/search-query";

describe("shared search query param", () => {
  it("reads and writes q without dropping other params", () => {
    expect(readSearchQuery("")).toBe("");
    expect(readSearchQuery("?q=%231405%2F08%2F09..1405%2F08%2F15%20%23mahak")).toBe(
      "#1405/08/09..1405/08/15 #mahak",
    );
    expect(withSearchQuery("?page=2", "2h.. #trading")).toBe(
      "page=2&q=2h..+%23trading",
    );
    expect(withSearchQuery("?q=old&page=2", "")).toBe("page=2");
  });

  it("builds a path that keeps the active filter", () => {
    expect(hrefWithSearchQuery("/statistics", "")).toBe("/statistics");
    expect(hrefWithSearchQuery("/dashboard", "#linux 2h")).toBe(
      "/dashboard?q=%23linux+2h",
    );
  });
});
