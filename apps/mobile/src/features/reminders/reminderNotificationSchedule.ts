import {
  calculateNextReminderDate,
  type Reminder,
} from "@helpsenior/core";

export const DEFAULT_NOTIFICATION_TIME = "09:00";
export const MAX_SCHEDULED_NOTIFICATIONS = 60;

export interface ReminderNotificationOccurrence {
  reminder: Reminder;
  date: Date;
}

function parseLocalDateTime(date: string, time?: string) {
  return new Date(`${date}T${time || DEFAULT_NOTIFICATION_TIME}:00`);
}

function getNextOccurrenceDate(reminder: Reminder, after: Date) {
  let occurrenceDate = reminder.date;

  while (parseLocalDateTime(occurrenceDate, reminder.time) <= after) {
    const nextDate = calculateNextReminderDate({
      currentDate: occurrenceDate,
      recurrence: reminder.recurrence,
    });

    if (
      !nextDate ||
      (reminder.recurrenceEndDate &&
        nextDate > reminder.recurrenceEndDate)
    ) {
      return null;
    }

    occurrenceDate = nextDate;
  }

  if (
    reminder.recurrenceEndDate &&
    occurrenceDate > reminder.recurrenceEndDate
  ) {
    return null;
  }

  return occurrenceDate;
}

export function buildReminderNotificationOccurrences(
  reminders: Reminder[],
  now = new Date(),
  limit = MAX_SCHEDULED_NOTIFICATIONS,
) {
  const occurrences: ReminderNotificationOccurrence[] = [];

  for (const reminder of reminders) {
    if (reminder.completed) continue;

    let occurrenceDate = getNextOccurrenceDate(reminder, now);
    let reminderOccurrenceCount = 0;

    while (occurrenceDate && reminderOccurrenceCount < limit) {
      occurrences.push({
        reminder,
        date: parseLocalDateTime(occurrenceDate, reminder.time),
      });
      reminderOccurrenceCount += 1;

      const nextDate = calculateNextReminderDate({
        currentDate: occurrenceDate,
        recurrence: reminder.recurrence,
      });

      if (
        !nextDate ||
        (reminder.recurrenceEndDate &&
          nextDate > reminder.recurrenceEndDate)
      ) {
        break;
      }

      occurrenceDate = nextDate;
    }
  }

  return occurrences
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .slice(0, limit);
}
