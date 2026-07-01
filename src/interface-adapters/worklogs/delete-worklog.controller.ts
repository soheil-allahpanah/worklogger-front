import { UnauthenticatedError } from "@/src/entities/errors/app-error";
import { getContainer } from "@/src/di/container";

export async function deleteWorklogController(
  id: string,
  accessToken: string | null,
) {
  if (!accessToken) {
    throw new UnauthenticatedError();
  }

  const { deleteWorklogUseCase } = getContainer();
  await deleteWorklogUseCase.execute(id, accessToken);
}
