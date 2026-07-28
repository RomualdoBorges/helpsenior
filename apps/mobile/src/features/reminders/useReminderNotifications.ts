import { useCallback, useEffect, useState } from "react";

import type { Reminder } from "@helpsenior/core";

import {
  getReminderNotificationPermission,
  requestReminderNotificationPermission,
  syncReminderNotifications,
  type ReminderNotificationPermission,
} from "./reminderNotifications";

export function useReminderNotifications(reminders: Reminder[]) {
  const [permission, setPermission] =
    useState<ReminderNotificationPermission>("undetermined");
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPermission() {
      try {
        const currentPermission = await getReminderNotificationPermission();

        if (isActive) {
          setPermission(currentPermission);
        }
      } catch {
        if (isActive) {
          setError("Não foi possível verificar a permissão de notificações.");
        }
      }
    }

    void loadPermission();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (permission === "granted") {
      void syncReminderNotifications(reminders).catch(() => {
        setError("Não foi possível atualizar os avisos dos lembretes.");
      });
    }
  }, [permission, reminders]);

  const requestPermission = useCallback(async () => {
    try {
      setIsRequesting(true);
      setError(null);
      const nextPermission = await requestReminderNotificationPermission();
      setPermission(nextPermission);
      return nextPermission === "granted";
    } catch {
      setError("Não foi possível ativar as notificações.");
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return {
    permission,
    isRequesting,
    error,
    requestPermission,
  };
}
