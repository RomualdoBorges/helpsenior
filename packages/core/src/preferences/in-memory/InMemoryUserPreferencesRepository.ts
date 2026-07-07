import type { UserPreferences } from "../entities/UserPreferences";
import type { UserPreferencesRepository } from "../repositories/UserPreferencesRepository";

export class InMemoryUserPreferencesRepository implements UserPreferencesRepository {
  private preferences: UserPreferences[] = [];

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const preferences = this.preferences.find(
      (preference) => preference.userId === userId,
    );

    return preferences ?? null;
  }

  async save(preferences: UserPreferences): Promise<void> {
    const preferenceIndex = this.preferences.findIndex(
      (item) => item.userId === preferences.userId,
    );

    if (preferenceIndex === -1) {
      this.preferences.push(preferences);
      return;
    }

    this.preferences[preferenceIndex] = preferences;
  }
}
