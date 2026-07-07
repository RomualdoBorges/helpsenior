export type {
  ContrastPreference,
  FontSizePreference,
  UserPreferences,
} from "./entities/UserPreferences";
export { createDefaultUserPreferences } from "./entities/UserPreferences";

export type { UserPreferencesRepository } from "./repositories/UserPreferencesRepository";

export { InMemoryUserPreferencesRepository } from "./in-memory/InMemoryUserPreferencesRepository";

export { GetUserPreferencesUseCase } from "./use-cases/GetUserPreferencesUseCase";
export { UpdateUserPreferencesUseCase } from "./use-cases/UpdateUserPreferencesUseCase";
