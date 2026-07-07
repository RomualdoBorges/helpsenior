import type { UserProfile } from "../entities/UserProfile";

export interface UserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}
