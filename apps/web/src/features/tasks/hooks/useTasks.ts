import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CompleteTaskUseCase,
  CreateTaskUseCase,
  DeleteTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
  type Task,
} from "@helpsenior/core";
import { FirebaseTaskRepository } from "@helpsenior/firebase/tasks";

import { db } from "../../../config/firebase";
import { getFirebaseFirestoreErrorMessage } from "../../../shared/errors/getFirebaseFirestoreErrorMessage";
import { sortTasks } from "../utils/sortTasks";

interface CreateTaskInput {
  title: string;
  description?: string;
  date?: string;
}

interface UpdateTaskInput {
  taskId: string;
  title: string;
  description?: string;
  date?: string;
}

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);
  const activeUserIdRef = useRef(userId);

  useEffect(() => {
    activeUserIdRef.current = userId;
  }, [userId]);

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

  const updateTaskUseCase = useMemo(
    () => new UpdateTaskUseCase(taskRepository),
    [taskRepository],
  );

  const loadTasks = useCallback(async () => {
    if (userId !== activeUserIdRef.current) {
      return;
    }

    const requestId = ++loadRequestIdRef.current;

    if (!userId) {
      setTasks([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await listTasksUseCase.execute({
        userId,
      });

      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setTasks(sortTasks(result.tasks));
      }
    } catch (caughtError) {
      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível carregar as tarefas.",
          ),
        );
      }
    } finally {
      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setIsLoading(false);
      }
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

  const updateTask = useCallback(
    async (input: UpdateTaskInput) => {
      try {
        setIsUpdating(true);
        setError(null);

        await updateTaskUseCase.execute({
          taskId: input.taskId,
          title: input.title,
          description: input.description,
          date: input.date,
        });

        await loadTasks();
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível atualizar a tarefa.",
          ),
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [loadTasks, updateTaskUseCase],
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
    const timeoutId = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      loadRequestIdRef.current += 1;
    };
  }, [loadTasks]);

  return {
    tasks,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    loadTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  };
}
