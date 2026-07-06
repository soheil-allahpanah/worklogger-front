"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { EditWorklogInput } from "@/src/entities/worklog/edit.schema";
import type { WorklogDto } from "@/src/entities/worklog/worklog.schema";
import { parseDurationToHoursMinutes } from "@/lib/worklog-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const editWorklogFormSchema = z.object({
  jalali_date: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}[/-]\d{2}[/-]\d{2}$/.test(val),
      "Use YYYY/MM/DD or YYYY-MM-DD",
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1024, "Description must be at most 1024 characters"),
});

type EditWorklogFormValues = z.infer<typeof editWorklogFormSchema>;

function EditWorklogForm({
  worklog,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  worklog: WorklogDto;
  onSubmit: (id: string, data: EditWorklogInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const duration = parseDurationToHoursMinutes(worklog.durationSecs);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditWorklogFormValues>({
    resolver: zodResolver(editWorklogFormSchema),
    defaultValues: {
      description: worklog.description,
      jalali_date: worklog.jalaliDate,
    },
  });

  const [tagsInput, setTagsInput] = useState(worklog.tags.join(", "));
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [hours, setHours] = useState(duration.hours);
  const [minutes, setMinutes] = useState(duration.minutes);

  const submit = handleSubmit(async (data) => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    if (tags.length === 0) {
      setTagsError("At least one tag is required");
      return;
    }

    const duration_secs =
      (parseInt(hours || "0", 10) || 0) * 3600 +
      (parseInt(minutes || "0", 10) || 0) * 60;

    if (duration_secs <= 0 || duration_secs >= 86400) {
      setTagsError("Duration must be between 1 second and 23h 59m");
      return;
    }

    setTagsError(null);

    await onSubmit(worklog.id, {
      description: data.description,
      tags,
      duration_secs,
      ...(data.jalali_date ? { jalali_date: data.jalali_date } : {}),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-jalali_date">Jalali Date (optional)</Label>
        <Input
          id="edit-jalali_date"
          placeholder="1403/06/01"
          {...register("jalali_date")}
        />
        {errors.jalali_date && (
          <p className="text-sm text-red-400">{errors.jalali_date.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-hours">Hours</Label>
          <Input
            id="edit-hours"
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-minutes">Minutes</Label>
          <Input
            id="edit-minutes"
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
        <Input
          id="edit-tags"
          placeholder="react, ui-design, backend"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        {tagsError && <p className="text-sm text-red-400">{tagsError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <textarea
          id="edit-description"
          className="flex min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          placeholder="What did you work on?"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditWorklogDialog({
  worklog,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  worklog: WorklogDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: EditWorklogInput) => Promise<void>;
  isSubmitting: boolean;
}) {
  if (!worklog) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Worklog</DialogTitle>
          <DialogDescription>
            Update this worklog entry. Dates use the Jalali calendar (YYYY/MM/DD).
          </DialogDescription>
        </DialogHeader>

        <EditWorklogForm
          key={worklog.id}
          worklog={worklog}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
