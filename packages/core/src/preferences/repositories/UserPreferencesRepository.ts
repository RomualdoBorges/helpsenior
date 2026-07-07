import type { UserPreferences } from "../entities/UserPreferences";

export interface UserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferences | null>;
  save(preferences: UserPreferences): Promise<void>;
}
