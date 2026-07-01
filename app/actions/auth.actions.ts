"use server";

import { redirect } from "next/navigation";
import { ApiError, InputParseError } from "@/src/entities/errors/app-error";
import { loginController } from "@/src/interface-adapters/auth/login.controller";
import {
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
} from "@/src/infrastructure/auth/cookies";
import { getContainer } from "@/src/di/container";

export type ActionResult =
  | { success: true }
  | { success: false; error: string; details?: string[] };

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const result = await loginController({
      login: formData.get("login"),
      password: formData.get("password"),
    });

    await setAuthCookies(
      result.tokens.access_token,
      result.tokens.refresh_token,
      result.tokens.expires_in,
      result.loginLabel,
    );
  } catch (error) {
    if (error instanceof InputParseError) {
      return { success: false, error: error.message, details: error.details };
    }
    if (error instanceof ApiError) {
      return { success: false, error: error.message, details: error.details };
    }
    return { success: false, error: "Login failed. Please try again." };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const refresh = await getRefreshToken();
  if (refresh) {
    try {
      const { logoutUseCase } = getContainer();
      await logoutUseCase.execute(refresh);
    } catch {
      // ignore
    }
  }
  await clearAuthCookies();
  redirect("/login");
}
