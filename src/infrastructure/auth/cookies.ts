import { cookies } from "next/headers";
import { shouldUseSecureCookies } from "@/lib/cookie-options";

export const ACCESS_COOKIE = "wl_access";
export const REFRESH_COOKIE = "wl_refresh";
export const LOGIN_COOKIE = "wl_login";

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

export async function getLoginLabel(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(LOGIN_COOKIE)?.value;
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  loginLabel: string,
): Promise<void> {
  const store = await cookies();
  const secure = shouldUseSecureCookies();

  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
  });

  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  store.set(LOGIN_COOKIE, loginLabel, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  const secure = shouldUseSecureCookies();
  const base = { path: "/", secure, sameSite: "lax" as const };

  store.set(ACCESS_COOKIE, "", { ...base, httpOnly: true, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...base, httpOnly: true, maxAge: 0 });
  store.set(LOGIN_COOKIE, "", { ...base, httpOnly: false, maxAge: 0 });
}

export async function ensureAccessToken(): Promise<string | null> {
  const access = await getAccessToken();
  if (access) return access;

  const refresh = await getRefreshToken();
  if (!refresh) return null;

  const { HttpAuthRepository } = await import(
    "@/src/infrastructure/repositories/http-auth.repository"
  );
  const authRepo = new HttpAuthRepository();

  try {
    const tokens = await authRepo.refresh(refresh);
    await setAuthCookies(
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
      (await getLoginLabel()) ?? "",
    );
    return tokens.access_token;
  } catch {
    await clearAuthCookies();
    return null;
  }
}
