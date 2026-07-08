"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export function WorklogTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled,
  className,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border bg-surface-elevated/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Rows
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={disabled}
            className="h-8 rounded-md border border-border bg-surface px-2 text-sm text-foreground"
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={disabled || currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-24 text-center text-sm text-foreground">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={disabled || currentPage >= totalPages || totalPages === 0}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
