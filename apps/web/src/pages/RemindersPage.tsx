import { useMemo, useState } from "react";

import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

import { CreateReminderForm } from "../features/reminders/components/CreateReminderForm";
import { DueReminderAlert } from "../features/reminders/components/DueReminderAlert";
import { ReminderList } from "../features/reminders/components/ReminderList";
import {
  Alert,
  Button,
  FilterBar,
  PageHeader,
  SummaryCard,
} from "../shared/ui";

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
  }) => Promise<boolean>;
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
  const [isCreateReminderOpen, setIsCreateReminderOpen] = useState(false);

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
      className="mx-auto mt-8 w-full max-w-7xl"
      aria-labelledby="reminders-title">
      <PageHeader
        titleId="reminders-title"
        title="Meus lembretes"
        description="Crie lembretes com data, horário e recorrência para acompanhar compromissos e atividades importantes."
        action={
          <Button
            type="button"
            size="lg"
            onClick={() => setIsCreateReminderOpen(true)}>
            Novo lembrete
          </Button>
        }
      />

      <div className="accessibility-summary mt-6 grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Vencidos"
          value={reminderSummary.due}
          tone="warning"
        />
        <SummaryCard label="Pendentes" value={reminderSummary.pending} />
        <SummaryCard
          label="Recorrentes"
          value={reminderSummary.recurring}
          tone="info"
        />
        <SummaryCard
          label="Concluídos"
          value={reminderSummary.completed}
          tone="success"
        />
      </div>

      <DueReminderAlert
        reminders={dueReminders}
        onCompleteReminder={completeReminder}
      />

      <CreateReminderForm
        isOpen={isCreateReminderOpen}
        isCreating={isCreatingReminder}
        onClose={() => setIsCreateReminderOpen(false)}
        onCreateReminder={createReminder}
      />

      {remindersError && (
        <Alert tone="error" className="mt-4">
          {remindersError}
        </Alert>
      )}

      <div className="accessibility-panel mt-6 rounded-2xl">
        <FilterBar
          title="Lista de lembretes"
          itemLabel="lembrete"
          filterLabel="Filtrar lembretes"
          visibleCount={filteredReminders.length}
          totalCount={reminders.length}
          options={reminderFilters.map((filter) => ({
            ...filter,
            count: filterCounts[filter.value],
          }))}
          selectedValue={selectedFilter}
          onChange={setSelectedFilter}
        />

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
