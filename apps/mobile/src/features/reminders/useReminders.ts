import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CompleteReminderUseCase,
  CreateReminderUseCase,
  DeleteReminderUseCase,
  ListRemindersUseCase,
  UpdateReminderUseCase,
  type Reminder,
  type ReminderRecurrence,
} from "@helpsenior/core";
import { FirebaseReminderRepository } from "@helpsenior/firebase";

import { db } from "@/src/config/firebase";
import { getFirebaseFirestoreErrorMessage } from "@/src/shared/errors/getFirebaseFirestoreErrorMessage";

export interface ReminderInput {
  title: string;
  description?: string;
  date: string;
  time?: string;
  recurrence?: ReminderRecurrence;
  recurrenceEndDate?: string;
  taskId?: string;
}

export interface UpdateReminderInput extends ReminderInput {
  reminderId: string;
}

function getDateTime(reminder: Reminder) {
  return `${reminder.date}T${reminder.time || "00:00"}`;
}

function sortReminders(reminders: Reminder[]) {
  return [...reminders].sort((first, second) => {
    if (first.completed !== second.completed) {
      return first.completed ? 1 : -1;
    }

    if (!first.completed) {
      return getDateTime(first).localeCompare(getDateTime(second));
    }

    return second.updatedAt.getTime() - first.updatedAt.getTime();
  });
}

function isDue(reminder: Reminder) {
  if (reminder.completed) return false;

  const reminderDate = new Date(
    `${reminder.date}T${reminder.time || "00:00"}:00`,
  );

  return reminderDate <= new Date();
}

export function useReminderAlertCount(userId: string | null) {
  const [alertCount, setAlertCount] = useState(0);
  const repository = useMemo(() => new FirebaseReminderRepository(db), []);
  const listUseCase = useMemo(
    () => new ListRemindersUseCase(repository),
    [repository],
  );

  useEffect(() => {
    let isActive = true;

    async function loadAlertCount() {
      if (!userId) {
        setAlertCount(0);
        return;
      }

      try {
        const result = await listUseCase.execute({ userId });

        if (isActive) {
          setAlertCount(result.reminders.filter(isDue).length);
        }
      } catch {
        if (isActive) {
          setAlertCount(0);
        }
      }
    }

    void loadAlertCount();

    return () => {
      isActive = false;
    };
  }, [listUseCase, userId]);

  return alertCount;
}

export function useReminders(userId: string | null) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new FirebaseReminderRepository(db), []);
  const createUseCase = useMemo(
    () => new CreateReminderUseCase(repository),
    [repository],
  );
  const listUseCase = useMemo(
    () => new ListRemindersUseCase(repository),
    [repository],
  );
  const updateUseCase = useMemo(
    () => new UpdateReminderUseCase(repository),
    [repository],
  );
  const completeUseCase = useMemo(
    () => new CompleteReminderUseCase(repository),
    [repository],
  );
  const deleteUseCase = useMemo(
    () => new DeleteReminderUseCase(repository),
    [repository],
  );

  const loadReminders = useCallback(async () => {
    if (!userId) {
      setReminders([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await listUseCase.execute({ userId });
      setReminders(sortReminders(result.reminders));
    } catch (caughtError) {
      setError(
        getFirebaseFirestoreErrorMessage(
          caughtError,
          "Não foi possível carregar os lembretes.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [listUseCase, userId]);

  const createReminder = useCallback(
    async (input: ReminderInput) => {
      if (!userId) return false;

      try {
        setIsSaving(true);
        setError(null);
        await createUseCase.execute({ userId, ...input });
        await loadReminders();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível criar o lembrete.",
          ),
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [createUseCase, loadReminders, userId],
  );

  const updateReminder = useCallback(
    async (input: UpdateReminderInput) => {
      try {
        setIsSaving(true);
        setError(null);
        await updateUseCase.execute(input);
        await loadReminders();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível atualizar o lembrete.",
          ),
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadReminders, updateUseCase],
  );

  const completeReminder = useCallback(
    async (reminderId: string) => {
      try {
        setError(null);
        await completeUseCase.execute({ reminderId });
        await loadReminders();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível concluir o lembrete.",
          ),
        );
        return false;
      }
    },
    [completeUseCase, loadReminders],
  );

  const deleteReminder = useCallback(
    async (reminderId: string) => {
      try {
        setIsDeleting(true);
        setError(null);
        await deleteUseCase.execute({ reminderId });
        await loadReminders();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível excluir o lembrete.",
          ),
        );
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteUseCase, loadReminders],
  );

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  return {
    reminders,
    isLoading,
    isSaving,
    isDeleting,
    error,
    createReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
  };
}
