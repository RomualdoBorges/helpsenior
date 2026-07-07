import type { Reminder } from "@helpsenior/core";

function createReminderDate(reminder: Reminder): Date {
  const time = reminder.time || "00:00";

  return new Date(`${reminder.date}T${time}:00`);
}

export function getDueReminders(reminders: Reminder[], now = new Date()) {
  return reminders.filter((reminder) => {
    if (reminder.completed) {
      return false;
    }

    const reminderDate = createReminderDate(reminder);

    return reminderDate <= now;
  });
}
