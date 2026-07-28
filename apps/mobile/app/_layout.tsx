import { useEffect } from "react";
import { router, Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';

import '@/src/config/crypto';
import {
  AccessibilityProvider,
  useAccessibility,
} from '@/src/features/preferences/accessibility';
import { setupReminderNotificationObserver } from "@/src/features/reminders/reminderNotifications";

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <AppNavigator />
    </AccessibilityProvider>
  );
}

function AppNavigator() {
  const { preferences } = useAccessibility();

  useEffect(() => {
    let isActive = true;
    let removeObserver: (() => void) | undefined;

    void setupReminderNotificationObserver(() => {
      router.navigate("/reminders");
    })
      .then((removeListener) => {
        if (isActive) {
          removeObserver = removeListener;
        } else {
          removeListener();
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
      removeObserver?.();
    };
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          animation: preferences?.reduceMotion ? "none" : "default",
          headerShown: false,
        }}
      />
      <StatusBar
        backgroundColor={
          preferences?.contrast === 'high' ? '#000000' : '#FFFFFF'
        }
        style={preferences?.contrast === 'high' ? 'light' : 'dark'}
      />
    </>
  );
}
