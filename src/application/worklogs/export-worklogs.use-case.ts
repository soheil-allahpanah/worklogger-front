import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import type { ExportWorklogsResult } from "@/src/entities/worklog/export.schema";
import type { IWorklogRepository } from "@/src/application/worklogs/worklog.repository.interface";

export class ExportWorklogsUseCase {
  constructor(private readonly worklogRepository: IWorklogRepository) {}

  async execute(
    input: FilterWorklogsInput,
    accessToken: string,
  ): Promise<ExportWorklogsResult> {
    return this.worklogRepository.export(input, accessToken);
  }
}
