import type { Task } from "@helpsenior/core";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTasks } from "./useTasks";

const taskUseCases = vi.hoisted(() => ({
  complete: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../../../config/firebase", () => ({
  db: {},
}));

vi.mock("@helpsenior/firebase", () => ({
  FirebaseTaskRepository: class FirebaseTaskRepository {},
}));

vi.mock("@helpsenior/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@helpsenior/core")>();

  return {
    ...original,
    CompleteTaskUseCase: class CompleteTaskUseCase {
      execute = taskUseCases.complete;
    },
    CreateTaskUseCase: class CreateTaskUseCase {
      execute = taskUseCases.create;
    },
    DeleteTaskUseCase: class DeleteTaskUseCase {
      execute = taskUseCases.delete;
    },
    ListTasksUseCase: class ListTasksUseCase {
      execute = taskUseCases.list;
    },
    UpdateTaskUseCase: class UpdateTaskUseCase {
      execute = taskUseCases.update;
    },
  };
});

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    userId: "user-1",
    title: "Tarefa",
    status: "pending",
    completed: false,
    createdAt: new Date("2026-07-01T10:00:00"),
    updatedAt: new Date("2026-07-01T10:00:00"),
    ...overrides,
  };
}

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    taskUseCases.list.mockResolvedValue({ tasks: [] });
    taskUseCases.create.mockResolvedValue({});
    taskUseCases.update.mockResolvedValue({});
    taskUseCases.complete.mockResolvedValue({});
    taskUseCases.delete.mockResolvedValue(undefined);
  });

  it("carrega e ordena as tarefas do usuário", async () => {
    const completed = createTask({
      id: "completed",
      status: "completed",
      completed: true,
      date: "2026-07-20",
    });
    const pending = createTask({
      id: "pending",
      date: "2026-07-30",
    });
    taskUseCases.list.mockResolvedValue({
      tasks: [completed, pending],
    });

    const { result } = renderHook(() => useTasks("user-1"));

    await waitFor(() => {
      expect(result.current.tasks.map((task) => task.id)).toEqual([
        "pending",
        "completed",
      ]);
    });
    expect(taskUseCases.list).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result.current.isLoading).toBe(false);
  });

  it("cria uma tarefa e recarrega a lista", async () => {
    const { result } = renderHook(() => useTasks("user-1"));
    await waitFor(() => expect(taskUseCases.list).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.createTask({
        title: "Comprar pão",
        description: "Na padaria",
      });
    });

    expect(taskUseCases.create).toHaveBeenCalledWith({
      userId: "user-1",
      title: "Comprar pão",
      description: "Na padaria",
      date: undefined,
      activityId: undefined,
    });
    expect(taskUseCases.list).toHaveBeenCalledTimes(2);
    expect(result.current.isCreating).toBe(false);
  });

  it("atualiza, conclui e exclui recarregando após cada operação", async () => {
    const { result } = renderHook(() => useTasks("user-1"));
    await waitFor(() => expect(taskUseCases.list).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.updateTask({
        taskId: "task-1",
        title: "Título atualizado",
      });
      await result.current.completeTask("task-1");
      await result.current.deleteTask("task-1");
    });

    expect(taskUseCases.update).toHaveBeenCalledWith({
      taskId: "task-1",
      title: "Título atualizado",
      description: undefined,
      date: undefined,
      activityId: undefined,
    });
    expect(taskUseCases.complete).toHaveBeenCalledWith({ taskId: "task-1" });
    expect(taskUseCases.delete).toHaveBeenCalledWith({ taskId: "task-1" });
    expect(taskUseCases.list).toHaveBeenCalledTimes(4);
  });

  it("expõe uma mensagem segura quando o carregamento falha", async () => {
    taskUseCases.list.mockRejectedValue(new Error("internal detail"));

    const { result } = renderHook(() => useTasks("user-1"));

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Não foi possível carregar as tarefas.",
      );
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("não carrega nem cria tarefas sem usuário autenticado", async () => {
    const { result } = renderHook(() => useTasks(null));
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      await result.current.createTask({ title: "Não deve criar" });
    });

    expect(taskUseCases.list).not.toHaveBeenCalled();
    expect(taskUseCases.create).not.toHaveBeenCalled();
    expect(result.current.tasks).toEqual([]);
  });
});
