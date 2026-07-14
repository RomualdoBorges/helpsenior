import { useMemo, useState } from "react";

import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

import { CreateReminderForm } from "../features/reminders/components/CreateReminderForm";
import { DueReminderAlert } from "../features/reminders/components/DueReminderAlert";
import { ReminderList } from "../features/reminders/components/ReminderList";
import { Alert, Button } from "../shared/ui";

type ReminderFilter = "all" | "pending" | "completed" | "recurring";

interface RemindersPageProps {
  reminders: Reminder[];
  dueReminders: Reminder[];
  isLoadingReminders: boolean;
  isCreatingReminder: boolean;
  isUpdatingReminder: boolean;
  isDeletingReminder: boolean;
  remindersError: string | null;
  createReminder: (input: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    recurrence?: ReminderRecurrence;
    recurrenceEndDate?: string;
  }) => Promise<void>;
  updateReminder: (input: {
    reminderId: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    recurrence?: ReminderRecurrence;
    recurrenceEndDate?: string;
  }) => Promise<void>;
  completeReminder: (reminderId: string) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
}

const reminderFilters: Array<{
  value: ReminderFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "pending",
    label: "Pendentes",
  },
  {
    value: "completed",
    label: "Concluídos",
  },
  {
    value: "recurring",
    label: "Recorrentes",
  },
];

const emptyMessages: Record<ReminderFilter, string> = {
  all: "Nenhum lembrete cadastrado ainda.",
  pending: "Nenhum lembrete pendente.",
  completed: "Nenhum lembrete concluído.",
  recurring: "Nenhum lembrete recorrente.",
};

function filterReminders(reminders: Reminder[], filter: ReminderFilter) {
  if (filter === "pending") {
    return reminders.filter((reminder) => !reminder.completed);
  }

  if (filter === "completed") {
    return reminders.filter((reminder) => reminder.completed);
  }

  if (filter === "recurring") {
    return reminders.filter((reminder) => reminder.recurrence !== "none");
  }

  return reminders;
}

function getReminderFilterCounts(reminders: Reminder[]) {
  return {
    all: reminders.length,
    pending: reminders.filter((reminder) => !reminder.completed).length,
    completed: reminders.filter((reminder) => reminder.completed).length,
    recurring: reminders.filter((reminder) => reminder.recurrence !== "none")
      .length,
  };
}

function getReminderSummary(reminders: Reminder[], dueReminders: Reminder[]) {
  return {
    due: dueReminders.length,
    pending: reminders.filter((reminder) => !reminder.completed).length,
    recurring: reminders.filter((reminder) => reminder.recurrence !== "none")
      .length,
    completed: reminders.filter((reminder) => reminder.completed).length,
  };
}

export function RemindersPage({
  reminders,
  dueReminders,
  isLoadingReminders,
  isCreatingReminder,
  isUpdatingReminder,
  isDeletingReminder,
  remindersError,
  createReminder,
  updateReminder,
  completeReminder,
  deleteReminder,
}: RemindersPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<ReminderFilter>("all");

  const filteredReminders = useMemo(
    () => filterReminders(reminders, selectedFilter),
    [reminders, selectedFilter],
  );

  const filterCounts = useMemo(
    () => getReminderFilterCounts(reminders),
    [reminders],
  );

  const reminderSummary = useMemo(
    () => getReminderSummary(reminders, dueReminders),
    [dueReminders, reminders],
  );

  return (
    <section
      className="mx-auto mt-8 w-full max-w-6xl"
      aria-labelledby="reminders-title"
    >
      <div>
        <h2 id="reminders-title" className="m-0 text-[28px] font-bold">
          Meus lembretes
        </h2>

        <p className="simple-mode-secondary mt-2 text-base leading-6 text-slate-500">
          Crie lembretes com data, horário e recorrência para acompanhar
          compromissos e atividades importantes.
        </p>
      </div>

      <div className="accessibility-summary mt-6 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="m-0 text-sm font-bold text-amber-800">Vencidos</p>
          <strong className="mt-2 block text-3xl text-amber-950">
            {reminderSummary.due}
          </strong>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-sm font-bold text-slate-600">Pendentes</p>
          <strong className="mt-2 block text-3xl text-slate-950">
            {reminderSummary.pending}
          </strong>
        </article>

        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="m-0 text-sm font-bold text-blue-700">Recorrentes</p>
          <strong className="mt-2 block text-3xl text-blue-950">
            {reminderSummary.recurring}
          </strong>
        </article>

        <article className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="m-0 text-sm font-bold text-green-700">Concluídos</p>
          <strong className="mt-2 block text-3xl text-green-950">
            {reminderSummary.completed}
          </strong>
        </article>
      </div>

      <DueReminderAlert
        reminders={dueReminders}
        onCompleteReminder={completeReminder}
      />

      <CreateReminderForm
        isCreating={isCreatingReminder}
        onCreateReminder={createReminder}
      />

      {remindersError && (
        <Alert tone="error" className="mt-4">
          {remindersError}
        </Alert>
      )}

      <div className="accessibility-panel mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="m-0 text-xl font-bold text-slate-950">
              Lista de lembretes
            </h3>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {filteredReminders.length} de {reminders.length} lembrete
              {reminders.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {reminderFilters.map((filter) => {
              const isSelected = selectedFilter === filter.value;

              return (
                <Button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  size="sm"
                  variant={isSelected ? "primary" : "secondary"}
                  className="rounded-full"
                >
                  {filter.label} ({filterCounts[filter.value]})
                </Button>
              );
            })}
          </div>
        </div>

        <ReminderList
          reminders={filteredReminders}
          isLoading={isLoadingReminders}
          isUpdating={isUpdatingReminder}
          isDeleting={isDeletingReminder}
          emptyMessage={emptyMessages[selectedFilter]}
          onUpdateReminder={updateReminder}
          onCompleteReminder={completeReminder}
          onDeleteReminder={deleteReminder}
        />
      </div>
    </section>
  );
}
