import type { CreateWorklogInput } from "@/src/entities/worklog/create.schema";
import type { EditWorklogInput } from "@/src/entities/worklog/edit.schema";
import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import {
  worklogPageSchema,
  worklogSchema,
  type Worklog,
  type WorklogPage,
} from "@/src/entities/worklog/worklog.schema";
import type { IWorklogRepository } from "@/src/application/worklogs/worklog.repository.interface";
import { WorkloggerClient } from "@/src/infrastructure/http/worklogger-client";

export class HttpWorklogRepository implements IWorklogRepository {
  constructor(private readonly client = new WorkloggerClient()) {}

  async filter(
    input: FilterWorklogsInput,
    accessToken: string,
  ): Promise<WorklogPage> {
    const data = await this.client.request<unknown>(
      "POST",
      "/worklogs/filter",
      { body: input, accessToken },
    );
    return worklogPageSchema.parse(data);
  }

  async getById(id: string, accessToken: string): Promise<Worklog> {
    const data = await this.client.request<unknown>("GET", `/worklogs/${id}`, {
      accessToken,
    });
    return worklogSchema.parse(data);
  }

  async create(
    input: CreateWorklogInput,
    accessToken: string,
  ): Promise<{ id: string }> {
    const data = await this.client.request<{ id: string }>("POST", "/worklogs", {
      body: input,
      accessToken,
    });
    return data;
  }

  async update(
    id: string,
    input: EditWorklogInput,
    accessToken: string,
  ): Promise<Worklog> {
    const data = await this.client.request<unknown>("PUT", `/worklogs/${id}`, {
      body: input,
      accessToken,
    });
    return worklogSchema.parse(data);
  }

  async delete(id: string, accessToken: string): Promise<void> {
    await this.client.request<void>("DELETE", `/worklogs/${id}`, {
      accessToken,
    });
  }
}
