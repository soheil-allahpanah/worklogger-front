import type { IAuthRepository } from "@/src/application/auth/auth.repository.interface";

export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(refreshToken: string): Promise<void> {
    return this.authRepository.logout(refreshToken);
  }
}
