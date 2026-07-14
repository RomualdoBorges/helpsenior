import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CompleteReminderUseCase,
  CreateReminderUseCase,
  DeleteReminderUseCase,
  ListRemindersUseCase,
  UpdateReminderUseCase,
  type Reminder,
  type ReminderRecurrence,
} from "@helpsenior/core";
import { FirebaseReminderRepository } from "@helpsenior/firebase/reminders";

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

interface UpdateReminderInput {
  reminderId: string;
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
  const [isUpdatingReminder, setIsUpdatingReminder] = useState(false);
  const [isDeletingReminder, setIsDeletingReminder] = useState(false);
  const [remindersError, setRemindersError] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);
  const activeUserIdRef = useRef(userId);

  useEffect(() => {
    activeUserIdRef.current = userId;
  }, [userId]);

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

  const updateReminderUseCase = useMemo(
    () => new UpdateReminderUseCase(reminderRepository),
    [reminderRepository],
  );

  const loadReminders = useCallback(async () => {
    if (userId !== activeUserIdRef.current) {
      return;
    }

    const requestId = ++loadRequestIdRef.current;

    if (!userId) {
      setReminders([]);
      setIsLoadingReminders(false);
      setRemindersError(null);
      return;
    }

    try {
      setIsLoadingReminders(true);
      setRemindersError(null);

      const result = await listRemindersUseCase.execute({
        userId,
      });

      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setReminders(sortReminders(result.reminders));
      }
    } catch (caughtError) {
      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setRemindersError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível carregar os lembretes.",
          ),
        );
      }
    } finally {
      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setIsLoadingReminders(false);
      }
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

  const updateReminder = useCallback(
    async (input: UpdateReminderInput) => {
      try {
        setIsUpdatingReminder(true);
        setRemindersError(null);

        await updateReminderUseCase.execute({
          reminderId: input.reminderId,
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
            "Não foi possível atualizar o lembrete.",
          ),
        );
      } finally {
        setIsUpdatingReminder(false);
      }
    },
    [loadReminders, updateReminderUseCase],
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
    const timeoutId = window.setTimeout(() => {
      void loadReminders();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      loadRequestIdRef.current += 1;
    };
  }, [loadReminders]);

  return {
    reminders,
    isLoadingReminders,
    isCreatingReminder,
    isUpdatingReminder,
    isDeletingReminder,
    remindersError,
    loadReminders,
    createReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
  };
}
