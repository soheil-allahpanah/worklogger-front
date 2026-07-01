import { filterWorklogsInputSchema } from "@/src/entities/worklog/filter.schema";
import { InputParseError, UnauthenticatedError } from "@/src/entities/errors/app-error";
import { getContainer } from "@/src/di/container";
import { toWorklogDtoList } from "@/src/interface-adapters/worklogs/worklog.presenter";

export async function filterWorklogsController(
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

  const { filterWorklogsUseCase } = getContainer();
  const page = await filterWorklogsUseCase.execute(parsed.data, accessToken);

  return {
    items: toWorklogDtoList(page.items),
    totalItems: page.total_items,
    totalPages: page.total_pages,
    currentPage: page.current_page,
    pageSize: page.page_size,
  };
}
