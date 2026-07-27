import type { Reminder } from "@helpsenior/core";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReminderNotifications } from "./useReminderNotifications";

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

function installNotificationMock(
  permission: NotificationPermission,
  requestedPermission: NotificationPermission = permission,
) {
  const notificationConstructor = vi.fn();
  const requestPermission = vi.fn().mockResolvedValue(requestedPermission);
  Object.assign(notificationConstructor, {
    permission,
    requestPermission,
  });
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: notificationConstructor,
  });

  return {
    notificationConstructor,
    requestPermission,
  };
}

afterEach(() => {
  Reflect.deleteProperty(window, "Notification");
});

describe("useReminderNotifications", () => {
  it("informa quando o navegador não oferece notificações", async () => {
    const { result } = renderHook(() => useReminderNotifications([]));

    expect(result.current.permission).toBe("unsupported");
    expect(result.current.isNotificationSupported).toBe(false);

    await act(async () => {
      await result.current.requestPermission();
    });
    expect(result.current.permission).toBe("unsupported");
  });

  it("solicita e atualiza a permissão", async () => {
    const { requestPermission } = installNotificationMock(
      "default",
      "granted",
    );
    const { result } = renderHook(() => useReminderNotifications([]));

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(requestPermission).toHaveBeenCalledOnce();
    expect(result.current.permission).toBe("granted");
    expect(result.current.isNotificationAllowed).toBe(true);
  });

  it("não cria notificações quando a permissão foi negada", () => {
    const { notificationConstructor } = installNotificationMock("denied");

    const { result } = renderHook(() =>
      useReminderNotifications([createReminder()]),
    );

    expect(result.current.isNotificationDenied).toBe(true);
    expect(notificationConstructor).not.toHaveBeenCalled();
  });

  it("notifica lembretes informando título, data e horário", () => {
    const { notificationConstructor } = installNotificationMock("granted");

    renderHook(() => useReminderNotifications([createReminder()]));

    expect(notificationConstructor).toHaveBeenCalledWith("HelpSenior", {
      body: "Lembrete agora: Tomar remédio\n27 jul. 2026 às 08:30",
    });
  });

  it("não repete notificações e aceita novos lembretes", () => {
    const { notificationConstructor } = installNotificationMock("granted");
    const firstReminder = createReminder();
    const { rerender } = renderHook(
      ({ reminders }) => useReminderNotifications(reminders),
      {
        initialProps: { reminders: [firstReminder] },
      },
    );

    rerender({ reminders: [firstReminder] });
    expect(notificationConstructor).toHaveBeenCalledTimes(1);

    rerender({
      reminders: [
        firstReminder,
        createReminder({
          id: "reminder-2",
          title: "Consulta",
          time: undefined,
        }),
      ],
    });
    expect(notificationConstructor).toHaveBeenCalledTimes(2);
    expect(notificationConstructor).toHaveBeenLastCalledWith("HelpSenior", {
      body: "Lembrete agora: Consulta\n27 jul. 2026",
    });
  });
});
