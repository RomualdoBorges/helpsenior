import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CompleteReminderUseCase,
  CreateReminderUseCase,
  DeleteReminderUseCase,
  ListRemindersUseCase,
  type Reminder,
  type ReminderRecurrence,
} from "@helpsenior/core";
import { FirebaseReminderRepository } from "@helpsenior/firebase";

import { db } from "../../../config/firebase";
import { getFirebaseFirestoreErrorMessage } from "../../../shared/errors/getFirebaseFirestoreErrorMessage";
import { sortReminders } from "../utils/sortReminders";

interface CreateReminderInput {
  title: string;
  description?: string;
  date: string;
  time?: string;
  recurrence?: ReminderRecurrence;
  recurrenceEndDate?: string;
}

export function useReminders(userId: string | null) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);
  const [isCreatingReminder, setIsCreatingReminder] = useState(false);
  const [isDeletingReminder, setIsDeletingReminder] = useState(false);
  const [remindersError, setRemindersError] = useState<string | null>(null);

  const reminderRepository = useMemo(
    () => new FirebaseReminderRepository(db),
    [],
  );

  const createReminderUseCase = useMemo(
    () => new CreateReminderUseCase(reminderRepository),
    [reminderRepository],
  );

  const listRemindersUseCase = useMemo(
    () => new ListRemindersUseCase(reminderRepository),
    [reminderRepository],
  );

  const completeReminderUseCase = useMemo(
    () => new CompleteReminderUseCase(reminderRepository),
    [reminderRepository],
  );

  const deleteReminderUseCase = useMemo(
    () => new DeleteReminderUseCase(reminderRepository),
    [reminderRepository],
  );

  const loadReminders = useCallback(async () => {
    if (!userId) {
      setReminders([]);
      return;
    }

    try {
      setIsLoadingReminders(true);
      setRemindersError(null);

      const result = await listRemindersUseCase.execute({
        userId,
      });

      setReminders(sortReminders(result.reminders));
    } catch (caughtError) {
      setRemindersError(
        getFirebaseFirestoreErrorMessage(
          caughtError,
          "Não foi possível carregar os lembretes.",
        ),
      );
    } finally {
      setIsLoadingReminders(false);
    }
  }, [listRemindersUseCase, userId]);

  const createReminder = useCallback(
    async (input: CreateReminderInput) => {
      if (!userId) {
        return;
      }

      try {
        setIsCreatingReminder(true);
        setRemindersError(null);

        await createReminderUseCase.execute({
          userId,
          title: input.title,
          description: input.description,
          date: input.date,
          time: input.time,
          recurrence: input.recurrence,
          recurrenceEndDate: input.recurrenceEndDate,
        });

        await loadReminders();
      } catch (caughtError) {
        setRemindersError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível criar o lembrete.",
          ),
        );
      } finally {
        setIsCreatingReminder(false);
      }
    },
    [createReminderUseCase, loadReminders, userId],
  );

  const completeReminder = useCallback(
    async (reminderId: string) => {
      try {
        setRemindersError(null);

        await completeReminderUseCase.execute({
          reminderId,
        });

        await loadReminders();
      } catch (caughtError) {
        setRemindersError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível concluir o lembrete.",
          ),
        );
      }
    },
    [completeReminderUseCase, loadReminders],
  );

  const deleteReminder = useCallback(
    async (reminderId: string) => {
      try {
        setIsDeletingReminder(true);
        setRemindersError(null);

        await deleteReminderUseCase.execute({
          reminderId,
        });

        await loadReminders();
      } catch (caughtError) {
        setRemindersError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível excluir o lembrete.",
          ),
        );
      } finally {
        setIsDeletingReminder(false);
      }
    },
    [deleteReminderUseCase, loadReminders],
  );

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  return {
    reminders,
    isLoadingReminders,
    isCreatingReminder,
    isDeletingReminder,
    remindersError,
    loadReminders,
    createReminder,
    completeReminder,
    deleteReminder,
  };
}