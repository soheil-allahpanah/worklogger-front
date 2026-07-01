import type { Worklog } from "@/src/entities/worklog/worklog.schema";
import type { IWorklogRepository } from "@/src/application/worklogs/worklog.repository.interface";

export class GetWorklogUseCase {
  constructor(private readonly worklogRepository: IWorklogRepository) {}

  async execute(id: string, accessToken: string): Promise<Worklog> {
    return this.worklogRepository.getById(id, accessToken);
  }
}
