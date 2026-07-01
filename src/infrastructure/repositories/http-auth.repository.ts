import {
  loginInputSchema,
  tokenPairSchema,
  type LoginInput,
  type TokenPair,
} from "@/src/entities/auth/login.schema";
import type { IAuthRepository } from "@/src/application/auth/auth.repository.interface";
import { WorkloggerClient } from "@/src/infrastructure/http/worklogger-client";

export class HttpAuthRepository implements IAuthRepository {
  constructor(private readonly client = new WorkloggerClient()) {}

  async login(input: LoginInput): Promise<TokenPair> {
    const parsed = loginInputSchema.parse(input);
    const data = await this.client.request<unknown>("POST", "/auth/login", {
      body: parsed,
    });
    return tokenPairSchema.parse(data);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.client.request<void>("POST", "/auth/logout", {
      body: { refresh_token: refreshToken },
    });
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const data = await this.client.request<unknown>("POST", "/auth/refresh", {
      body: { refresh_token: refreshToken },
    });
    return tokenPairSchema.parse(data);
  }
}
