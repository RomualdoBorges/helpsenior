import type { Activity } from "@helpsenior/core";

export function sortActivitiesRecent(activities: Activity[]) {
  return [...activities].sort((activityA, activityB) => {

    return activityB.updatedAt.getTime() - activityA.updatedAt.getTime();
  });
}

export function sortActivitiesOldest(activities: Activity[]) {
  return [...activities].sort((activityA, activityB) => {

    return activityA.updatedAt.getTime() - activityB.updatedAt.getTime();
  });
}
