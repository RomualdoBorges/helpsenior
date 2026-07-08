import { Timestamp } from "firebase/firestore";

import type { Task, TaskStatus, TaskStep } from "@helpsenior/core";

interface FirestoreTaskStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  completed: boolean;
  completedAt?: Timestamp;
}

interface FirestoreTask {
  userId: string;
  title: string;
  description?: string;
  steps: FirestoreTaskStep[];
  status: TaskStatus;
  completed: boolean;
  date?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

function toFirestoreTaskStep(step: TaskStep): FirestoreTaskStep {
  const firestoreStep: FirestoreTaskStep = {
    id: step.id,
    title: step.title,
    order: step.order,
    completed: step.completed,
  };

  if (step.description) {
    firestoreStep.description = step.description;
  }

  if (step.completedAt) {
    firestoreStep.completedAt = Timestamp.fromDate(step.completedAt);
  }

  return firestoreStep;
}

function fromFirestoreTaskStep(step: FirestoreTaskStep): TaskStep {
  const taskStep: TaskStep = {
    id: step.id,
    title: step.title,
    order: step.order,
    completed: step.completed,
  };

  if (step.description) {
    taskStep.description = step.description;
  }

  if (step.completedAt) {
    taskStep.completedAt = step.completedAt.toDate();
  }

  return taskStep;
}

export class TaskFirestoreMapper {
  static toFirestore(task: Task): FirestoreTask {
    const firestoreTask: FirestoreTask = {
      userId: task.userId,
      title: task.title,
      steps: task.steps.map(toFirestoreTaskStep),
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
      steps: (data.steps ?? []).map(fromFirestoreTaskStep),
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