import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import type { WorklogPage } from "@/src/entities/worklog/worklog.schema";
import type { IWorklogRepository } from "@/src/application/worklogs/worklog.repository.interface";

export class FilterWorklogsUseCase {
  constructor(private readonly worklogRepository: IWorklogRepository) {}

  async execute(
    input: FilterWorklogsInput,
    accessToken: string,
  ): Promise<WorklogPage> {
    return this.worklogRepository.filter(input, accessToken);
  }
}
