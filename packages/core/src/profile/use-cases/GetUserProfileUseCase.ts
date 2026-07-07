import {
  createDefaultUserProfile,
  type UserProfile,
} from "../entities/UserProfile";
import type { UserProfileRepository } from "../repositories/UserProfileRepository";

interface GetUserProfileUseCaseRequest {
  userId: string;
  email: string | null;
}

interface GetUserProfileUseCaseResponse {
  profile: UserProfile;
}

export class GetUserProfileUseCase {
  private readonly userProfileRepository: UserProfileRepository;

  constructor(userProfileRepository: UserProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  async execute(
    request: GetUserProfileUseCaseRequest,
  ): Promise<GetUserProfileUseCaseResponse> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    const profile = await this.userProfileRepository.findByUserId(
      request.userId,
    );

    if (profile) {
      return { profile };
    }

    const defaultProfile = createDefaultUserProfile({
      userId: request.userId,
      email: request.email,
    });

    await this.userProfileRepository.save(defaultProfile);

    return { profile: defaultProfile };
  }
}
