import { useState, type ComponentProps } from 'react';
import { Redirect, router } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/features/auth/useAuth';

type AuthMode = 'sign-in' | 'sign-up' | 'reset-password';

const contentByMode = {
  'sign-in': {
    title: 'Entrar na conta',
    description: 'Entre para acessar suas tarefas, lembretes e configurações.',
    submitLabel: 'Entrar',
  },
  'sign-up': {
    title: 'Criar conta',
    description:
      'Crie sua conta para salvar tarefas, lembretes, perfil e preferências.',
    submitLabel: 'Criar conta',
  },
  'reset-password': {
    title: 'Recuperar senha',
    description:
      'Informe seu e-mail para receber as instruções de redefinição de senha.',
    submitLabel: 'Enviar e-mail',
  },
} satisfies Record<
  AuthMode,
  { title: string; description: string; submitLabel: string }
>;

export default function LoginScreen() {
  const {
    user,
    isLoading,
    isSubmitting,
    error: authError,
    successMessage,
    signIn,
    signUp,
    resetPassword,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isSignInMode = mode === 'sign-in';
  const isSignUpMode = mode === 'sign-up';
  const isResetPasswordMode = mode === 'reset-password';
  const content = contentByMode[mode];

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setLocalError(null);
  }

  async function handleSubmit() {
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Informe seu e-mail.');
      return;
    }

    if (isResetPasswordMode) {
      await resetPassword(email.trim());
      return;
    }

    if (!password) {
      setLocalError('Informe sua senha.');
      return;
    }

    if (isSignUpMode && !name.trim()) {
      setLocalError('Informe seu nome completo.');
      return;
    }

    if (isSignUpMode && password !== passwordConfirmation) {
      setLocalError('As senhas não conferem.');
      return;
    }

    const didAuthenticate = isSignUpMode
      ? await signUp({
          name: name.trim(),
          email: email.trim(),
          password,
        })
      : await signIn(email.trim(), password);

    if (didAuthenticate) {
      router.replace('/home');
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#6D28D9" size="large" />
        <Text style={styles.loadingText}>Carregando aplicação...</Text>
      </SafeAreaView>
    );
  }

  if (user) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introduction}>
            <Text style={styles.eyebrow}>HelpSenior</Text>
            <Text style={styles.heroTitle}>
              Organize atividades com mais clareza e segurança.
            </Text>
            <Text style={styles.heroDescription}>
              Crie tarefas simples e lembretes recorrentes para acompanhar a
              rotina com mais autonomia.
            </Text>
          </View>

          <View style={styles.card}>
            <View>
              <Text style={styles.cardEyebrow}>HelpSenior</Text>
              <Text style={styles.cardTitle}>{content.title}</Text>
              <Text style={styles.cardDescription}>{content.description}</Text>
            </View>

            {!isResetPasswordMode && (
              <View style={styles.tabs}>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSignInMode }}
                  onPress={() => changeMode('sign-in')}
                  style={({ pressed }) => [
                    styles.tab,
                    isSignInMode && styles.activeTab,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isSignInMode && styles.activeTabText,
                    ]}
                  >
                    Entrar
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSignUpMode }}
                  onPress={() => changeMode('sign-up')}
                  style={({ pressed }) => [
                    styles.tab,
                    isSignUpMode && styles.activeTab,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isSignUpMode && styles.activeTabText,
                    ]}
                  >
                    Criar conta
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.form}>
              {isSignUpMode && (
                <FormInput
                  label="Nome completo"
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Maria Silva"
                  autoComplete="name"
                  textContentType="name"
                />
              )}

              <FormInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seuemail@exemplo.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />

              {!isResetPasswordMode && (
                <FormInput
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite sua senha"
                  autoCapitalize="none"
                  autoComplete={
                    isSignUpMode ? 'new-password' : 'current-password'
                  }
                  secureTextEntry
                  textContentType={
                    isSignUpMode ? 'newPassword' : 'password'
                  }
                />
              )}

              {isSignUpMode && (
                <FormInput
                  label="Confirmar senha"
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  placeholder="Digite a senha novamente"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  secureTextEntry
                  textContentType="newPassword"
                />
              )}

              {(localError || authError) && (
                <View accessibilityRole="alert" style={styles.errorAlert}>
                  <Text style={styles.errorText}>
                    {localError || authError}
                  </Text>
                </View>
              )}

              {successMessage && (
                <View accessibilityRole="alert" style={styles.successAlert}>
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                  isSubmitting && styles.disabledButton,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {content.submitLabel}
                  </Text>
                )}
              </Pressable>
            </View>

            {isSignInMode && (
              <SecondaryButton
                label="Esqueci minha senha"
                onPress={() => changeMode('reset-password')}
              />
            )}

            {isResetPasswordMode && (
              <SecondaryButton
                label="Voltar para o login"
                onPress={() => changeMode('sign-in')}
              />
            )}
          </View>

          <Text style={styles.footer}>
            Feito para tornar a rotina mais simples e segura.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormInputProps = ComponentProps<typeof TextInput> & {
  label: string;
};

function FormInput({ label, style, ...props }: FormInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#94A3B8"
        selectionColor="#6D28D9"
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
}

function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F8F5FF',
  },
  loadingText: {
    color: '#475569',
    fontSize: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F5FF',
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  introduction: {
    width: '100%',
    maxWidth: 560,
    marginBottom: 28,
    alignSelf: 'center',
  },
  eyebrow: {
    marginBottom: 8,
    color: '#6D28D9',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#2E1065',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  heroDescription: {
    marginTop: 12,
    color: '#475569',
    fontSize: 18,
    lineHeight: 27,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  cardEyebrow: {
    color: '#6D28D9',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  cardTitle: {
    marginTop: 8,
    color: '#2E1065',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  cardDescription: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 24,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#F5F3FF',
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#6D28D9',
  },
  form: {
    gap: 16,
    marginTop: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: 17,
  },
  errorAlert: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 15,
    lineHeight: 22,
  },
  successAlert: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
  },
  successText: {
    color: '#166534',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#6D28D9',
  },
  primaryButtonPressed: {
    backgroundColor: '#5B21B6',
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#6D28D9',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
  footer: {
    marginTop: 28,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
