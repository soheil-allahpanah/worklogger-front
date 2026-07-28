import type { FilterWorklogsInput } from "@/src/entities/worklog/filter.schema";
import type { TagStatsDto } from "@/src/entities/worklog/tag-stats.schema";
import type { IWorklogRepository } from "@/src/application/worklogs/worklog.repository.interface";

export class TagStatsUseCase {
  constructor(private readonly worklogRepository: IWorklogRepository) {}

  async execute(
    input: FilterWorklogsInput,
    accessToken: string,
  ): Promise<TagStatsDto> {
    return this.worklogRepository.tagStats(input, accessToken);
  }
}
