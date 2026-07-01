import type { LoginInput, TokenPair } from "@/src/entities/auth/login.schema";
import type { IAuthRepository } from "@/src/application/auth/auth.repository.interface";

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: LoginInput): Promise<TokenPair> {
    return this.authRepository.login(input);
  }
}
