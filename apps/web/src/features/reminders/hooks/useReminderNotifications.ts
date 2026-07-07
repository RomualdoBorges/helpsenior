import { useCallback, useEffect, useRef, useState } from "react";

import type { Reminder } from "@helpsenior/core";

type NotificationPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export function useReminderNotifications(dueReminders: Reminder[]) {
  const notifiedReminderIdsRef = useRef<Set<string>>(new Set());

  const [permission, setPermission] = useState<NotificationPermissionState>(
    () => {
      if (!("Notification" in window)) {
        return "unsupported";
      }

      return Notification.permission;
    },
  );

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const result = await Notification.requestPermission();

    setPermission(result);
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) {
      return;
    }

    if (permission !== "granted") {
      return;
    }

    dueReminders.forEach((reminder) => {
      const alreadyNotified = notifiedReminderIdsRef.current.has(reminder.id);

      if (alreadyNotified) {
        return;
      }

      const notificationBody = [
        `Lembrete agora: ${reminder.title}`,
        reminder.time ? `${reminder.date} às ${reminder.time}` : reminder.date,
      ].join("\n");

      new Notification("HelpSenior", {
        body: notificationBody,
      });

      notifiedReminderIdsRef.current.add(reminder.id);
    });
  }, [dueReminders, permission]);

  return {
    permission,
    requestPermission,
    isNotificationSupported: permission !== "unsupported",
    isNotificationAllowed: permission === "granted",
    isNotificationDenied: permission === "denied",
  };
}
