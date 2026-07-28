import { filterWorklogsInputSchema } from "@/src/entities/worklog/filter.schema";
import type { TagStatsDto } from "@/src/entities/worklog/tag-stats.schema";
import { InputParseError, UnauthenticatedError } from "@/src/entities/errors/app-error";
import { getContainer } from "@/src/di/container";

export async function tagStatsController(
  input: unknown,
  accessToken: string | null,
): Promise<TagStatsDto> {
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

  const { tagStatsUseCase } = getContainer();
  return tagStatsUseCase.execute(parsed.data, accessToken);
}
