"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import {
  AddLogFab,
  AddWorklogDialog,
} from "@/components/worklogs/add-worklog-dialog";
import { DeleteWorklogDialog } from "@/components/worklogs/delete-worklog-dialog";
import { EditWorklogDialog } from "@/components/worklogs/edit-worklog-dialog";
import { StatsSummaryCard } from "@/components/worklogs/stats-summary-card";
import { TagCloudCard } from "@/components/worklogs/tag-cloud-card";
import { WorklogDetailDialog } from "@/components/worklogs/worklog-detail-dialog";
import { WorklogSearchBar } from "@/components/worklogs/worklog-search-bar";
import { ExportWorklogsButton } from "@/components/worklogs/export-worklogs-button";
import { WorklogTable } from "@/components/worklogs/worklog-table";
import { appendTagToSearchQuery, parseSearchQuery } from "@/lib/worklog-utils";
import type { CreateWorklogInput } from "@/src/entities/worklog/create.schema";
import type { EditWorklogInput } from "@/src/entities/worklog/edit.schema";
import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import type {
  WorklogDto,
  WorklogPageDto,
} from "@/src/entities/worklog/worklog.schema";

async function fetchWorklogs(filter: FilterWorklogsInput): Promise<WorklogPageDto> {
  const response = await fetch("/api/worklogs/filter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filter),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to fetch worklogs");
  }

  return response.json();
}

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewWorklog, setViewWorklog] = useState<WorklogDto | null>(null);
  const [editWorklogTarget, setEditWorklogTarget] = useState<WorklogDto | null>(null);
  const [deleteWorklogTarget, setDeleteWorklogTarget] = useState<WorklogDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filter = useMemo(
    () => parseSearchQuery(debouncedSearch),
    [debouncedSearch],
  );

  function handleTagClick(tag: string) {
    const next = appendTagToSearchQuery(search, tag);
    setSearch(next);
    setDebouncedSearch(next);
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["worklogs", filter],
    queryFn: () => fetchWorklogs(filter),
  });

  const invalidateWorklogs = () => {
    queryClient.invalidateQueries({ queryKey: ["worklogs"] });
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
    <div className="mx-auto min-h-screen w-full max-w-7xl px-6 py-4">
      <DashboardHeader />

      <div className="mt-3 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <WorklogSearchBar value={search} onChange={setSearch} />
          </div>
          <ExportWorklogsButton
            filter={filter}
            disabled={isLoading}
            onError={(message) => setError(message)}
          />
        </div>

        {data && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <StatsSummaryCard
              statistics={data.statistics}
              totalItems={data.totalItems}
            />
            <TagCloudCard worklogs={data.items} onTagClick={handleTagClick} />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">Loading worklogs...</div>
        )}

        {isError && (
          <div className="py-12 text-center text-red-400">
            Failed to load worklogs. Please try again.
          </div>
        )}

        {!isLoading && !isError && data && (
          <WorklogTable
            worklogs={data.items}
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
