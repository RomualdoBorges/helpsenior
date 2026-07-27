import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/src/config/crypto';
import {
  AccessibilityProvider,
  useAccessibility,
} from '@/src/features/preferences/accessibility';

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <AppNavigator />
    </AccessibilityProvider>
  );
}

function AppNavigator() {
  const { preferences } = useAccessibility();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar
        backgroundColor={
          preferences?.contrast === 'high' ? '#000000' : '#FFFFFF'
        }
        style={preferences?.contrast === 'high' ? 'light' : 'dark'}
      />
    </>
  );
}
