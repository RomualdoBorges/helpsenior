import type { Activity } from "../entities/Activity";
import type { ActivityRepository } from "../repositories/ActivityRepository";

export class InMemoryActivityRepository implements ActivityRepository {
  private readonly activities: Activity[] = [];

  async create(activity: Activity): Promise<void> {
    this.activities.push(activity);
  }

  async findById(activityId: string): Promise<Activity | null> {
    const activity = this.activities.find((item) => item.id === activityId);

    return activity ?? null;
  }

  async listByUserId(userId: string): Promise<Activity[]> {
    return this.activities.filter((activity) => activity.userId === userId);
  }

  async update(activity: Activity): Promise<void> {
    const activityIndex = this.activities.findIndex((item) => item.id === activity.id);

    if (activityIndex < 0) {
      return;
    }

    this.activities[activityIndex] = activity;
  }

  async delete(activityId: string): Promise<void> {
    const activityIndex = this.activities.findIndex((activity) => activity.id === activityId);

    if (activityIndex < 0) {
      return;
    }

    this.activities.splice(activityIndex, 1);
  }
}
