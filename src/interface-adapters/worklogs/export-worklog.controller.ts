import { filterWorklogsInputSchema } from "@/src/entities/worklog/filter.schema";
import { InputParseError, UnauthenticatedError } from "@/src/entities/errors/app-error";
import { getContainer } from "@/src/di/container";

export async function exportWorklogsController(
  input: unknown,
  accessToken: string | null,
) {
  if (!accessToken) {
    throw new UnauthenticatedError();
  }

  const parsed = filterWorklogsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new InputParseError(
      "Invalid filter",
      parsed.error.issues.map((i) => i.message),
    );
  }

  const { exportWorklogsUseCase } = getContainer();
  return exportWorklogsUseCase.execute(parsed.data, accessToken);
}
