import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Reminder } from "@helpsenior/core";
import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

import { buildReminderNotificationOccurrences } from "./reminderNotificationSchedule";

const CHANNEL_ID = "reminders";
const STORAGE_KEY = "@helpsenior/reminder-notification-ids";
let synchronizationQueue: Promise<void> = Promise.resolve();

export type ReminderNotificationPermission =
  | "granted"
  | "denied"
  | "undetermined"
  | "unsupported";

export function areReminderNotificationsSupported() {
  return !(Platform.OS === "android" && isRunningInExpoGo());
}

async function getNotifications() {
  if (!areReminderNotificationsSupported()) return null;
  return import("expo-notifications");
}

export async function configureReminderNotifications() {
  const notifications = await getNotifications();
  if (!notifications) return;

  if (Platform.OS === "android") {
    await notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Lembretes",
      description: "Avisos de tarefas e compromissos do HelpSenior",
      importance: notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6D28D9",
    });
  }
}

export async function getReminderNotificationPermission(): Promise<ReminderNotificationPermission> {
  const notifications = await getNotifications();
  if (!notifications) return "unsupported";

  const permission = await notifications.getPermissionsAsync();

  if (permission.granted) return "granted";
  if (permission.canAskAgain) return "undetermined";
  return "denied";
}

export async function requestReminderNotificationPermission(): Promise<ReminderNotificationPermission> {
  const notifications = await getNotifications();
  if (!notifications) return "unsupported";

  await configureReminderNotifications();
  const permission = await notifications.requestPermissionsAsync();

  if (permission.granted) return "granted";
  if (permission.canAskAgain) return "undetermined";
  return "denied";
}

async function getStoredNotificationIds() {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
  if (!storedValue) return [];

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export async function cancelReminderNotifications() {
  const notifications = await getNotifications();
  if (!notifications) return;

  const notificationIds = await getStoredNotificationIds();

  await Promise.all(
    notificationIds.map((notificationId) =>
      notifications.cancelScheduledNotificationAsync(notificationId),
    ),
  );
  await AsyncStorage.removeItem(STORAGE_KEY);
}

async function performReminderNotificationSync(reminders: Reminder[]) {
  const notifications = await getNotifications();
  if (!notifications) return;

  await configureReminderNotifications();
  await cancelReminderNotifications();

  const permission = await getReminderNotificationPermission();
  if (permission !== "granted") return;

  const notificationIds: string[] = [];

  for (const occurrence of buildReminderNotificationOccurrences(reminders)) {
    const notificationId = await notifications.scheduleNotificationAsync({
      content: {
        title: occurrence.reminder.title,
        body:
          occurrence.reminder.description ||
          "Você tem um lembrete agendado no HelpSenior.",
        data: {
          reminderId: occurrence.reminder.id,
          url: "/reminders",
        },
        sound: "default",
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.DATE,
        date: occurrence.date,
        channelId: CHANNEL_ID,
      },
    });

    notificationIds.push(notificationId);
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notificationIds));
}

export function syncReminderNotifications(reminders: Reminder[]) {
  synchronizationQueue = synchronizationQueue
    .catch(() => undefined)
    .then(() => performReminderNotificationSync(reminders));

  return synchronizationQueue;
}

export async function setupReminderNotificationObserver(
  onOpenReminders: () => void,
) {
  const notifications = await getNotifications();
  if (!notifications) return () => undefined;

  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  await configureReminderNotifications();

  const lastResponse = notifications.getLastNotificationResponse();
  if (lastResponse?.notification.request.content.data.url === "/reminders") {
    onOpenReminders();
  }

  const subscription =
    notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.content.data.url === "/reminders") {
        onOpenReminders();
      }
    });

  return () => subscription.remove();
}
