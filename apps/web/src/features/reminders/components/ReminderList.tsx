import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

import {
  Badge,
  Button,
  classNames,
} from "../../../shared/ui";

interface ReminderListProps {
  reminders: Reminder[];
  isLoading: boolean;
  emptyMessage?: string;
  onCompleteReminder: (reminderId: string) => Promise<void>;
  onSelectedReminder: (reminder: Reminder) => void;
  onTaskDetail: (taskId: string) => Promise<void>;
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

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function formatReminderDate(reminder: Reminder) {
  const formattedDate = formatDate(reminder.date);

  if (reminder.time) {
    return `${formattedDate} às ${reminder.time}`;
  }

  return formattedDate;
}

export function ReminderList({
  reminders,
  isLoading,
  emptyMessage = "Nenhum lembrete cadastrado ainda.",
  onCompleteReminder,
  onSelectedReminder,
  onTaskDetail,
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
      {reminders.map((reminder) => {

        return (
          <article
            key={reminder.id}
            className={classNames(
              "reminder-item rounded-2xl border p-5",
              reminder.completed
                ? "reminder-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white",
            )}
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
              <div style={{width: "stretch"}}
                onClick={() => {
                  // if (!reminder.completed) {
                    onSelectedReminder(reminder)
                  // }
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="m-0 text-xl font-bold text-slate-950">
                    {reminder.title}
                  </h3>

                  <Badge
                    tone={reminder.completed ? "slate" : "amber"}
                    className={classNames(
                      "text-xs",
                      reminder.completed && "bg-slate-200 text-slate-600",
                    )}
                  >
                    {reminder.completed ? "Concluído" : "Pendente"}
                  </Badge>
                </div>

                {reminder.description && (
                  <p className="mt-2 text-base leading-6 text-slate-600">
                    {reminder.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{formatReminderDate(reminder)}</Badge>

                  <Badge tone="blue">
                    {getRecurrenceLabel(reminder.recurrence)}
                  </Badge>

                  {reminder.recurrence !== "none" &&
                    reminder.recurrenceEndDate && (
                      <Badge tone="purple">
                        Até {formatDate(reminder.recurrenceEndDate)}
                      </Badge>
                    )}
                </div>
              </div>

              <div style={{height: "stretch"}} className="flex flex-col min-w-fit gap-2 justify-between">
                { !reminder.completed && (
                  <Button
                    type="button"
                    onClick={() => void onCompleteReminder(reminder.id)}
                  >
                    Concluir
                  </Button>
                )}
                { reminder.taskId && (
                  <Button
                    type="button"
                    onClick={() => onTaskDetail(reminder.taskId!)}
                    variant="danger"
                  >
                    Ver Tarefa
                  </Button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
