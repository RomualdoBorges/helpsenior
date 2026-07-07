import type { Reminder } from "@helpsenior/core";

function getReminderDateTimeValue(reminder: Reminder) {
  const time = reminder.time || "00:00";

  return `${reminder.date}T${time}`;
}

export function sortReminders(reminders: Reminder[]) {
  return [...reminders].sort((firstReminder, secondReminder) => {
    if (firstReminder.completed !== secondReminder.completed) {
      return firstReminder.completed ? 1 : -1;
    }

    if (!firstReminder.completed && !secondReminder.completed) {
      return getReminderDateTimeValue(firstReminder).localeCompare(
        getReminderDateTimeValue(secondReminder),
      );
    }

    return (
      secondReminder.updatedAt.getTime() - firstReminder.updatedAt.getTime()
    );
  });
}
