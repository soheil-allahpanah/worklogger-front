import { LoginUseCase } from "@/src/application/auth/login.use-case";
import { LogoutUseCase } from "@/src/application/auth/logout.use-case";
import { FilterWorklogsUseCase } from "@/src/application/worklogs/filter-worklogs.use-case";
import { GetWorklogUseCase } from "@/src/application/worklogs/get-worklog.use-case";
import { CreateWorklogUseCase } from "@/src/application/worklogs/create-worklog.use-case";
import { ExportWorklogsUseCase } from "@/src/application/worklogs/export-worklogs.use-case";
import { TagStatsUseCase } from "@/src/application/worklogs/tag-stats.use-case";
import { EditWorklogUseCase } from "@/src/application/worklogs/edit-worklog.use-case";
import { DeleteWorklogUseCase } from "@/src/application/worklogs/delete-worklog.use-case";
import { HttpAuthRepository } from "@/src/infrastructure/repositories/http-auth.repository";
import { HttpWorklogRepository } from "@/src/infrastructure/repositories/http-worklog.repository";

type Container = {
  loginUseCase: LoginUseCase;
  logoutUseCase: LogoutUseCase;
  filterWorklogsUseCase: FilterWorklogsUseCase;
  tagStatsUseCase: TagStatsUseCase;
  exportWorklogsUseCase: ExportWorklogsUseCase;
  getWorklogUseCase: GetWorklogUseCase;
  createWorklogUseCase: CreateWorklogUseCase;
  editWorklogUseCase: EditWorklogUseCase;
  deleteWorklogUseCase: DeleteWorklogUseCase;
};

let container: Container | null = null;

export function getContainer(): Container {
  if (!container) {
    const authRepository = new HttpAuthRepository();
    const worklogRepository = new HttpWorklogRepository();

    container = {
      loginUseCase: new LoginUseCase(authRepository),
      logoutUseCase: new LogoutUseCase(authRepository),
      filterWorklogsUseCase: new FilterWorklogsUseCase(worklogRepository),
      tagStatsUseCase: new TagStatsUseCase(worklogRepository),
      exportWorklogsUseCase: new ExportWorklogsUseCase(worklogRepository),
      getWorklogUseCase: new GetWorklogUseCase(worklogRepository),
      createWorklogUseCase: new CreateWorklogUseCase(worklogRepository),
      editWorklogUseCase: new EditWorklogUseCase(worklogRepository),
      deleteWorklogUseCase: new DeleteWorklogUseCase(worklogRepository),
    };
  }

  return container;
}
