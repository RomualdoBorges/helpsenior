import {
  createDefaultUserProfile,
  type UserProfile,
} from "../entities/UserProfile";
import type { UserProfileRepository } from "../repositories/UserProfileRepository";

interface UpdateUserProfileUseCaseRequest {
  userId: string;
  email: string | null;
  name?: string;
  phone?: string;
  birthDate?: string;
}

interface UpdateUserProfileUseCaseResponse {
  profile: UserProfile;
}

export class UpdateUserProfileUseCase {
  private readonly userProfileRepository: UserProfileRepository;

  constructor(userProfileRepository: UserProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  async execute(
    request: UpdateUserProfileUseCaseRequest,
  ): Promise<UpdateUserProfileUseCaseResponse> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    const currentProfile =
      (await this.userProfileRepository.findByUserId(request.userId)) ??
      createDefaultUserProfile({
        userId: request.userId,
        email: request.email,
      });

    const updatedProfile: UserProfile = {
      ...currentProfile,
      name: request.name ?? currentProfile.name,
      email: request.email,
      phone: request.phone ?? currentProfile.phone,
      birthDate: request.birthDate ?? currentProfile.birthDate,
      updatedAt: new Date(),
    };

    await this.userProfileRepository.save(updatedProfile);

    return { profile: updatedProfile };
  }
}
