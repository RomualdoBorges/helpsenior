import type { Activity } from "../entities/Activity";
import type { ActivityRepository } from "../repositories/ActivityRepository";

export interface GetActivityUseCaseInput {
  activityId: string;
}

export interface GetActivityUseCaseOutput {
  activity: Activity | null;
}

export class GetActivityUseCase {
  private readonly activityRepository: ActivityRepository;

  constructor(activityRepository: ActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(request: GetActivityUseCaseInput): Promise<GetActivityUseCaseOutput> {
    if (!request.activityId.trim()) {
      throw new Error("Atividade é obrigatória.");
    }

    const activity = await this.activityRepository.findById(request.activityId);

    return { activity };
  }
}