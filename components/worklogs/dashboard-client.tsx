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
import { SummaryCard } from "@/components/worklogs/summary-card";
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

export function DashboardClient({ loginLabel }: { loginLabel: string }) {
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
    <div className="mx-auto min-h-screen w-full max-w-7xl px-8 py-8">
      <DashboardHeader loginLabel={loginLabel} />

      <div className="mt-8 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <WorklogSearchBar value={search} onChange={setSearch} />
          </div>
          <ExportWorklogsButton
            filter={filter}
            disabled={isLoading}
            onError={(message) => setError(message)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Worklogs
            </p>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            {isLoading && (
              <div className="py-16 text-center text-muted-foreground">Loading worklogs...</div>
            )}

            {isError && (
              <div className="py-16 text-center text-red-400">
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

          <aside>
            {data && (
              <SummaryCard
                statistics={data.statistics}
                worklogs={data.items}
                totalItems={data.totalItems}
                onTagClick={handleTagClick}
              />
            )}
          </aside>
        </div>
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
