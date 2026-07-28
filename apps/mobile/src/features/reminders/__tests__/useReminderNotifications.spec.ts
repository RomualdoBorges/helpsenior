import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Reminder } from "@helpsenior/core";

import { useReminderNotifications } from "../useReminderNotifications";

const notificationMocks = vi.hoisted(() => ({
  getPermission: vi.fn(),
  requestPermission: vi.fn(),
  sync: vi.fn(),
}));

vi.mock("../reminderNotifications", () => ({
  getReminderNotificationPermission: notificationMocks.getPermission,
  requestReminderNotificationPermission: notificationMocks.requestPermission,
  syncReminderNotifications: notificationMocks.sync,
}));

const reminder: Reminder = {
  id: "reminder-1",
  userId: "user-1",
  title: "Tomar remédio",
  date: "2026-08-01",
  time: "09:00",
  completed: false,
  recurrence: "none",
  createdAt: new Date("2026-07-01T12:00:00"),
  updatedAt: new Date("2026-07-01T12:00:00"),
};

describe("useReminderNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationMocks.getPermission.mockResolvedValue("undetermined");
    notificationMocks.requestPermission.mockResolvedValue("granted");
    notificationMocks.sync.mockResolvedValue(undefined);
  });

  it("sincroniza os lembretes quando a permissão já está concedida", async () => {
    notificationMocks.getPermission.mockResolvedValue("granted");

    renderHook(() => useReminderNotifications([reminder]));

    await waitFor(() =>
      expect(notificationMocks.sync).toHaveBeenCalledWith([reminder]),
    );
  });

  it("identifica ambiente sem suporte sem tentar sincronizar", async () => {
    notificationMocks.getPermission.mockResolvedValue("unsupported");

    const { result } = renderHook(() => useReminderNotifications([reminder]));

    await waitFor(() =>
      expect(result.current.permission).toBe("unsupported"),
    );
    expect(notificationMocks.sync).not.toHaveBeenCalled();
  });

  it("solicita permissão e ativa a sincronização quando aceita", async () => {
    const { result } = renderHook(() =>
      useReminderNotifications([reminder]),
    );
    await waitFor(() =>
      expect(notificationMocks.getPermission).toHaveBeenCalled(),
    );

    let didAllow = false;
    await act(async () => {
      didAllow = await result.current.requestPermission();
    });

    expect(didAllow).toBe(true);
    expect(result.current.permission).toBe("granted");
    await waitFor(() =>
      expect(notificationMocks.sync).toHaveBeenCalledWith([reminder]),
    );
  });

  it("expõe erro de sincronização sem gerar rejeição não tratada", async () => {
    notificationMocks.getPermission.mockResolvedValue("granted");
    notificationMocks.sync.mockRejectedValue(new Error("native failure"));

    const { result } = renderHook(() =>
      useReminderNotifications([reminder]),
    );

    await waitFor(() =>
      expect(result.current.error).toBe(
        "Não foi possível atualizar os avisos dos lembretes.",
      ),
    );
  });
});
