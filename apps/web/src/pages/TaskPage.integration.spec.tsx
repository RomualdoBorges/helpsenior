import type { Activity, Task } from "@helpsenior/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskPage } from "./TaskPage";

const taskPageMocks = vi.hoisted(() => ({
  completeTask: vi.fn(),
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTask: vi.fn(),
}));

const pendingTask: Task = {
  id: "pending-task",
  userId: "user-1",
  title: "Comprar pão",
  status: "pending",
  completed: false,
  date: "2026-07-30",
  createdAt: new Date("2026-07-01T10:00:00"),
  updatedAt: new Date("2026-07-01T10:00:00"),
};

const completedTask: Task = {
  ...pendingTask,
  id: "completed-task",
  title: "Pagar conta",
  status: "completed",
  completed: true,
};

const linkedActivity: Activity = {
  id: "activity-1",
  userId: "user-1",
  title: "Preparar documentos",
  steps: [{ order: 1, description: "Separar documento com foto" }],
  createdAt: new Date("2026-07-01T10:00:00"),
  updatedAt: new Date("2026-07-01T10:00:00"),
};

vi.mock("../features/tasks/hooks/useTasks", () => ({
  useTasks: () => ({
    tasks: [pendingTask, completedTask],
    isLoading: false,
    isCreating: false,
    error: null,
    createTask: taskPageMocks.createTask,
    updateTask: taskPageMocks.updateTask,
    completeTask: taskPageMocks.completeTask,
    deleteTask: taskPageMocks.deleteTask,
  }),
}));

vi.mock("../features/activities/hooks/useActivities", () => ({
  useActivities: () => ({
    activities: [linkedActivity],
  }),
}));

function renderTaskPage() {
  return render(
    <MemoryRouter>
      <TaskPage user={{ id: "user-1" }} />
    </MemoryRouter>,
  );
}

describe("TaskPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    taskPageMocks.completeTask.mockResolvedValue(undefined);
    taskPageMocks.createTask.mockResolvedValue(undefined);
    taskPageMocks.deleteTask.mockResolvedValue(undefined);
    taskPageMocks.updateTask.mockResolvedValue(undefined);
  });

  it("abre o formulário, cria uma tarefa e volta à lista", async () => {
    const user = userEvent.setup();
    renderTaskPage();

    await user.click(screen.getByRole("button", { name: "Nova tarefa" }));
    await user.type(screen.getByLabelText("Título"), "Agendar consulta");
    await user.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(taskPageMocks.createTask).toHaveBeenCalledWith({
      title: "Agendar consulta",
      description: undefined,
      date: undefined,
      activityId: undefined,
    });
    expect(
      screen.getByRole("heading", { name: "Minhas tarefas" }),
    ).toBeInTheDocument();
  });

  it("cria uma tarefa vinculada a uma atividade", async () => {
    const user = userEvent.setup();
    renderTaskPage();

    await user.click(screen.getByRole("button", { name: "Nova tarefa" }));
    await user.type(screen.getByLabelText("Título"), "Ir ao banco");
    await user.selectOptions(
      screen.getByLabelText("Atividade (opcional)"),
      linkedActivity.id,
    );
    await user.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(taskPageMocks.createTask).toHaveBeenCalledWith({
      title: "Ir ao banco",
      description: undefined,
      date: undefined,
      activityId: "activity-1",
    });
  });

  it("filtra tarefas concluídas e preserva as ações permitidas", async () => {
    const user = userEvent.setup();
    renderTaskPage();

    await user.click(screen.getByRole("button", { name: /Concluídas/ }));

    expect(screen.getByText("Pagar conta")).toBeInTheDocument();
    expect(screen.queryByText("Comprar pão")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("conclui uma tarefa pela lista", async () => {
    const user = userEvent.setup();
    renderTaskPage();

    await user.click(screen.getByRole("button", { name: "Concluir" }));

    expect(taskPageMocks.completeTask).toHaveBeenCalledWith("pending-task");
  });
});
