import { Redirect, router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/features/auth/useAuth';
import {
  createAccessibleStyleSheet,
  useAccessibility,
} from '@/src/features/preferences/accessibility';
import {
  AppBar,
  type AppBarRoute,
} from '@/src/shared/layout/AppBar';

interface HomeShortcutProps {
  description: string;
  label: string;
  title: string;
  onPress: () => void;
}

function HomeShortcut({
  description,
  label,
  title,
  onPress,
}: HomeShortcutProps) {
  const { preferences } = useAccessibility();

  return (
    <Pressable
      accessibilityHint={`Abre a área de ${title.toLowerCase()}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.shortcut,
        pressed && styles.shortcutPressed,
      ]}
    >
      <View>
        <Text style={styles.shortcutTitle}>{title}</Text>
        {!preferences?.simpleMode && (
          <Text style={styles.shortcutDescription}>{description}</Text>
        )}
      </View>

      <View style={styles.shortcutFooter}>
        <Text style={styles.shortcutLabel}>{label}</Text>
        <View style={styles.shortcutArrow}>
          <Text accessibilityElementsHidden style={styles.shortcutArrowText}>
            →
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user, isLoading, signOut } = useAuth();
  const { preferences } = useAccessibility();

  async function handleSignOut() {
    const didSignOut = await signOut();

    if (didSignOut) {
      router.replace('/');
    }
  }

  function showUnavailableArea(area: string) {
    Alert.alert(
      area,
      'Esta área ainda não está disponível no aplicativo mobile.',
    );
  }

  function handleNavigation(route: AppBarRoute) {
    if (route === 'home') {
      return;
    }

    if (route === 'activities') {
      router.navigate('/activities');
      return;
    }

    if (route === 'tasks') {
      router.navigate('/tasks');
      return;
    }

    if (route === 'reminders') {
      router.navigate('/reminders');
      return;
    }

    if (route === 'profile') {
      router.navigate('/profile');
      return;
    }

    if (route === 'settings') {
      router.navigate('/settings');
      return;
    }

    const routeLabels: Record<
      Exclude<AppBarRoute, 'home' | 'profile' | 'settings'>,
      string
    > = {
      activities: 'Atividades',
      tasks: 'Tarefas',
      reminders: 'Lembretes',
    };

    showUnavailableArea(routeLabels[route]);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#6D28D9" size="large" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar
        activeRoute="home"
        email={user.email}
        userId={user.id}
        onNavigate={handleNavigation}
        onSignOut={handleSignOut}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introduction}>
          {!preferences?.simpleMode && (
            <Text style={styles.eyebrow}>HelpSenior</Text>
          )}
          <Text accessibilityRole="header" style={styles.title}>
            Organize atividades com mais clareza e segurança.
          </Text>
          {!preferences?.simpleMode && (
            <Text style={styles.description}>
              Crie e consulte guias claros para realizar atividades importantes
              do dia a dia com mais autonomia e tranquilidade.
            </Text>
          )}
        </View>

        <View style={styles.shortcutsSection}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            O que você deseja acessar?
          </Text>

          <View style={styles.shortcuts}>
            <HomeShortcut
              title="Ir para atividades"
              description="Acesse guias simples para acompanhar atividades importantes do dia a dia."
              label="Acessar atividades"
              onPress={() => router.navigate('/activities')}
            />
            <HomeShortcut
              title="Ir para tarefas"
              description="Organize o que precisa ser feito e acompanhe o que já foi concluído."
              label="Acessar tarefas"
              onPress={() => router.navigate('/tasks')}
            />
            <HomeShortcut
              title="Ir para lembretes"
              description="Defina quando receber avisos e acompanhe lembretes recorrentes."
              label="Acessar lembretes"
              onPress={() => router.navigate('/reminders')}
            />
          </View>
        </View>

        <View
          style={[
            styles.tip,
            preferences?.contrast === 'high' && {
              borderColor: '#FACC15',
              backgroundColor: '#111111',
            },
          ]}>
          <View
            style={[
              styles.tipIcon,
              preferences?.contrast === 'high' && {
                backgroundColor: '#FACC15',
              },
            ]}>
            <Text
              accessibilityElementsHidden
              style={[
                styles.tipIconText,
                preferences?.contrast === 'high' && { color: '#000000' },
              ]}>
              i
            </Text>
          </View>
          <Text
            style={[
              styles.tipText,
              preferences?.contrast === 'high' && { color: '#FFFFFF' },
            ]}>
            <Text
              style={[
                styles.tipTextStrong,
                preferences?.contrast === 'high' && { color: '#FACC15' },
              ]}>
              Dica:{' '}
            </Text>
            use as atividades para registrar orientações simples e facilitar
            cada momento da sua rotina.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = createAccessibleStyleSheet({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 96,
    paddingBottom: 32,
  },
  introduction: {
    maxWidth: 680,
  },
  eyebrow: {
    color: '#6D28D9',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.12,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: '#0F172A',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  description: {
    marginTop: 12,
    color: '#475569',
    fontSize: 18,
    lineHeight: 30,
  },
  shortcutsSection: {
    marginTop: 40,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 31,
  },
  shortcuts: {
    marginTop: 20,
    gap: 20,
  },
  shortcut: {
    minHeight: 208,
    justifyContent: 'space-between',
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  shortcutPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  shortcutTitle: {
    color: '#6D28D9',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
  },
  shortcutDescription: {
    marginTop: 8,
    color: '#475569',
    fontSize: 14,
    lineHeight: 24,
  },
  shortcutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  shortcutLabel: {
    flex: 1,
    color: '#6D28D9',
    fontSize: 14,
    fontWeight: '700',
  },
  shortcutArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F5F3FF',
  },
  shortcutArrowText: {
    color: '#6D28D9',
    fontSize: 20,
    lineHeight: 22,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    borderRadius: 16,
    backgroundColor: '#F8F7FF',
  },
  tipIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#6D28D9',
  },
  tipIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    color: '#334155',
    fontSize: 14,
    lineHeight: 24,
  },
  tipTextStrong: {
    fontWeight: '700',
  },
});
