import { Timestamp } from "firebase/firestore";

import type { Task, TaskStatus } from "@helpsenior/core";

interface FirestoreTask {
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  completed: boolean;
  date?: string;
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
      completed: task.completed,
      createdAt: Timestamp.fromDate(task.createdAt),
      updatedAt: Timestamp.fromDate(task.updatedAt),
    };

    if (task.description) {
      firestoreTask.description = task.description;
    }

    if (task.date) {
      firestoreTask.date = task.date;
    }

    if (task.completedAt) {
      firestoreTask.completedAt = Timestamp.fromDate(task.completedAt);
    }

    return firestoreTask;
  }

  static fromFirestore(id: string, data: FirestoreTask): Task {
    const task: Task = {
      id,
      userId: data.userId,
      title: data.title,
      status: data.status,
      completed: data.completed,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };

    if (data.description) {
      task.description = data.description;
    }

    if (data.date) {
      task.date = data.date;
    }

    if (data.completedAt) {
      task.completedAt = data.completedAt.toDate();
    }

    return task;
  }
}