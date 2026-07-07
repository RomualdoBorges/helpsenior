import type { Task } from "@helpsenior/core";
import { Timestamp } from "firebase/firestore";

interface FirestoreTaskStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
}

interface FirestoreTask {
  userId: string;
  title: string;
  description?: string;
  status: Task["status"];
  steps: FirestoreTaskStep[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export class TaskFirestoreMapper {
  static toFirestore(task: Task): FirestoreTask {
    const firestoreTask: FirestoreTask = {
      userId: task.userId,
      title: task.title,
      status: task.status,
      steps: task.steps.map((step) => {
        const firestoreStep: FirestoreTaskStep = {
          id: step.id,
          title: step.title,
          completed: step.completed,
          order: step.order,
        };

        if (step.description) {
          firestoreStep.description = step.description;
        }

        return firestoreStep;
      }),
      createdAt: Timestamp.fromDate(task.createdAt),
      updatedAt: Timestamp.fromDate(task.updatedAt),
    };

    if (task.description) {
      firestoreTask.description = task.description;
    }

    if (task.completedAt) {
      firestoreTask.completedAt = Timestamp.fromDate(task.completedAt);
    }

    return firestoreTask;
  }

  static fromFirestore(id: string, data: FirestoreTask): Task {
    return {
      id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      status: data.status,
      steps: data.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        completed: step.completed,
        order: step.order,
      })),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      completedAt: data.completedAt?.toDate(),
    };
  }
}
