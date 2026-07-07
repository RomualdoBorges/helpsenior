import type { ReminderRecurrence } from "../entities/Reminder";

interface CalculateNextReminderDateInput {
  currentDate: string;
  recurrence: ReminderRecurrence;
}

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error("Invalid reminder date.");
  }

  return {
    year,
    month,
    day,
  };
}

function formatDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addDays(date: string, days: number) {
  const { year, month, day } = parseDate(date);

  const nextDate = new Date(Date.UTC(year, month - 1, day));
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return formatDate(nextDate);
}

function addMonths(date: string, monthsToAdd: number) {
  const { year, month, day } = parseDate(date);

  const targetMonthIndex = month - 1 + monthsToAdd;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedTargetMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const targetMonth = normalizedTargetMonthIndex + 1;

  const lastDayOfTargetMonth = getLastDayOfMonth(targetYear, targetMonth);
  const safeDay = Math.min(day, lastDayOfTargetMonth);

  const nextDate = new Date(
    Date.UTC(targetYear, normalizedTargetMonthIndex, safeDay),
  );

  return formatDate(nextDate);
}

export function calculateNextReminderDate({
  currentDate,
  recurrence,
}: CalculateNextReminderDateInput): string | null {
  if (recurrence === "none") {
    return null;
  }

  if (recurrence === "daily") {
    return addDays(currentDate, 1);
  }

  if (recurrence === "weekly") {
    return addDays(currentDate, 7);
  }

  if (recurrence === "monthly") {
    return addMonths(currentDate, 1);
  }

  return null;
}
