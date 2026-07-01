import type { CreateWorklogInput } from "@/src/entities/worklog/create.schema";
import type { IWorklogRepository } from "@/src/application/worklogs/worklog.repository.interface";

export class CreateWorklogUseCase {
  constructor(private readonly worklogRepository: IWorklogRepository) {}

  async execute(
    input: CreateWorklogInput,
    accessToken: string,
  ): Promise<{ id: string }> {
    return this.worklogRepository.create(input, accessToken);
  }
}
