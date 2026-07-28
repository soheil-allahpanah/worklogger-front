import type { CreateWorklogInput } from "@/src/entities/worklog/create.schema";
import type { EditWorklogInput } from "@/src/entities/worklog/edit.schema";
import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import type { ExportWorklogsResult } from "@/src/entities/worklog/export.schema";
import type { TagStatsDto } from "@/src/entities/worklog/tag-stats.schema";
import type { Worklog, WorklogPage } from "@/src/entities/worklog/worklog.schema";

export interface IWorklogRepository {
  filter(input: FilterWorklogsInput, accessToken: string): Promise<WorklogPage>;
  tagStats(input: FilterWorklogsInput, accessToken: string): Promise<TagStatsDto>;
  export(input: FilterWorklogsInput, accessToken: string): Promise<ExportWorklogsResult>;
  getById(id: string, accessToken: string): Promise<Worklog>;
  create(input: CreateWorklogInput, accessToken: string): Promise<{ id: string }>;
  update(id: string, input: EditWorklogInput, accessToken: string): Promise<Worklog>;
  delete(id: string, accessToken: string): Promise<void>;
}
