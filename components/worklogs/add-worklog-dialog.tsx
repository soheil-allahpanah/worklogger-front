"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import type { CreateWorklogInput } from "@/src/entities/worklog/create.schema";
import { todayJalaliInTehran } from "@/lib/worklog-utils";
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

const addWorklogFormSchema = z.object({
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

type AddWorklogFormValues = z.infer<typeof addWorklogFormSchema>;

export function AddWorklogDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWorklogInput) => Promise<void>;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddWorklogFormValues>({
    resolver: zodResolver(addWorklogFormSchema),
    defaultValues: {
      description: "",
      jalali_date: todayJalaliInTehran(),
    },
  });

  const [tagsInput, setTagsInput] = useState("");
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");

  function resetForm() {
    reset({ description: "", jalali_date: todayJalaliInTehran() });
    setTagsInput("");
    setTagsError(null);
    setHours("1");
    setMinutes("0");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

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

    await onSubmit({
      description: data.description,
      tags,
      duration_secs,
      ...(data.jalali_date ? { jalali_date: data.jalali_date } : {}),
    });
    resetForm();
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Worklog</DialogTitle>
          <DialogDescription>
            Record time spent on a task. Dates use the Jalali calendar (YYYY/MM/DD).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jalali_date">Jalali Date</Label>
            <Input
              id="jalali_date"
              placeholder="1403/06/01"
              {...register("jalali_date")}
            />
            {errors.jalali_date && (
              <p className="text-sm text-red-400">{errors.jalali_date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="react, ui-design, backend"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            {tagsError && <p className="text-sm text-red-400">{tagsError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="What did you work on?"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddLogFab({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-8 right-8 z-40 gap-2 rounded-full px-6 uppercase tracking-wide shadow-[0_0_30px_rgba(88,101,242,0.45)]"
    >
      <Plus className="h-5 w-5" />
      Add Log
    </Button>
  );
}
