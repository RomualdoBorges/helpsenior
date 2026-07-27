import type { Activity } from "../entities/Activity";
import type { ActivityRepository } from "../repositories/ActivityRepository";

export interface ListActivitiesUseCaseInput {
  userId: string;
}

export interface ListActivitiesUseCaseOutput {
  activities: Activity[];
}

export class ListActivitiesUseCase {
  private readonly activityRepository: ActivityRepository;

  constructor(activityRepository: ActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(request: ListActivitiesUseCaseInput): Promise<ListActivitiesUseCaseOutput> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    const activities = await this.activityRepository.listByUserId(request.userId);

    return { activities };
  }
}
