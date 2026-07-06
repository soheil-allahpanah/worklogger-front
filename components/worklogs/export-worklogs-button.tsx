"use client";

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  defaultExportFilename,
  downloadBlob,
  parseExportFilename,
} from "@/lib/export-utils";
import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";

export function ExportWorklogsButton({
  filter,
  disabled,
  onError,
}: {
  filter: FilterWorklogsInput;
  disabled?: boolean;
  onError?: (message: string) => void;
}) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const response = await fetch("/api/worklogs/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filter),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to export worklogs");
      }

      const blob = await response.blob();
      const filename =
        parseExportFilename(response.headers.get("Content-Disposition")) ??
        defaultExportFilename();
      downloadBlob(blob, filename);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Failed to export worklogs");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={disabled || exporting}
      className="shrink-0 gap-2"
    >
      <FileSpreadsheet className="h-4 w-4" />
      {exporting ? "Exporting..." : "Export Excel"}
    </Button>
  );
}
