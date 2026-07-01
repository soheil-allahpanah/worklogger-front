import type { LoginInput, TokenPair } from "@/src/entities/auth/login.schema";

export interface IAuthRepository {
  login(input: LoginInput): Promise<TokenPair>;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<TokenPair>;
}
