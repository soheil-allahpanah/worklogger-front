import { loginInputSchema } from "@/src/entities/auth/login.schema";
import { InputParseError } from "@/src/entities/errors/app-error";
import { getContainer } from "@/src/di/container";

export async function loginController(input: unknown) {
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new InputParseError(
      "Invalid login credentials",
      parsed.error.issues.map((i) => i.message),
    );
  }

  const { loginUseCase } = getContainer();
  const tokens = await loginUseCase.execute(parsed.data);

  return {
    loginLabel: parsed.data.login,
    tokens,
  };
}
