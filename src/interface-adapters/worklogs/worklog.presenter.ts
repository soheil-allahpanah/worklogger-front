import type { Worklog, WorklogDto } from "@/src/entities/worklog/worklog.schema";

export function toWorklogDto(worklog: Worklog): WorklogDto {
  return {
    id: worklog.id,
    jalaliDate: worklog.jalali_date,
    datetime: worklog.datetime,
    durationSecs: worklog.duration_secs,
    durationLabel: worklog.duration,
    tags: worklog.tags,
    description: worklog.description,
    createdAt: worklog.created_at,
    updatedAt: worklog.updated_at,
  };
}

export function toWorklogDtoList(worklogs: Worklog[]): WorklogDto[] {
  return worklogs.map(toWorklogDto);
}
