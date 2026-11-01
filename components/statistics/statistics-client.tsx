"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchQuery } from "@/components/layout/search-query-provider";
import { ActivityHeatmap } from "@/components/statistics/activity-heatmap";
import { formatStatDuration } from "@/components/statistics/duration-tooltip";
import { HoursByDayChart } from "@/components/statistics/hours-by-day-chart";
import { ProjectShareChart } from "@/components/statistics/project-share-chart";
import { StatisticsRangePicker } from "@/components/statistics/range-picker";
import { TopTagsChart, type TagBar } from "@/components/statistics/top-tags-chart";
import {
  comparisonPhrase,
  jalaliRangeFor,
  matchDatePreset,
  previousRange,
} from "@/lib/jalali-range";
import {
  aggregateDays,
  busiestDay,
  chartDomain,
  dominantProject,
  periodDelta,
  projectColor,
  projectTotals,
} from "@/lib/statistics";
import { fetchAllWorklogItems, fetchTagStats, fetchWorklogs } from "@/lib/worklog-api";
import { parseSearchQuery } from "@/lib/worklog-utils";
import type { WorklogSearchCriteria } from "@/src/entities/worklog/filter.schema";

function pluralDays(count: number): string {
  return `${count} day${count === 1 ? "" : "s"}`;
}

export function StatisticsClient() {
  const { search } = useSearchQuery();
  const request = useMemo<WorklogSearchCriteria>(() => {
    const parsed = parseSearchQuery(search);
    if (!parsed.date?.from && !parsed.date?.to) {
      return { ...parsed, date: jalaliRangeFor("this-week") };
    }
    return parsed;
  }, [search]);

  const worklogsQuery = useQuery({
    queryKey: ["statistics-worklogs", request],
    queryFn: () => fetchAllWorklogItems(request),
    placeholderData: keepPreviousData,
  });

  const tagsQuery = useQuery({
    queryKey: ["statistics-tags", request],
    queryFn: () => fetchTagStats({ ...request, paging: { page: 1, size: 1 } }),
    placeholderData: keepPreviousData,
  });

  const items = worklogsQuery.data?.items;
  const summary = worklogsQuery.data?.summary;
  const statsItems = useMemo(
    () =>
      (items ?? []).map((item) => ({
        jalaliDate: item.jalaliDate,
        durationSecs: item.durationSecs,
        tags: item.tags,
      })),
    [items],
  );
  const domain = useMemo(
    () => chartDomain(request.date, statsItems.map((item) => item.jalaliDate)),
    [request.date, statsItems],
  );
  const days = useMemo(() => aggregateDays(statsItems, domain), [statsItems, domain]);
  const totals = useMemo(() => projectTotals(days), [days]);
  const busy = busiestDay(days);
  const preset = matchDatePreset(domain.from, domain.to);
  const prior = useMemo(() => previousRange(domain), [domain]);
  const priorCriteria = useMemo(
    () => ({ ...request, date: prior }),
    [request, prior],
  );

  const priorQuery = useQuery({
    queryKey: ["statistics-previous", priorCriteria],
    queryFn: () => fetchWorklogs({ ...priorCriteria, paging: { page: 1, size: 1 } }),
    enabled: Boolean(summary),
    placeholderData: keepPreviousData,
  });

  const totalSecs = summary?.statistics.totalDurationSecs ?? 0;
  const daysWorked = summary?.statistics.daysWorked ?? 0;
  const totalItems = summary?.totalItems ?? 0;
  const average = daysWorked > 0 ? totalSecs / daysWorked : 0;
  const delta = priorQuery.data
    ? periodDelta(totalSecs, priorQuery.data.statistics.totalDurationSecs)
    : null;
  const deltaLabel = priorQuery.data
    ? delta === null
      ? `No earlier logs ${comparisonPhrase(preset)}`
      : delta === 0
        ? `Same ${comparisonPhrase(preset)}`
        : `${delta > 0 ? "+" : ""}${delta}% ${comparisonPhrase(preset)}`
    : "Comparing with the previous period";

  const tagRows: TagBar[] = [...(tagsQuery.data?.tags ?? [])]
    .sort((a, b) => b.durationSecs - a.durationSecs)
    .slice(0, 8)
    .map((tag) => ({
      tag: tag.tag,
      durationSecs: tag.durationSecs,
      color: projectColor(dominantProject(tag.tag, statsItems)),
    }));

  const error = worklogsQuery.error ?? tagsQuery.error;

  return (
    <div className="flex min-h-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
        <StatisticsRangePicker from={domain.from} to={domain.to} />
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-danger">
          {error instanceof Error ? error.message : "Failed to load statistics"}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total hours" value={formatStatDuration(totalSecs)} hint={deltaLabel} />
        <Kpi
          label="Entries"
          value={summary ? String(totalItems) : "—"}
          hint={summary ? `across ${pluralDays(daysWorked)}` : "Loading entries"}
        />
        <Kpi label="Avg / day" value={formatStatDuration(average)} hint="active days only" />
        <Kpi
          label="Busiest day"
          value={busy?.date ?? "—"}
          hint={busy ? formatStatDuration(busy.durationSecs) : "No active day"}
        />
      </section>

      {worklogsQuery.isLoading && !summary ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Loading statistics...</p>
      ) : (
        <>
          <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <HoursByDayChart days={days} />
            <ProjectShareChart totals={totals} totalSecs={days.reduce((sum, day) => sum + day.total, 0)} />
          </section>
          <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[auto_minmax(0,1fr)]">
            <ActivityHeatmap from={domain.from} to={domain.to} days={days} />
            <TopTagsChart rows={tagRows} />
          </section>
          {worklogsQuery.data?.truncated && (
            <p className="text-xs text-muted-foreground">
              Daily charts include the first {worklogsQuery.data.items.length.toLocaleString()} of{" "}
              {summary?.totalItems.toLocaleString()} entries. Totals include the full range.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-surface p-5">
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="truncate text-[28px] font-bold leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </article>
  );
}
