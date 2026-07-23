import type { Activity } from "../entities/Activity";

export interface ActivityRepository {
  create(activity: Activity): Promise<void>;
  findById(activityId: string): Promise<Activity | null>;
  listByUserId(userId: string): Promise<Activity[]>;
  update(activity: Activity): Promise<void>;
  delete(activityId: string): Promise<void>;
}
