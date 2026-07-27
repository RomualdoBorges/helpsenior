import { useEffect, useMemo, useState } from "react";

import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

import { CreateReminderForm } from "../features/reminders/components/CreateReminderForm";
import { DueReminderAlert } from "../features/reminders/components/DueReminderAlert";
import { ReminderList } from "../features/reminders/components/ReminderList";
import { Alert, Button, Card } from "../shared/ui";
import { useReminders, type CreateReminderInput, type UpdateReminderInput } from "../features/reminders/hooks/useReminders";
import { useTasks } from "../features/tasks/hooks/useTasks";
import { useNavigate } from "react-router-dom";

type ReminderFilter = "all" | "pending" | "completed" | "recurring";

interface TaskPageUser {
  id: string;
}

interface RemindersPageProps {
  user: TaskPageUser;
  reminders: Reminder[];
  dueReminders: Reminder[];
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
  user,
  dueReminders,
  notificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
  isNotificationAllowed,
  isNotificationDenied,
}: RemindersPageProps) {
  const navigate = useNavigate();
  const { tasks } = useTasks(user?.id ?? null)
  const {
    reminders,
    isLoadingReminders,
    isCreatingReminder,
    isDeletingReminder,
    remindersError,
    createReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
  } = useReminders(user?.id ?? null);

  const [selectedFilter, setSelectedFilter] = useState<ReminderFilter>("all");
  const [reminderStatus, setReminderStatus] = useState<"creating" | "">("");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

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
    setReminderStatus("")
    setSelectedReminder(null)
  }
    
  async function handleUpdateReminder(reminder: UpdateReminderInput) {

    await updateReminder(reminder);
    setReminderStatus("")
    setSelectedReminder(null)
  }
      
  async function handleDeleteReminder(reminder: Reminder) {
    const shouldDelete = window.confirm(
      `Deseja excluir o lembrete "${reminder.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    await deleteReminder(reminder.id);
    setSelectedReminder(null)
  }

  return (
    <>
      { !selectedReminder && reminderStatus === '' ? (
        <Card as="section" className="mt-8" aria-labelledby="reminders-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="reminders-title" className="m-0 text-[28px] font-bold">
                Meus lembretes
              </h2>

              <p className="simple-mode-secondary mt-2 text-base leading-6 text-slate-500">
                Crie lembretes com data, horário e recorrência para acompanhar
                compromissos e atividades importantes.
              </p>
            </div>

            {isNotificationSupported && notificationPermission !== "granted" && (
              <Button
                type="button"
                onClick={() => void requestNotificationPermission()}
                size="sm"
                variant="secondary"
                className="shrink-0"
              >
                Ativar notificações
              </Button>
            )}
          </div>

          {isNotificationAllowed && (
            <Alert tone="success" className="mt-4 text-sm">
              Notificações ativadas neste navegador.
            </Alert>
          )}

          {isNotificationDenied && (
            <Alert tone="error" className="mt-4 text-sm">
              As notificações estão bloqueadas neste navegador. Para ativar, altere
              a permissão nas configurações do site.
            </Alert>
          )}

          {!isNotificationSupported && (
            <Alert tone="warning" className="mt-4 text-sm">
              Este navegador não suporta notificações.
            </Alert>
          )}

          <div className="accessibility-summary mt-6 grid gap-4 md:grid-cols-4  ">
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

          {remindersError && (
            <Alert tone="error" className="mt-4">
              {remindersError}
            </Alert>
          )}

          <div className="accessibility-panel mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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

              <div className="flex flex-wrap gap-2 min-w-fit">
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
              emptyMessage={emptyMessages[selectedFilter]}
              onCompleteReminder={completeReminder}
              onSelectedReminder={setSelectedReminder}
              onTaskDetail={handleTaskDetail}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" variant="primary" onClick={() => setReminderStatus('creating')}>
              Criar novo Lembrete
            </Button>
          </div>
        </Card>
      ) : (
        <div>
          <Card as="section" className="mt-4" aria-labelledby="create-task">
            <div className="flex md:justify-between">
              <Button size="sm" variant="secondary"
                onClick={() => {
                  setReminderStatus('');
                  setSelectedReminder(null)
                }}>
                Voltar para a lista
              </Button>
              
              {reminderStatus === "" && (
                <div className="block md:flex md:gap-2">
                  <Button size="sm" variant="danger" onClick={() => handleDeleteReminder(selectedReminder!)}>
                    Excluir Lembrete
                  </Button>
                </div>
              )}
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
                  tasks={tasks}
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
