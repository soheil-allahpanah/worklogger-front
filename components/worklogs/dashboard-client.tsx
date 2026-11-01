"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useSearchQuery } from "@/components/layout/search-query-provider";
import {
  AddLogFab,
  AddWorklogDialog,
} from "@/components/worklogs/add-worklog-dialog";
import { DeleteWorklogDialog } from "@/components/worklogs/delete-worklog-dialog";
import { EditWorklogDialog } from "@/components/worklogs/edit-worklog-dialog";
import { StatsSummaryCard } from "@/components/worklogs/stats-summary-card";
import { TagCloudCard } from "@/components/worklogs/tag-cloud-card";
import { WorklogDetailDialog } from "@/components/worklogs/worklog-detail-dialog";
import { ExportWorklogsButton } from "@/components/worklogs/export-worklogs-button";
import { WorklogFilterBar } from "@/components/worklogs/worklog-filter-bar";
import { WorklogTable } from "@/components/worklogs/worklog-table";
import { fetchTagStats, fetchWorklogs } from "@/lib/worklog-api";
import { appendTagToSearchQuery, parseSearchQuery } from "@/lib/worklog-utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import type { CreateWorklogInput } from "@/src/entities/worklog/create.schema";
import type { EditWorklogInput } from "@/src/entities/worklog/edit.schema";
import type { WorklogDto } from "@/src/entities/worklog/worklog.schema";

async function createWorklog(input: CreateWorklogInput) {
  const response = await fetch("/api/worklogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create worklog");
  }

  return response.json();
}

async function editWorklog(id: string, input: EditWorklogInput) {
  const response = await fetch(`/api/worklogs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update worklog");
  }

  return response.json();
}

async function deleteWorklogById(id: string) {
  const response = await fetch(`/api/worklogs/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete worklog");
  }
}

export function DashboardClient() {
  const queryClient = useQueryClient();
  const { search, debouncedSearch, hydrated, commitSearch } = useSearchQuery();
  const [addOpen, setAddOpen] = useState(false);
  const [viewWorklog, setViewWorklog] = useState<WorklogDto | null>(null);
  const [editWorklogTarget, setEditWorklogTarget] = useState<WorklogDto | null>(null);
  const [deleteWorklogTarget, setDeleteWorklogTarget] = useState<WorklogDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageState, setPageState] = useState({ key: "", page: 1 });

  const pageKey = `${debouncedSearch}\0${pageSize}`;
  const page = pageState.key === pageKey ? pageState.page : 1;

  function setPage(next: number) {
    setPageState({ key: pageKey, page: next });
  }

  const searchCriteria = useMemo(
    () => parseSearchQuery(debouncedSearch),
    [debouncedSearch],
  );

  const filter = useMemo(
    () => ({
      ...searchCriteria,
      paging: { page, size: pageSize },
    }),
    [searchCriteria, page, pageSize],
  );

  function handleTagClick(tag: string) {
    commitSearch(appendTagToSearchQuery(search, tag));
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["worklogs", filter],
    queryFn: () => fetchWorklogs(filter),
    enabled: hydrated,
  });

  const {
    data: tagStats,
    isLoading: tagStatsLoading,
  } = useQuery({
    queryKey: ["worklog-tag-stats", searchCriteria],
    queryFn: () =>
      fetchTagStats({
        ...searchCriteria,
        paging: { page: 1, size: 1 },
      }),
    enabled: hydrated,
  });

  if (data && page > data.totalPages && data.totalPages > 0) {
    setPage(data.totalPages);
  }

  const invalidateWorklogs = () => {
    queryClient.invalidateQueries({ queryKey: ["worklogs"] });
    queryClient.invalidateQueries({ queryKey: ["worklog-tag-stats"] });
  };

  const createMutation = useMutation({
    mutationFn: createWorklog,
    onSuccess: () => {
      invalidateWorklogs();
      setAddOpen(false);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: EditWorklogInput }) =>
      editWorklog(id, input),
    onSuccess: () => {
      invalidateWorklogs();
      setEditWorklogTarget(null);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorklogById,
    onSuccess: () => {
      invalidateWorklogs();
      setDeleteWorklogTarget(null);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="min-h-full w-full px-6 py-4 pb-24">
      <DashboardHeader />

      <div className="mt-3 space-y-3">
        <WorklogFilterBar
          trailing={
            <ExportWorklogsButton
              filter={searchCriteria}
              disabled={!hydrated || isLoading}
              onError={(message) => setError(message)}
            />
          }
        />

        {(data || tagStats || tagStatsLoading) && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data && (
              <StatsSummaryCard
                statistics={data.statistics}
                totalItems={data.totalItems}
              />
            )}
            <TagCloudCard
              tags={tagStats?.tags ?? []}
              isLoading={tagStatsLoading}
              onTagClick={handleTagClick}
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {(!hydrated || isLoading) && (
          <div className="py-12 text-center text-muted-foreground">Loading worklogs...</div>
        )}

        {isError && (
          <div className="py-12 text-center text-danger">
            Failed to load worklogs. Please try again.
          </div>
        )}

        {!isLoading && !isError && data && (
          <WorklogTable
            worklogs={data.items}
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            pageSize={data.pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            paginationDisabled={isFetching}
            onView={(w) => setViewWorklog(w)}
            onEdit={(w) => setEditWorklogTarget(w)}
            onDelete={(w) => setDeleteWorklogTarget(w)}
            onTagClick={handleTagClick}
          />
        )}
      </div>

      <AddLogFab onClick={() => setAddOpen(true)} />

      <AddWorklogDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        isSubmitting={createMutation.isPending}
        onSubmit={async (input) => {
          await createMutation.mutateAsync(input);
        }}
      />

      <EditWorklogDialog
        worklog={editWorklogTarget}
        open={Boolean(editWorklogTarget)}
        onOpenChange={(open) => !open && setEditWorklogTarget(null)}
        isSubmitting={editMutation.isPending}
        onSubmit={async (id, input) => {
          await editMutation.mutateAsync({ id, input });
        }}
      />

      <WorklogDetailDialog
        worklog={viewWorklog}
        open={Boolean(viewWorklog)}
        onOpenChange={(open) => !open && setViewWorklog(null)}
        onTagClick={handleTagClick}
      />

      <DeleteWorklogDialog
        worklog={deleteWorklogTarget}
        open={Boolean(deleteWorklogTarget)}
        onOpenChange={(open) => !open && setDeleteWorklogTarget(null)}
        isDeleting={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteWorklogTarget) {
            await deleteMutation.mutateAsync(deleteWorklogTarget.id);
          }
        }}
      />
    </div>
  );
}
