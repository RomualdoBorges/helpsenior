import {
  createDefaultUserPreferences,
  type UserPreferences,
} from "../entities/UserPreferences";
import type { UserPreferencesRepository } from "../repositories/UserPreferencesRepository";

interface GetUserPreferencesUseCaseRequest {
  userId: string;
}

interface GetUserPreferencesUseCaseResponse {
  preferences: UserPreferences;
}

export class GetUserPreferencesUseCase {
  private readonly userPreferencesRepository: UserPreferencesRepository;

  constructor(userPreferencesRepository: UserPreferencesRepository) {
    this.userPreferencesRepository = userPreferencesRepository;
  }

  async execute(
    request: GetUserPreferencesUseCaseRequest,
  ): Promise<GetUserPreferencesUseCaseResponse> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    const preferences = await this.userPreferencesRepository.findByUserId(
      request.userId,
    );

    if (preferences) {
      return {
        preferences,
      };
    }

    const defaultPreferences = createDefaultUserPreferences(request.userId);

    await this.userPreferencesRepository.save(defaultPreferences);

    return {
      preferences: defaultPreferences,
    };
  }
}
