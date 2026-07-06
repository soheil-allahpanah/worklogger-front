import { editWorklogInputSchema } from "@/src/entities/worklog/edit.schema";
import { InputParseError, UnauthenticatedError } from "@/src/entities/errors/app-error";
import { getContainer } from "@/src/di/container";
import { toWorklogDto } from "@/src/interface-adapters/worklogs/worklog.presenter";

export async function editWorklogController(
  id: string,
  input: unknown,
  accessToken: string | null,
) {
  if (!accessToken) {
    throw new UnauthenticatedError();
  }

  const parsed = editWorklogInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new InputParseError(
      "Invalid worklog",
      parsed.error.issues.map((i) => i.message),
    );
  }

  const { editWorklogUseCase } = getContainer();
  const worklog = await editWorklogUseCase.execute(id, parsed.data, accessToken);
  return toWorklogDto(worklog);
}
