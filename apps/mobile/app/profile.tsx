import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/features/auth/useAuth";
import {
  createAccessibleStyleSheet,
  useAccessibility,
} from "@/src/features/preferences/accessibility";
import { useUserProfile } from "@/src/features/profile/useUserProfile";
import { AppBar, type AppBarRoute } from "@/src/shared/layout/AppBar";

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function BirthDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [year, month, day] = value.split("-").map(Number);
  const pickerValue =
    year && month && day ? new Date(year, month - 1, day) : new Date();

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed") {
      setIsOpen(false);
      return;
    }

    if (selectedDate) {
      onChange(formatDateValue(selectedDate));
    }

    if (Platform.OS === "android") {
      setIsOpen(false);
    }
  }

  return (
    <View>
      <Pressable
        accessibilityLabel="Data de nascimento"
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [
          styles.dateButton,
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.dateText, !value && styles.placeholder]}>
          {value ? formatDate(value) : "Selecione a data"}
        </Text>
      </Pressable>

      {isOpen && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            mode="date"
            onChange={handleChange}
            value={pickerValue}
          />
          {Platform.OS === "ios" && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsOpen(false)}
              style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const { user, isLoading: isLoadingAuth, signOut } = useAuth();
  const { preferences } = useAccessibility();
  const { profile, isLoading, isUpdating, error, updateProfile } =
    useUserProfile(user?.id ?? null, user?.email ?? null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone ?? "");
      setBirthDate(profile.birthDate ?? "");
    }
  }, [profile]);

  function navigate(route: AppBarRoute) {
    if (route === "home") return router.navigate("/home");
    if (route === "activities") return router.navigate("/activities");
    if (route === "tasks") return router.navigate("/tasks");
    if (route === "reminders") return router.navigate("/reminders");
    if (route === "settings") return router.navigate("/settings");
  }

  async function handleSignOut() {
    if (await signOut()) {
      router.replace("/");
    }
  }

  async function handleSubmit() {
    setSuccessMessage(null);
    const didUpdate = await updateProfile({
      name: name.trim(),
      phone: phone.trim() || undefined,
      birthDate: birthDate || undefined,
    });

    if (didUpdate) {
      setSuccessMessage("Perfil salvo com sucesso.");
    }
  }

  if (isLoadingAuth) {
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
        activeRoute="profile"
        email={user.email}
        onNavigate={navigate}
        onSignOut={handleSignOut}
        userId={user.id}
        userName={profile?.name}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.title}>
              Meu perfil
            </Text>
            {!preferences?.simpleMode && (
              <Text style={styles.description}>
                Atualize seus dados básicos para personalizar sua experiência
                no HelpSenior.
              </Text>
            )}

            {isLoading ? (
              <ActivityIndicator
                color="#6D28D9"
                size="large"
                style={styles.loadingProfile}
              />
            ) : (
              <>
                {error && (
                  <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                  </Text>
                )}
                {successMessage && (
                  <Text accessibilityRole="alert" style={styles.success}>
                    {successMessage}
                  </Text>
                )}

                <Text style={styles.label}>Nome</Text>
                <TextInput
                  autoComplete="name"
                  onChangeText={setName}
                  placeholder="Seu nome"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  value={name}
                />

                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  editable={false}
                  style={[styles.input, styles.disabledInput]}
                  value={profile?.email ?? ""}
                />

                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  autoComplete="tel"
                  keyboardType="phone-pad"
                  onChangeText={setPhone}
                  placeholder="Ex: (11) 99999-9999"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  value={phone}
                />

                <Text style={styles.label}>Data de nascimento</Text>
                <BirthDateField onChange={setBirthDate} value={birthDate} />

                <Pressable
                  accessibilityRole="button"
                  disabled={isUpdating}
                  onPress={() => void handleSubmit()}
                  style={({ pressed }) => [
                    styles.submitButton,
                    isUpdating && styles.disabledButton,
                    pressed && styles.pressed,
                  ]}>
                  {isUpdating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Salvar perfil</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = createAccessibleStyleSheet({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardArea: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 96,
    paddingBottom: 32,
  },
  card: {
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  title: { color: "#0F172A", fontSize: 28, fontWeight: "700" },
  description: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 16,
    lineHeight: 24,
  },
  loadingProfile: { marginVertical: 32 },
  label: {
    marginTop: 16,
    marginBottom: 8,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: 16,
  },
  disabledInput: { backgroundColor: "#F1F5F9", color: "#64748B" },
  dateButton: {
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  dateText: { color: "#0F172A", fontSize: 16 },
  placeholder: { color: "#94A3B8" },
  pickerContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  confirmButton: { alignItems: "center", padding: 12 },
  confirmButtonText: { color: "#6D28D9", fontWeight: "700" },
  error: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    lineHeight: 22,
  },
  success: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    color: "#166534",
    lineHeight: 22,
  },
  submitButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: "#6D28D9",
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  disabledButton: { opacity: 0.6 },
  pressed: { opacity: 0.75 },
});
