import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CompleteTaskStepUseCase,
  CompleteTaskUseCase,
  CreateTaskUseCase,
  ListTasksUseCase,
  type Task,
} from "@helpsenior/core";
import { FirebaseTaskRepository } from "@helpsenior/firebase";

import { db } from "../../../config/firebase";
import { getFirebaseFirestoreErrorMessage } from "../../../shared/errors/getFirebaseFirestoreErrorMessage";

interface CreateTaskStepInput {
  title: string;
  description?: string;
}

interface CreateTaskInput {
  title: string;
  description?: string;
  steps: CreateTaskStepInput[];
  date?: string;
}

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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

  const completeTaskStepUseCase = useMemo(
    () => new CompleteTaskStepUseCase(taskRepository),
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

      setTasks(result.tasks);
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
          steps: input.steps,
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

  const completeTaskStep = useCallback(
    async (taskId: string, stepId: string) => {
      try {
        setError(null);

        await completeTaskStepUseCase.execute({
          taskId,
          stepId,
        });

        await loadTasks();
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível concluir a etapa.",
          ),
        );
      }
    },
    [completeTaskStepUseCase, loadTasks],
  );

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    isLoading,
    isCreating,
    error,
    loadTasks,
    createTask,
    completeTask,
    completeTaskStep,
  };
}