import type { EditWorklogInput } from "@/src/entities/worklog/edit.schema";
import type { Worklog } from "@/src/entities/worklog/worklog.schema";
import type { IWorklogRepository } from "@/src/application/worklogs/worklog.repository.interface";

export class EditWorklogUseCase {
  constructor(private readonly worklogRepository: IWorklogRepository) {}

  async execute(
    id: string,
    input: EditWorklogInput,
    accessToken: string,
  ): Promise<Worklog> {
    return this.worklogRepository.update(id, input, accessToken);
  }
}
