import type { Reminder } from "@helpsenior/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateReminderForm } from "./CreateReminderForm";
import { ReminderList } from "./ReminderList";

function createReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: "reminder-1",
    userId: "user-1",
    title: "Tomar remédio",
    date: "2026-07-27",
    time: "08:30",
    completed: false,
    recurrence: "none",
    createdAt: new Date("2026-07-01T10:00:00"),
    updatedAt: new Date("2026-07-01T10:00:00"),
    ...overrides,
  };
}

describe("CreateReminderForm", () => {
  it("envia um lembrete simples sem campos opcionais", async () => {
    const user = userEvent.setup();
    const onCreateReminder = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateReminderForm
        isCreating={false}
        onCreateReminder={onCreateReminder}
        onUpdateReminder={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Título"), "Tomar remédio");
    fireEvent.change(screen.getByLabelText("Data"), {
      target: { value: "2026-07-30" },
    });
    await user.click(screen.getByRole("button", { name: "Criar lembrete" }));

    expect(onCreateReminder).toHaveBeenCalledWith({
      title: "Tomar remédio",
      description: undefined,
      date: "2026-07-30",
      time: undefined,
      recurrence: "none",
      recurrenceEndDate: undefined,
    });
  });

  it("exibe e envia a data final somente quando há recorrência", async () => {
    const user = userEvent.setup();
    const onCreateReminder = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateReminderForm
        isCreating={false}
        onCreateReminder={onCreateReminder}
        onUpdateReminder={vi.fn()}
      />,
    );

    expect(
      screen.queryByLabelText("Data final da recorrência"),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Título"), "Consulta");
    fireEvent.change(screen.getByLabelText("Data"), {
      target: { value: "2026-08-01" },
    });
    await user.selectOptions(screen.getByLabelText("Recorrência"), "weekly");
    fireEvent.change(screen.getByLabelText("Data final da recorrência"), {
      target: { value: "2026-09-01" },
    });
    await user.click(screen.getByRole("button", { name: "Criar lembrete" }));

    expect(onCreateReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrence: "weekly",
        recurrenceEndDate: "2026-09-01",
      }),
    );
  });

  it("carrega e atualiza um lembrete existente preservando a tarefa", async () => {
    const user = userEvent.setup();
    const onUpdateReminder = vi.fn().mockResolvedValue(undefined);
    const reminder = createReminder({
      taskId: "task-1",
      recurrence: "daily",
      recurrenceEndDate: "2026-08-30",
    });
    render(
      <CreateReminderForm
        reminder={reminder}
        isCreating={false}
        onCreateReminder={vi.fn()}
        onUpdateReminder={onUpdateReminder}
      />,
    );

    expect(screen.getByLabelText("Título")).toHaveValue("Tomar remédio");
    expect(screen.getByLabelText("Recorrência")).toHaveValue("daily");
    await user.click(
      screen.getByRole("button", { name: "Atualizar lembrete" }),
    );

    expect(onUpdateReminder).toHaveBeenCalledWith({
      reminderId: "reminder-1",
      title: "Tomar remédio",
      description: undefined,
      date: "2026-07-27",
      time: "08:30",
      recurrence: "daily",
      taskId: "task-1",
      recurrenceEndDate: "2026-08-30",
    });
  });

  it("desabilita a ação enquanto cria", () => {
    render(
      <CreateReminderForm
        isCreating
        onCreateReminder={vi.fn()}
        onUpdateReminder={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Criar lembrete" }),
    ).toBeDisabled();
  });
});

describe("ReminderList", () => {
  it("mostra os estados de carregamento e lista vazia", () => {
    const props = {
      onCompleteReminder: vi.fn(),
      onDeleteReminder: vi.fn(),
      onSelectedReminder: vi.fn(),
      onTaskDetail: vi.fn(),
    };
    const { rerender } = render(
      <ReminderList reminders={[]} isLoading {...props} />,
    );

    expect(screen.getByText("Carregando lembretes...")).toBeInTheDocument();

    rerender(
      <ReminderList
        reminders={[]}
        isLoading={false}
        emptyMessage="Nenhum lembrete pendente."
        {...props}
      />,
    );
    expect(screen.getByText("Nenhum lembrete pendente.")).toBeInTheDocument();
  });

  it("permite editar, concluir e excluir um lembrete pendente", async () => {
    const user = userEvent.setup();
    const reminder = createReminder();
    const onCompleteReminder = vi.fn().mockResolvedValue(undefined);
    const onDeleteReminder = vi.fn().mockResolvedValue(undefined);
    const onSelectedReminder = vi.fn();
    render(
      <ReminderList
        reminders={[reminder]}
        isLoading={false}
        onCompleteReminder={onCompleteReminder}
        onDeleteReminder={onDeleteReminder}
        onSelectedReminder={onSelectedReminder}
        onTaskDetail={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Concluir" }));
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onSelectedReminder).toHaveBeenCalledWith(reminder);
    expect(onCompleteReminder).toHaveBeenCalledWith("reminder-1");
    expect(onDeleteReminder).toHaveBeenCalledWith(reminder);
  });

  it("oculta editar e concluir em um lembrete concluído, mas mantém excluir", () => {
    render(
      <ReminderList
        reminders={[createReminder({ completed: true })]}
        isLoading={false}
        onCompleteReminder={vi.fn()}
        onDeleteReminder={vi.fn()}
        onSelectedReminder={vi.fn()}
        onTaskDetail={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Concluir" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("abre a tarefa associada e apresenta recorrência e datas", async () => {
    const user = userEvent.setup();
    const onTaskDetail = vi.fn().mockResolvedValue(undefined);
    render(
      <ReminderList
        reminders={[
          createReminder({
            taskId: "task-1",
            recurrence: "weekly",
            recurrenceEndDate: "2026-08-27",
          }),
        ]}
        isLoading={false}
        onCompleteReminder={vi.fn()}
        onDeleteReminder={vi.fn()}
        onSelectedReminder={vi.fn()}
        onTaskDetail={onTaskDetail}
      />,
    );

    expect(screen.getByText("27 jul. 2026 às 08:30")).toBeInTheDocument();
    expect(screen.getByText("Toda semana")).toBeInTheDocument();
    expect(screen.getByText("Até 27 ago. 2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ver Tarefa" }));
    expect(onTaskDetail).toHaveBeenCalledWith("task-1");
  });
});
