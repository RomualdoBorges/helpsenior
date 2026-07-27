import { useMemo, useState } from "react";

import type { Reminder } from "@helpsenior/core";

import { CreateReminderForm } from "../features/reminders/components/CreateReminderForm";
import { DueReminderAlert } from "../features/reminders/components/DueReminderAlert";
import { ReminderList } from "../features/reminders/components/ReminderList";
import { Alert, BigNumberCard, Button, Card, FilterTabs } from "../shared/ui";
import type {
  CreateReminderInput,
  UpdateReminderInput,
} from "../features/reminders/hooks/useReminders";
import { useNavigate } from "react-router-dom";

type ReminderFilter = "all" | "pending" | "completed" | "recurring";

interface TaskPageUser {
  id: string;
}

interface RemindersPageProps {
  user: TaskPageUser;
  reminders: Reminder[];
  dueReminders: Reminder[];
  isLoadingReminders: boolean;
  isCreatingReminder: boolean;
  remindersError: string | null;
  createReminder: (input: CreateReminderInput) => Promise<void>;
  updateReminder: (input: UpdateReminderInput) => Promise<void>;
  completeReminder: (reminderId: string) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  notificationPermission: "default" | "granted" | "denied" | "unsupported";
  requestNotificationPermission: () => Promise<void>;
  isNotificationSupported: boolean;
  isNotificationAllowed: boolean;
  isNotificationDenied: boolean;
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
  remindersError,
  createReminder,
  updateReminder,
  completeReminder,
  deleteReminder,
  notificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
  isNotificationAllowed,
  isNotificationDenied,
}: RemindersPageProps) {
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] = useState<ReminderFilter>("all");
  const [reminderStatus, setReminderStatus] = useState<"creating" | "">("");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null,
  );

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

  async function handleTaskDetail(taskId: string) {
    navigate("/tarefas", {
      state: { taskId },
    });
  }

  async function handleCreateReminder(reminder: CreateReminderInput) {
    await createReminder(reminder);
    setReminderStatus("");
    setSelectedReminder(null);
  }

  async function handleUpdateReminder(reminder: UpdateReminderInput) {
    await updateReminder(reminder);
    setReminderStatus("");
    setSelectedReminder(null);
  }

  async function handleDeleteReminder(reminder: Reminder) {
    const shouldDelete = window.confirm(
      `Deseja excluir o lembrete "${reminder.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    await deleteReminder(reminder.id);
    setSelectedReminder(null);
  }

  return (
    <>
      {!selectedReminder && reminderStatus === "" ? (
        <Card
          as="section"
          className="reminders-page mt-8"
          aria-labelledby="reminders-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="reminders-title"
                className="reminders-page-title m-0 text-[28px] font-bold text-violet-700">
                Meus lembretes
              </h2>

              <p className="simple-mode-secondary mt-0 text-base leading-6 text-slate-500">
                Crie lembretes com data, horário e recorrência para acompanhar
                compromissos e atividades importantes.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              {isNotificationSupported &&
                notificationPermission !== "granted" && (
                  <Button
                    type="button"
                    onClick={() => void requestNotificationPermission()}
                    size="sm"
                    variant="secondary">
                    Ativar notificações
                  </Button>
                )}

              <Button
                size="sm"
                variant="primary"
                className="reminders-primary-action flex items-center justify-center gap-2"
                onClick={() => setReminderStatus("creating")}>
                <span aria-hidden="true" className="text-xl leading-none">
                  +
                </span>
                Novo lembrete
              </Button>
            </div>
          </div>

          {isNotificationAllowed && (
            <Alert tone="success" className="mt-4 text-sm">
              Notificações ativadas neste navegador.
            </Alert>
          )}

          {isNotificationDenied && (
            <Alert tone="error" className="mt-4 text-sm">
              As notificações estão bloqueadas neste navegador. Para ativar,
              altere a permissão nas configurações do site.
            </Alert>
          )}

          {!isNotificationSupported && (
            <Alert tone="warning" className="mt-4 text-sm">
              Este navegador não suporta notificações.
            </Alert>
          )}

          <div className="reminders-summary accessibility-summary mt-6 grid gap-4 md:grid-cols-4">
            <BigNumberCard
              label="Vencidos"
              value={reminderSummary.due}
              tone="amber"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6M12 17h.01" />
                </svg>
              }
            />
            <BigNumberCard
              label="Pendentes"
              value={reminderSummary.pending}
              tone="slate"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                </svg>
              }
            />
            <BigNumberCard
              label="Recorrentes"
              value={reminderSummary.recurring}
              tone="blue"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="m17 2 3 3-3 3M20 5H9a5 5 0 0 0-5 5M7 22l-3-3 3-3M4 19h11a5 5 0 0 0 5-5" />
                </svg>
              }
            />
            <BigNumberCard
              label="Concluídos"
              value={reminderSummary.completed}
              tone="green"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 2.5 2.5L16 9" />
                </svg>
              }
            />
          </div>

          <DueReminderAlert
            reminders={dueReminders}
            onCompleteReminder={completeReminder}
          />

          {remindersError && (
            <Alert tone="error" className="mt-4">
              {remindersError}
            </Alert>
          )}

          <div className="accessibility-panel mt-6 rounded-2xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between items-start">
              <div>
                <h3 className="m-0 text-xl font-bold text-slate-950">
                  Lista de lembretes
                </h3>

                <p className="mt-1 text-sm font-bold text-slate-500">
                  {filteredReminders.length} de {reminders.length} lembrete
                  {reminders.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="reminders-filters w-full md:w-auto">
                <FilterTabs
                  ariaLabel="Filtrar lembretes"
                  options={reminderFilters.map((filter) => ({
                    ...filter,
                    count: filterCounts[filter.value],
                  }))}
                  value={selectedFilter}
                  onChange={setSelectedFilter}
                />
              </div>
            </div>

            <ReminderList
              reminders={filteredReminders}
              isLoading={isLoadingReminders}
              emptyMessage={emptyMessages[selectedFilter]}
              onCompleteReminder={completeReminder}
              onDeleteReminder={handleDeleteReminder}
              onSelectedReminder={setSelectedReminder}
              onTaskDetail={handleTaskDetail}
            />
          </div>
        </Card>
      ) : (
        <div className="reminders-page">
          <Card as="section" aria-labelledby="create-reminder">
            <div className="flex">
              <Button
                size="sm"
                variant="primary"
                className="reminders-primary-action flex items-center gap-2"
                onClick={() => {
                  setReminderStatus("");
                  setSelectedReminder(null);
                }}>
                <span aria-hidden="true">←</span>
                Voltar para a lista
              </Button>
            </div>

            {remindersError && (
              <Alert tone="error" className="mt-4">
                {remindersError}
              </Alert>
            )}

            <div>
              <Card as="section" className="mt-8" aria-labelledby="create-form">
                <CreateReminderForm
                  reminder={selectedReminder}
                  isCreating={isCreatingReminder}
                  onUpdateReminder={handleUpdateReminder}
                  onCreateReminder={handleCreateReminder}
                />
              </Card>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
