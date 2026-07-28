import { z } from "zod";

export const tagStatSchema = z.object({
  tag: z.string(),
  duration_secs: z.number(),
  days_worked: z.number(),
  worklog_count: z.number(),
});

export const tagStatsSchema = z.object({
  tags: z.array(tagStatSchema),
});

export type TagStat = z.infer<typeof tagStatSchema>;
export type TagStats = z.infer<typeof tagStatsSchema>;

export type TagStatDto = {
  tag: string;
  durationSecs: number;
  daysWorked: number;
  worklogCount: number;
};

export type TagStatsDto = {
  tags: TagStatDto[];
};
