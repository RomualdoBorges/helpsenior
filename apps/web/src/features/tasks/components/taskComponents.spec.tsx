import type { Activity, Task } from "@helpsenior/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateTaskForm } from "./CreateTaskForm";
import { TaskList } from "./TaskList";

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    userId: "user-1",
    title: "Pagar conta",
    status: "pending",
    completed: false,
    createdAt: new Date("2026-07-01T10:00:00"),
    updatedAt: new Date("2026-07-01T10:00:00"),
    ...overrides,
  };
}

const activity: Activity = {
  id: "activity-1",
  userId: "user-1",
  title: "Preparar pagamento",
  steps: [
    { order: 2, description: "Guardar comprovante" },
    { order: 1, description: "Conferir o valor" },
  ],
  createdAt: new Date("2026-07-01T10:00:00"),
  updatedAt: new Date("2026-07-01T10:00:00"),
};

describe("CreateTaskForm", () => {
  it("valida o título antes de criar", () => {
    const onCreateTask = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateTaskForm
        isCreating={false}
        activities={[]}
        onCreateTask={onCreateTask}
        onUpdateTask={vi.fn()}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: "Criar tarefa",
    });
    const form = submitButton.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(screen.getByText("Informe o título da tarefa.")).toBeInTheDocument();
    expect(onCreateTask).not.toHaveBeenCalled();
  });

  it("normaliza e envia os dados preenchidos", async () => {
    const user = userEvent.setup();
    const onCreateTask = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateTaskForm
        isCreating={false}
        activities={[activity]}
        onCreateTask={onCreateTask}
        onUpdateTask={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Título"), "  Pagar água  ");
    await user.type(screen.getByLabelText("Descrição"), "  Até sexta  ");
    fireEvent.change(screen.getByLabelText("Data (opcional)"), {
      target: { value: "2026-07-31" },
    });
    await user.selectOptions(
      screen.getByLabelText("Atividade (opcional)"),
      activity.id,
    );
    await user.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(onCreateTask).toHaveBeenCalledWith({
      title: "Pagar água",
      description: "Até sexta",
      date: "2026-07-31",
      activityId: "activity-1",
    });
    expect(screen.getByLabelText("Título")).toHaveValue("");
  });

  it("carrega e atualiza uma tarefa existente", async () => {
    const user = userEvent.setup();
    const onUpdateTask = vi.fn().mockResolvedValue(undefined);
    const task = createTask({
      description: "Descrição anterior",
      date: "2026-07-30",
      activityId: activity.id,
    });
    render(
      <CreateTaskForm
        task={task}
        isCreating={false}
        activities={[activity]}
        onCreateTask={vi.fn()}
        onUpdateTask={onUpdateTask}
      />,
    );

    expect(screen.getByLabelText("Título")).toHaveValue("Pagar conta");
    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "Conta atualizada");
    await user.click(
      screen.getByRole("button", { name: "Atualizar tarefa" }),
    );

    expect(onUpdateTask).toHaveBeenCalledWith({
      taskId: "task-1",
      title: "Conta atualizada",
      description: "Descrição anterior",
      date: "2026-07-30",
      activityId: "activity-1",
    });
  });

  it("desabilita a ação enquanto cria", () => {
    render(
      <CreateTaskForm
        isCreating
        activities={[]}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Criar tarefa" }),
    ).toBeDisabled();
  });
});

describe("TaskList", () => {
  it("mostra os estados de carregamento e lista vazia", () => {
    const props = {
      activities: [],
      onCompleteTask: vi.fn(),
      onDeleteTask: vi.fn(),
      onEditTask: vi.fn(),
    };
    const { rerender } = render(
      <TaskList tasks={[]} isLoading {...props} />,
    );

    expect(screen.getByText("Carregando tarefas...")).toBeInTheDocument();

    rerender(
      <TaskList
        tasks={[]}
        isLoading={false}
        emptyMessage="Nenhuma tarefa pendente."
        {...props}
      />,
    );
    expect(screen.getByText("Nenhuma tarefa pendente.")).toBeInTheDocument();
  });

  it("permite editar, concluir e excluir uma tarefa pendente", async () => {
    const user = userEvent.setup();
    const task = createTask();
    const onCompleteTask = vi.fn().mockResolvedValue(undefined);
    const onDeleteTask = vi.fn().mockResolvedValue(undefined);
    const onEditTask = vi.fn();
    render(
      <TaskList
        tasks={[task]}
        activities={[]}
        isLoading={false}
        onCompleteTask={onCompleteTask}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Concluir" }));
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onEditTask).toHaveBeenCalledWith(task);
    expect(onCompleteTask).toHaveBeenCalledWith("task-1");
    expect(onDeleteTask).toHaveBeenCalledWith(task);
  });

  it("oculta editar e concluir em uma tarefa concluída, mas mantém excluir", () => {
    render(
      <TaskList
        tasks={[
          createTask({
            status: "completed",
            completed: true,
          }),
        ]}
        activities={[]}
        isLoading={false}
        onCompleteTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onEditTask={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Concluir" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("mostra a atividade anexada com os passos ordenados", () => {
    render(
      <TaskList
        tasks={[createTask({ activityId: activity.id })]}
        activities={[activity]}
        isLoading={false}
        onCompleteTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onEditTask={vi.fn()}
      />,
    );

    const steps = screen.getAllByRole("listitem");
    expect(steps[0]).toHaveTextContent("Conferir o valor");
    expect(steps[1]).toHaveTextContent("Guardar comprovante");
  });
});
