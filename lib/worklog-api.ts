import type { FilterWorklogsInput, WorklogSearchCriteria } from "@/src/entities/worklog/filter.schema";
import type { TagStatsDto } from "@/src/entities/worklog/tag-stats.schema";
import type { WorklogDto, WorklogPageDto } from "@/src/entities/worklog/worklog.schema";

const STATS_PAGE_SIZE = 500;
const MAX_STATS_PAGES = 20;

async function readError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return typeof body.error === "string" ? body.error : fallback;
}

export async function fetchWorklogs(filter: FilterWorklogsInput): Promise<WorklogPageDto> {
  const response = await fetch("/api/worklogs/filter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filter),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to fetch worklogs"));
  }

  return response.json();
}

export async function fetchTagStats(filter: FilterWorklogsInput): Promise<TagStatsDto> {
  const response = await fetch("/api/worklogs/tag-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filter),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to fetch tag stats"));
  }

  return response.json();
}

export async function fetchAllWorklogItems(criteria: WorklogSearchCriteria): Promise<{
  summary: WorklogPageDto;
  items: WorklogDto[];
  truncated: boolean;
}> {
  const first = await fetchWorklogs({
    ...criteria,
    paging: { page: 1, size: STATS_PAGE_SIZE },
  });
  const items = [...first.items];
  const lastPage = Math.min(first.totalPages, MAX_STATS_PAGES);

  for (let page = 2; page <= lastPage; page += 1) {
    const next = await fetchWorklogs({
      ...criteria,
      paging: { page, size: STATS_PAGE_SIZE },
    });
    items.push(...next.items);
  }

  return {
    summary: first,
    items,
    truncated: first.totalItems > items.length,
  };
}
