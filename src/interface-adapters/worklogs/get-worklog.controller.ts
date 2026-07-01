import { UnauthenticatedError } from "@/src/entities/errors/app-error";
import { getContainer } from "@/src/di/container";
import { toWorklogDto } from "@/src/interface-adapters/worklogs/worklog.presenter";

export async function getWorklogController(
  id: string,
  accessToken: string | null,
) {
  if (!accessToken) {
    throw new UnauthenticatedError();
  }

  const { getWorklogUseCase } = getContainer();
  const worklog = await getWorklogUseCase.execute(id, accessToken);
  return toWorklogDto(worklog);
}
