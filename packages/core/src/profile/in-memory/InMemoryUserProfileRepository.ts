import type { UserProfile } from "../entities/UserProfile";
import type { UserProfileRepository } from "../repositories/UserProfileRepository";

export class InMemoryUserProfileRepository implements UserProfileRepository {
  private profiles: UserProfile[] = [];

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const profile = this.profiles.find((item) => item.userId === userId);

    return profile ?? null;
  }

  async save(profile: UserProfile): Promise<void> {
    const profileIndex = this.profiles.findIndex(
      (item) => item.userId === profile.userId,
    );

    if (profileIndex === -1) {
      this.profiles.push(profile);

      return;
    }

    this.profiles[profileIndex] = profile;
  }
}
