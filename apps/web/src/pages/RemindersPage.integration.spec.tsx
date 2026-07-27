import type { Reminder } from "@helpsenior/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RemindersPage } from "./RemindersPage";

const pendingReminder: Reminder = {
  id: "pending-reminder",
  userId: "user-1",
  title: "Tomar remédio",
  date: "2026-07-30",
  completed: false,
  recurrence: "daily",
  createdAt: new Date("2026-07-01T10:00:00"),
  updatedAt: new Date("2026-07-01T10:00:00"),
};

const completedReminder: Reminder = {
  ...pendingReminder,
  id: "completed-reminder",
  title: "Consulta concluída",
  completed: true,
  recurrence: "none",
};

function createProps() {
  return {
    user: { id: "user-1" },
    reminders: [pendingReminder, completedReminder],
    dueReminders: [pendingReminder],
    isLoadingReminders: false,
    isCreatingReminder: false,
    remindersError: null,
    createReminder: vi.fn().mockResolvedValue(undefined),
    updateReminder: vi.fn().mockResolvedValue(undefined),
    completeReminder: vi.fn().mockResolvedValue(undefined),
    deleteReminder: vi.fn().mockResolvedValue(undefined),
    notificationPermission: "default" as const,
    requestNotificationPermission: vi.fn().mockResolvedValue(undefined),
    isNotificationSupported: true,
    isNotificationAllowed: false,
    isNotificationDenied: false,
  };
}

describe("RemindersPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("abre o formulário, cria um lembrete e volta à lista", async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(
      <MemoryRouter>
        <RemindersPage {...props} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Novo lembrete" }));
    await user.type(screen.getByLabelText("Título"), "Buscar resultado");
    fireEvent.change(screen.getByLabelText("Data"), {
      target: { value: "2026-08-01" },
    });
    await user.click(screen.getByRole("button", { name: "Criar lembrete" }));

    expect(props.createReminder).toHaveBeenCalledWith({
      title: "Buscar resultado",
      description: undefined,
      date: "2026-08-01",
      time: undefined,
      recurrence: "none",
      recurrenceEndDate: undefined,
    });
    expect(
      screen.getByRole("heading", { name: "Meus lembretes" }),
    ).toBeInTheDocument();
  });

  it("filtra lembretes recorrentes", async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(
      <MemoryRouter>
        <RemindersPage {...props} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /Recorrentes/ }));

    expect(screen.getAllByText("Tomar remédio").length).toBeGreaterThan(0);
    expect(screen.queryByText("Consulta concluída")).not.toBeInTheDocument();
  });

  it("solicita permissão para notificações", async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(
      <MemoryRouter>
        <RemindersPage {...props} />
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", { name: "Ativar notificações" }),
    );

    expect(props.requestNotificationPermission).toHaveBeenCalledOnce();
  });
});
