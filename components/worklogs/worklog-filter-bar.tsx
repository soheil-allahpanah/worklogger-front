"use client";

import { useSearchQuery } from "@/components/layout/search-query-provider";
import { QuickFilters } from "@/components/worklogs/quick-filters";
import { WorklogSearchBar } from "@/components/worklogs/worklog-search-bar";

export function WorklogFilterBar({ trailing }: { trailing?: React.ReactNode }) {
  const { search, setSearch } = useSearchQuery();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <WorklogSearchBar value={search} onChange={setSearch} />
        </div>
        {trailing}
      </div>
      <QuickFilters />
    </div>
  );
}
