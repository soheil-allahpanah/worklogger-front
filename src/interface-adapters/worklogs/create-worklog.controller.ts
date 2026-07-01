import { createWorklogInputSchema } from "@/src/entities/worklog/create.schema";
import { InputParseError, UnauthenticatedError } from "@/src/entities/errors/app-error";
import { getContainer } from "@/src/di/container";

export async function createWorklogController(
  input: unknown,
  accessToken: string | null,
) {
  if (!accessToken) {
    throw new UnauthenticatedError();
  }

  const parsed = createWorklogInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new InputParseError(
      "Invalid worklog",
      parsed.error.issues.map((i) => i.message),
    );
  }

  const { createWorklogUseCase } = getContainer();
  return createWorklogUseCase.execute(parsed.data, accessToken);
}
