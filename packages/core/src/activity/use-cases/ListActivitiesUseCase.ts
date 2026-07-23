import type { Activity } from "../entities/Activity";
import type { ActivityRepository } from "../repositories/ActivityRepository";

interface ListActivitiesUseCaseRequest {
  userId: string;
}

interface ListActivitiesUseCaseResponse {
  activities: Activity[];
}

export class ListActivitiesUseCase {
  private readonly activityRepository: ActivityRepository;

  constructor(activityRepository: ActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(request: ListActivitiesUseCaseRequest): Promise<ListActivitiesUseCaseResponse> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    const activities = await this.activityRepository.listByUserId(request.userId);

    return { activities };
  }
}
