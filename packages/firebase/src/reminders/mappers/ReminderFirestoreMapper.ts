import { Timestamp } from "firebase/firestore";

import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

interface FirestoreReminder {
  userId: string;
  taskId?: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: boolean;
  recurrence: ReminderRecurrence;
  recurrenceEndDate?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export class ReminderFirestoreMapper {
  static toFirestore(reminder: Reminder): FirestoreReminder {
    const firestoreReminder: FirestoreReminder = {
      userId: reminder.userId,
      title: reminder.title,
      date: reminder.date,
      completed: reminder.completed,
      recurrence: reminder.recurrence,
      createdAt: Timestamp.fromDate(reminder.createdAt),
      updatedAt: Timestamp.fromDate(reminder.updatedAt),
    };

    if (reminder.taskId) {
      firestoreReminder.taskId = reminder.taskId;
    }

    if (reminder.description) {
      firestoreReminder.description = reminder.description;
    }

    if (reminder.time) {
      firestoreReminder.time = reminder.time;
    }

    if (reminder.recurrenceEndDate) {
      firestoreReminder.recurrenceEndDate = reminder.recurrenceEndDate;
    }

    if (reminder.completedAt) {
      firestoreReminder.completedAt = Timestamp.fromDate(reminder.completedAt);
    }

    return firestoreReminder;
  }

  static fromFirestore(id: string, data: FirestoreReminder): Reminder {
    return {
      id,
      userId: data.userId,
      taskId: data.taskId,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      completed: data.completed,
      recurrence: data.recurrence ?? "none",
      recurrenceEndDate: data.recurrenceEndDate,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      completedAt: data.completedAt?.toDate(),
    };
  }
}
