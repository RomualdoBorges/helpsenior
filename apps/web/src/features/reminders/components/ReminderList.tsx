import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

interface ReminderListProps {
  reminders: Reminder[];
  isLoading: boolean;
  emptyMessage?: string;
  onCompleteReminder: (reminderId: string) => Promise<void>;
}

function getRecurrenceLabel(recurrence: ReminderRecurrence) {
  const labels: Record<ReminderRecurrence, string> = {
    none: "Sem recorrência",
    daily: "Todos os dias",
    weekly: "Toda semana",
    monthly: "Todo mês",
  };

  return labels[recurrence];
}

function formatReminderDate(reminder: Reminder) {
  if (reminder.time) {
    return `${reminder.date} às ${reminder.time}`;
  }

  return reminder.date;
}

export function ReminderList({
  reminders,
  isLoading,
  emptyMessage = "Nenhum lembrete cadastrado ainda.",
  onCompleteReminder,
}: ReminderListProps) {
  if (isLoading) {
    return (
      <p className="mt-6 text-base font-bold text-slate-600">
        Carregando lembretes...
      </p>
    );
  }

  if (reminders.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-base font-bold text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {reminders.map((reminder) => (
        <article
          key={reminder.id}
          className={`reminder-item rounded-2xl border p-5 ${
            reminder.completed
              ? "reminder-item-completed border-slate-200 bg-slate-100 opacity-70"
              : "border-slate-300 bg-white"
          }`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-xl font-bold text-slate-950">
                  {reminder.title}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    reminder.completed
                      ? "bg-slate-200 text-slate-600"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                  {reminder.completed ? "Concluído" : "Pendente"}
                </span>
              </div>

              {reminder.description && (
                <p className="mt-2 text-base leading-6 text-slate-600">
                  {reminder.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                  {formatReminderDate(reminder)}
                </span>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                  {getRecurrenceLabel(reminder.recurrence)}
                </span>

                {reminder.recurrence !== "none" &&
                  reminder.recurrenceEndDate && (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                      Até {reminder.recurrenceEndDate}
                    </span>
                  )}
              </div>
            </div>

            {!reminder.completed && (
              <button
                type="button"
                onClick={() => void onCompleteReminder(reminder.id)}
                className="min-h-11 rounded-xl bg-slate-950 px-4 font-bold text-white">
                Concluir
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
