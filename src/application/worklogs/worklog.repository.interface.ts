import type { CreateWorklogInput } from "@/src/entities/worklog/create.schema";
import type { EditWorklogInput } from "@/src/entities/worklog/edit.schema";
import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import type { Worklog, WorklogPage } from "@/src/entities/worklog/worklog.schema";

export interface IWorklogRepository {
  filter(input: FilterWorklogsInput, accessToken: string): Promise<WorklogPage>;
  getById(id: string, accessToken: string): Promise<Worklog>;
  create(input: CreateWorklogInput, accessToken: string): Promise<{ id: string }>;
  update(id: string, input: EditWorklogInput, accessToken: string): Promise<Worklog>;
  delete(id: string, accessToken: string): Promise<void>;
}
