import type { IWorklogRepository } from "@/src/application/worklogs/worklog.repository.interface";

export class DeleteWorklogUseCase {
  constructor(private readonly worklogRepository: IWorklogRepository) {}

  async execute(id: string, accessToken: string): Promise<void> {
    return this.worklogRepository.delete(id, accessToken);
  }
}
