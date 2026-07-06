import { z } from "zod";

export const worklogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  datetime: z.string(),
  jalali_date: z.string(),
  duration_secs: z.number(),
  duration: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Worklog = z.infer<typeof worklogSchema>;

export const worklogFilterStatisticsSchema = z.object({
  total_duration_secs: z.number(),
  days_worked: z.number(),
});

export type WorklogFilterStatistics = z.infer<typeof worklogFilterStatisticsSchema>;

export const worklogPageSchema = z.object({
  items: z.array(worklogSchema),
  total_items: z.number(),
  total_pages: z.number(),
  current_page: z.number(),
  page_size: z.number(),
  statistics: worklogFilterStatisticsSchema,
});

export type WorklogPage = z.infer<typeof worklogPageSchema>;

export type WorklogFilterStatisticsDto = {
  totalDurationSecs: number;
  daysWorked: number;
};

export type WorklogPageDto = {
  items: WorklogDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  statistics: WorklogFilterStatisticsDto;
};

export type WorklogDto = {
  id: string;
  jalaliDate: string;
  datetime: string;
  durationSecs: number;
  durationLabel: string;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
};
