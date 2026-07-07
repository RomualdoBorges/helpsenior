import type {
  ContrastPreference,
  FontSizePreference,
  UserPreferences,
} from "../entities/UserPreferences";
import { createDefaultUserPreferences } from "../entities/UserPreferences";
import type { UserPreferencesRepository } from "../repositories/UserPreferencesRepository";

interface UpdateUserPreferencesUseCaseRequest {
  userId: string;
  fontSize?: FontSizePreference;
  contrast?: ContrastPreference;
  simpleMode?: boolean;
  reduceMotion?: boolean;
  increasedSpacing?: boolean;
}

interface UpdateUserPreferencesUseCaseResponse {
  preferences: UserPreferences;
}

export class UpdateUserPreferencesUseCase {
  private readonly userPreferencesRepository: UserPreferencesRepository;

  constructor(userPreferencesRepository: UserPreferencesRepository) {
    this.userPreferencesRepository = userPreferencesRepository;
  }

  async execute(
    request: UpdateUserPreferencesUseCaseRequest,
  ): Promise<UpdateUserPreferencesUseCaseResponse> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    const currentPreferences =
      (await this.userPreferencesRepository.findByUserId(request.userId)) ??
      createDefaultUserPreferences(request.userId);

    const updatedPreferences: UserPreferences = {
      ...currentPreferences,
      fontSize: request.fontSize ?? currentPreferences.fontSize,
      contrast: request.contrast ?? currentPreferences.contrast,
      simpleMode: request.simpleMode ?? currentPreferences.simpleMode,
      reduceMotion: request.reduceMotion ?? currentPreferences.reduceMotion,
      increasedSpacing:
        request.increasedSpacing ?? currentPreferences.increasedSpacing,
      updatedAt: new Date(),
    };

    await this.userPreferencesRepository.save(updatedPreferences);

    return {
      preferences: updatedPreferences,
    };
  }
}
