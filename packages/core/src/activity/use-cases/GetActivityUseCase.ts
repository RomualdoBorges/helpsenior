import type { Activity } from "../entities/Activity";
import type { ActivityRepository } from "../repositories/ActivityRepository";

interface GetActivityUseCaseRequest {
  activityId: string;
}

interface GetActivityUseCaseResponse {
  activity: Activity | null;
}

export class GetActivityUseCase {
  private readonly activityRepository: ActivityRepository;

  constructor(activityRepository: ActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(request: GetActivityUseCaseRequest): Promise<GetActivityUseCaseResponse> {
    if (!request.activityId.trim()) {
      throw new Error("Atividade é obrigatória.");
    }

    const activity = await this.activityRepository.findById(request.activityId);

    return { activity };
  }
}