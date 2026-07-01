import { z } from "zod";

export const filterWorklogsInputSchema = z.object({
  tags: z
    .object({
      in_list: z.array(z.string()).optional(),
      not_in: z.array(z.string()).optional(),
    })
    .optional(),
  description: z
    .object({
      contains: z.string().optional(),
    })
    .optional(),
  date: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  duration: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  paging: z
    .object({
      page: z.number().int().min(1).default(1),
      size: z.number().int().min(1).max(500).default(50),
    })
    .default({ page: 1, size: 50 }),
});

export type FilterWorklogsInput = z.infer<typeof filterWorklogsInputSchema>;
