import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Task } from "@helpsenior/core";

import { useTasks } from "../useTasks";

const useCaseMocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  complete: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@helpsenior/firebase", () => ({
  FirebaseTaskRepository: class FirebaseTaskRepository {},
}));

vi.mock("@helpsenior/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@helpsenior/core")>();

  return {
    ...original,
    ListTasksUseCase: class ListTasksUseCase {
      execute = useCaseMocks.list;
    },
    CreateTaskUseCase: class CreateTaskUseCase {
      execute = useCaseMocks.create;
    },
    UpdateTaskUseCase: class UpdateTaskUseCase {
      execute = useCaseMocks.update;
    },
    CompleteTaskUseCase: class CompleteTaskUseCase {
      execute = useCaseMocks.complete;
    },
    DeleteTaskUseCase: class DeleteTaskUseCase {
      execute = useCaseMocks.delete;
    },
  };
});

vi.mock("@/src/config/firebase", () => ({ db: {} }));

function createTask(input: Partial<Task> & { id: string }): Task {
  return {
    id: input.id,
    userId: "user-1",
    title: input.title ?? input.id,
    date: input.date,
    status: input.completed ? "completed" : "pending",
    completed: input.completed ?? false,
    createdAt: input.createdAt ?? new Date("2026-07-01T12:00:00"),
    updatedAt: input.updatedAt ?? new Date("2026-07-01T12:00:00"),
  };
}

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCaseMocks.list.mockResolvedValue({ tasks: [] });
    useCaseMocks.create.mockResolvedValue({});
    useCaseMocks.update.mockResolvedValue({});
    useCaseMocks.complete.mockResolvedValue({});
    useCaseMocks.delete.mockResolvedValue({});
  });

  it("carrega e ordena tarefas pendentes antes das concluídas", async () => {
    useCaseMocks.list.mockResolvedValue({
      tasks: [
        createTask({ id: "completed", completed: true }),
        createTask({ id: "without-date" }),
        createTask({ id: "later", date: "2026-08-02" }),
        createTask({ id: "first", date: "2026-08-01" }),
      ],
    });

    const { result } = renderHook(() => useTasks("user-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tasks.map((task) => task.id)).toEqual([
      "first",
      "later",
      "without-date",
      "completed",
    ]);
    expect(useCaseMocks.list).toHaveBeenCalledWith({ userId: "user-1" });
  });

  it("cria a tarefa e recarrega a lista", async () => {
    const { result } = renderHook(() => useTasks("user-1"));
    await waitFor(() => expect(useCaseMocks.list).toHaveBeenCalledTimes(1));

    let didCreate = false;
    await act(async () => {
      didCreate = await result.current.createTask({
        title: "Consulta",
        date: "2026-08-01",
      });
    });

    expect(didCreate).toBe(true);
    expect(useCaseMocks.create).toHaveBeenCalledWith({
      userId: "user-1",
      title: "Consulta",
      date: "2026-08-01",
    });
    expect(useCaseMocks.list).toHaveBeenCalledTimes(2);
    expect(result.current.isSaving).toBe(false);
  });

  it("expõe uma mensagem segura quando a criação falha", async () => {
    useCaseMocks.create.mockRejectedValue({ code: "permission-denied" });
    const { result } = renderHook(() => useTasks("user-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      expect(await result.current.createTask({ title: "Consulta" })).toBe(
        false,
      );
    });

    expect(result.current.error).toBe(
      "Você não tem permissão para acessar essas informações.",
    );
    expect(result.current.isSaving).toBe(false);
  });

  it("não consulta nem cria tarefas sem usuário autenticado", async () => {
    const { result } = renderHook(() => useTasks(null));

    await act(async () => {
      expect(await result.current.createTask({ title: "Consulta" })).toBe(
        false,
      );
    });

    expect(result.current.tasks).toEqual([]);
    expect(useCaseMocks.list).not.toHaveBeenCalled();
    expect(useCaseMocks.create).not.toHaveBeenCalled();
  });
});
