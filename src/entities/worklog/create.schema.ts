import { z } from "zod";

const jalaliDateRegex = /^\d{4}[/-]\d{2}[/-]\d{2}$/;

export const createWorklogInputSchema = z.object({
  jalali_date: z
    .string()
    .regex(jalaliDateRegex, "Use YYYY/MM/DD or YYYY-MM-DD")
    .optional(),
  duration_secs: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 second")
    .max(86399, "Duration must be less than 24 hours"),
  tags: z
    .array(z.string().min(1).max(30))
    .min(1, "At least one tag is required")
    .max(50, "Maximum 50 tags"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1024, "Description must be at most 1024 characters"),
});

export type CreateWorklogInput = z.infer<typeof createWorklogInputSchema>;
