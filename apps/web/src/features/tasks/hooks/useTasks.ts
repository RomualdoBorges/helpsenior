import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CompleteTaskUseCase,
  CreateTaskUseCase,
  DeleteTaskUseCase,
  ListTasksUseCase,
  type Task,
} from "@helpsenior/core";
import { FirebaseTaskRepository } from "@helpsenior/firebase";

import { db } from "../../../config/firebase";
import { getFirebaseFirestoreErrorMessage } from "../../../shared/errors/getFirebaseFirestoreErrorMessage";
import { sortTasks } from "../utils/sortTasks";

interface CreateTaskInput {
  title: string;
  description?: string;
  date?: string;
}

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskRepository = useMemo(() => new FirebaseTaskRepository(db), []);

  const createTaskUseCase = useMemo(
    () => new CreateTaskUseCase(taskRepository),
    [taskRepository],
  );

  const listTasksUseCase = useMemo(
    () => new ListTasksUseCase(taskRepository),
    [taskRepository],
  );

  const completeTaskUseCase = useMemo(
    () => new CompleteTaskUseCase(taskRepository),
    [taskRepository],
  );

  const deleteTaskUseCase = useMemo(
    () => new DeleteTaskUseCase(taskRepository),
    [taskRepository],
  );

  const loadTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await listTasksUseCase.execute({
        userId,
      });

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
  }, [listTasksUseCase, userId]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!userId) {
        return;
      }

      try {
        setIsCreating(true);
        setError(null);

        await createTaskUseCase.execute({
          userId,
          title: input.title,
          description: input.description,
          date: input.date,
        });

        await loadTasks();
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível criar a tarefa.",
          ),
        );
      } finally {
        setIsCreating(false);
      }
    },
    [createTaskUseCase, loadTasks, userId],
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null);

        await completeTaskUseCase.execute({
          taskId,
        });

        await loadTasks();
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível concluir a tarefa.",
          ),
        );
      }
    },
    [completeTaskUseCase, loadTasks],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        setIsDeleting(true);
        setError(null);

        await deleteTaskUseCase.execute({
          taskId,
        });

        await loadTasks();
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível excluir a tarefa.",
          ),
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteTaskUseCase, loadTasks],
  );

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    isLoading,
    isCreating,
    isDeleting,
    error,
    loadTasks,
    createTask,
    completeTask,
    deleteTask,
  };
}
