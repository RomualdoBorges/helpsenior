import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CompleteTaskUseCase,
  CreateTaskUseCase,
  DeleteTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
  type Task,
} from "@helpsenior/core";
import { FirebaseTaskRepository } from "@helpsenior/firebase";

import { db } from "@/src/config/firebase";
import { getFirebaseFirestoreErrorMessage } from "@/src/shared/errors/getFirebaseFirestoreErrorMessage";

export interface TaskInput {
  title: string;
  description?: string;
  date?: string;
  activityId?: string;
}

export interface UpdateTaskInput extends TaskInput {
  taskId: string;
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((first, second) => {
    if (first.completed !== second.completed) {
      return first.completed ? 1 : -1;
    }

    const firstDate = first.date
      ? new Date(`${first.date}T00:00:00`).getTime()
      : Number.POSITIVE_INFINITY;
    const secondDate = second.date
      ? new Date(`${second.date}T00:00:00`).getTime()
      : Number.POSITIVE_INFINITY;

    return (
      firstDate - secondDate ||
      second.createdAt.getTime() - first.createdAt.getTime()
    );
  });
}

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new FirebaseTaskRepository(db), []);
  const createUseCase = useMemo(
    () => new CreateTaskUseCase(repository),
    [repository],
  );
  const listUseCase = useMemo(
    () => new ListTasksUseCase(repository),
    [repository],
  );
  const updateUseCase = useMemo(
    () => new UpdateTaskUseCase(repository),
    [repository],
  );
  const completeUseCase = useMemo(
    () => new CompleteTaskUseCase(repository),
    [repository],
  );
  const deleteUseCase = useMemo(
    () => new DeleteTaskUseCase(repository),
    [repository],
  );

  const loadTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await listUseCase.execute({ userId });
      setTasks(sortTasks(result.tasks));
    } catch (caughtError) {
      setError(
        getFirebaseFirestoreErrorMessage(
          caughtError,
          "Não foi possível carregar as tarefas.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [listUseCase, userId]);

  const createTask = useCallback(
    async (input: TaskInput) => {
      if (!userId) return false;

      try {
        setIsSaving(true);
        setError(null);
        await createUseCase.execute({ userId, ...input });
        await loadTasks();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível criar a tarefa.",
          ),
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [createUseCase, loadTasks, userId],
  );

  const updateTask = useCallback(
    async (input: UpdateTaskInput) => {
      try {
        setIsSaving(true);
        setError(null);
        await updateUseCase.execute(input);
        await loadTasks();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível atualizar a tarefa.",
          ),
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadTasks, updateUseCase],
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null);
        await completeUseCase.execute({ taskId });
        await loadTasks();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível concluir a tarefa.",
          ),
        );
        return false;
      }
    },
    [completeUseCase, loadTasks],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        setIsDeleting(true);
        setError(null);
        await deleteUseCase.execute({ taskId });
        await loadTasks();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível excluir a tarefa.",
          ),
        );
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteUseCase, loadTasks],
  );

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    isLoading,
    isSaving,
    isDeleting,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  };
}
