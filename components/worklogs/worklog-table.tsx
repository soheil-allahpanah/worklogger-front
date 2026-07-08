"use client";

import { Fragment } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { TagBadge } from "@/components/worklogs/tag-badge";
import { WorklogTablePagination } from "@/components/worklogs/worklog-table-pagination";
import { Button } from "@/components/ui/button";
import { groupLabelForDate } from "@/lib/worklog-utils";
import type { WorklogDto } from "@/src/entities/worklog/worklog.schema";

type GroupedWorklogs = {
  label: string;
  items: WorklogDto[];
};

function groupWorklogs(worklogs: WorklogDto[]): GroupedWorklogs[] {
  const groups = new Map<string, GroupedWorklogs>();

  for (const worklog of worklogs) {
    const label = groupLabelForDate(worklog.jalaliDate, worklog.datetime);
    const existing = groups.get(label);
    if (existing) {
      existing.items.push(worklog);
    } else {
      groups.set(label, { label, items: [worklog] });
    }
  }

  return Array.from(groups.values());
}

export function WorklogTable({
  worklogs,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  paginationDisabled,
  onView,
  onEdit,
  onDelete,
  onTagClick,
}: {
  worklogs: WorklogDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  paginationDisabled?: boolean;
  onView: (worklog: WorklogDto) => void;
  onEdit: (worklog: WorklogDto) => void;
  onDelete: (worklog: WorklogDto) => void;
  onTagClick?: (tag: string) => void;
}) {
  const groups = groupWorklogs(worklogs);

  if (worklogs.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-dashed border-border py-16 text-center text-muted-foreground">
          No worklogs found. Try adjusting your search or add a new log.
        </div>
        <WorklogTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          disabled={paginationDisabled}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-elevated/50 text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Duration</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Tags</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.label}>
              <tr className="bg-surface-elevated/30">
                <td
                  colSpan={5}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {group.label}
                </td>
              </tr>
              {group.items.map((worklog) => (
                <tr
                  key={worklog.id}
                  className="border-b border-border/60 transition-colors hover:bg-surface-elevated/20"
                >
                  <td className="px-4 py-4 align-top text-muted-foreground">
                    {worklog.jalaliDate}
                  </td>
                  <td className="px-4 py-4 align-top font-medium text-foreground">
                    {worklog.durationLabel}
                  </td>
                  <td className="max-w-md px-4 py-4 align-top text-foreground/90">
                    <p className="line-clamp-3 whitespace-pre-wrap">{worklog.description}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {worklog.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} onClick={onTagClick} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(worklog)}
                        aria-label="View worklog"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(worklog)}
                        aria-label="Edit worklog"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(worklog)}
                        aria-label="Delete worklog"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      <WorklogTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        disabled={paginationDisabled}
      />
    </div>
  );
}
