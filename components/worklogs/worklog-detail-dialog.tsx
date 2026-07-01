"use client";

import { TagBadge } from "@/components/worklogs/tag-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorklogDto } from "@/src/entities/worklog/worklog.schema";

export function WorklogDetailDialog({
  worklog,
  open,
  onOpenChange,
}: {
  worklog: WorklogDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!worklog) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Worklog Details</DialogTitle>
        </DialogHeader>

        <dl className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-muted-foreground">Jalali Date</dt>
              <dd className="mt-1 font-medium">{worklog.jalaliDate}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="mt-1 font-medium">{worklog.durationLabel}</dd>
            </div>
          </div>

          <div>
            <dt className="text-muted-foreground">Tags</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {worklog.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground">Description</dt>
            <dd className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-foreground/90">
              {worklog.description}
            </dd>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <dt>Created</dt>
              <dd className="mt-1">{new Date(worklog.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd className="mt-1">{new Date(worklog.updatedAt).toLocaleString()}</dd>
            </div>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
