import { Timestamp } from "firebase/firestore";

import type { Activity, NecessaryResources, Step } from "@helpsenior/core";

interface FirestoreActivity {
  userId: string;
  title: string;
  steps: Step[];
  resources?: NecessaryResources[];
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class ActivityFirestoreMapper {
  static toFirestore(activity: Activity): FirestoreActivity {
    const firestoreActivity: FirestoreActivity = {
      userId: activity.userId,
      title: activity.title,
      steps: activity.steps,
      createdAt: Timestamp.fromDate(activity.createdAt),
      updatedAt: Timestamp.fromDate(activity.updatedAt),
    };

    if (activity.description) {
      firestoreActivity.description = activity.description;
    }

    if (activity.resources && activity.resources.length > 0) {
      firestoreActivity.resources = activity.resources;
    }

    return firestoreActivity;
  }

  static fromFirestore(id: string, data: FirestoreActivity): Activity {
    const activity: Activity = {
      id,
      userId: data.userId,
      title: data.title,
      steps: data.steps,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };

    if (data.description) {
      activity.description = data.description;
    }

    if (data.resources && data.resources.length > 0) {
      activity.resources = data.resources;
    }

    return activity;
  }
}
