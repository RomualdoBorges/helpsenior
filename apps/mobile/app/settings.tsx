import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type {
  ContrastPreference,
  FontSizePreference,
} from "@helpsenior/core";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/features/auth/useAuth";
import {
  createAccessibleStyleSheet,
  useAccessibility,
} from "@/src/features/preferences/accessibility";
import { AppBar, type AppBarRoute } from "@/src/shared/layout/AppBar";

const highContrastText = { color: "#FFFFFF" } as const;
const highContrastAccentText = { color: "#FACC15" } as const;

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SelectFieldProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
}: SelectFieldProps<T>) {
  const { preferences } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const isHighContrast = preferences?.contrast === "high";
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "";

  return (
    <View style={styles.field}>
      <Text
        style={[styles.label, isHighContrast && highContrastText]}>
        {label}
      </Text>
      <Pressable
        accessibilityLabel={`${label}: ${selectedLabel}`}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.select, pressed && styles.pressed]}>
        <Text
          style={[
            styles.selectText,
            isHighContrast && highContrastText,
          ]}>
          {selectedLabel}
        </Text>
        <MaterialCommunityIcons
          accessibilityElementsHidden
          color={isHighContrast ? "#FACC15" : "#475569"}
          name="chevron-down"
          size={24}
        />
      </Pressable>

      <Modal
        animationType={preferences?.reduceMotion ? "none" : "fade"}
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)}>
          <View
            accessibilityViewIsModal
            style={styles.optionsCard}
            onStartShouldSetResponder={() => true}>
            <Text
              accessibilityRole="header"
              style={[
                styles.optionsTitle,
                isHighContrast && highContrastText,
              ]}>
              {label}
            </Text>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && styles.selectedOption,
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                      isHighContrast &&
                        (isSelected
                          ? highContrastAccentText
                          : highContrastText),
                    ]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons
                      accessibilityElementsHidden
                      color={isHighContrast ? "#FACC15" : "#6D28D9"}
                      name="check"
                      size={22}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

interface ToggleFieldProps {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}

function ToggleField({
  checked,
  description,
  label,
  onChange,
}: ToggleFieldProps) {
  const { preferences } = useAccessibility();
  const isHighContrast = preferences?.contrast === "high";

  return (
    <View style={styles.toggle}>
      <View style={styles.toggleContent}>
        <Text
          style={[
            styles.toggleLabel,
            isHighContrast && highContrastText,
          ]}>
          {label}
        </Text>
        {description ? (
          <Text
            style={[
              styles.toggleDescription,
              isHighContrast && highContrastText,
            ]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: "#CBD5E1", true: "#6D28D9" }}
        value={checked}
      />
    </View>
  );
}

const fontSizeOptions: Option<FontSizePreference>[] = [
  { label: "Pequena", value: "small" },
  { label: "Média", value: "medium" },
  { label: "Grande", value: "large" },
  { label: "Extra grande", value: "extra_large" },
];

const contrastOptions: Option<ContrastPreference>[] = [
  { label: "Padrão", value: "default" },
  { label: "Alto contraste", value: "high" },
];

export default function SettingsScreen() {
  const { user, isLoading: isLoadingAuth, signOut } = useAuth();
  const { preferences, isLoading, isUpdating, error, updatePreferences } =
    useAccessibility();
  const isHighContrast = preferences?.contrast === "high";

  function navigate(route: AppBarRoute) {
    if (route === "settings") return;
    if (route === "home") return router.navigate("/home");
    if (route === "activities") return router.navigate("/activities");
    if (route === "tasks") return router.navigate("/tasks");
    if (route === "reminders") return router.navigate("/reminders");
    if (route === "profile") return router.navigate("/profile");
  }

  async function handleSignOut() {
    if (await signOut()) router.replace("/");
  }

  if (isLoadingAuth) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#6D28D9" size="large" />
      </SafeAreaView>
    );
  }

  if (!user) return <Redirect href="/" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar
        activeRoute="settings"
        email={user.email}
        onNavigate={navigate}
        onSignOut={handleSignOut}
        userId={user.id}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.heading}>
            <View style={styles.headingText}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.title,
                  isHighContrast && highContrastText,
                ]}>
                Preferências de acessibilidade
              </Text>
              {!preferences?.simpleMode && (
                <Text
                  style={[
                    styles.description,
                    isHighContrast && highContrastText,
                  ]}>
                  Ajuste a experiência visual para deixar o HelpSenior mais
                  confortável e fácil de usar.
                </Text>
              )}
            </View>
            {isUpdating && (
              <Text
                accessibilityRole="alert"
                style={[
                  styles.saving,
                  isHighContrast && highContrastAccentText,
                ]}>
                Salvando...
              </Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingPreferences}>
              <ActivityIndicator color="#6D28D9" size="large" />
              <Text
                style={[
                  styles.loadingText,
                  isHighContrast && highContrastText,
                ]}>
                Carregando preferências...
              </Text>
            </View>
          ) : !preferences ? (
            <Text
              style={[
                styles.empty,
                isHighContrast && highContrastText,
              ]}>
              Preferências não encontradas.
            </Text>
          ) : (
            <View style={styles.fields}>
              {error && (
                <Text
                  accessibilityRole="alert"
                  style={[
                    styles.error,
                    isHighContrast && highContrastText,
                  ]}>
                  {error}
                </Text>
              )}

              <SelectField
                label="Tamanho da fonte"
                onChange={(fontSize) => void updatePreferences({ fontSize })}
                options={fontSizeOptions}
                value={preferences.fontSize}
              />
              <SelectField
                label="Contraste"
                onChange={(contrast) => void updatePreferences({ contrast })}
                options={contrastOptions}
                value={preferences.contrast}
              />
              <ToggleField
                checked={preferences.simpleMode}
                description={
                  preferences.simpleMode
                    ? ""
                    : "Reduz informações e prioriza ações principais."
                }
                label="Modo simples"
                onChange={(simpleMode) =>
                  void updatePreferences({ simpleMode })
                }
              />
              <ToggleField
                checked={preferences.reduceMotion}
                description={
                  preferences.simpleMode
                    ? ""
                    : "Remove transições e efeitos de movimento da navegação."
                }
                label="Reduzir animações"
                onChange={(reduceMotion) =>
                  void updatePreferences({ reduceMotion })
                }
              />
              <ToggleField
                checked={preferences.increasedSpacing}
                description={
                  preferences.simpleMode
                    ? ""
                    : "Aumenta os espaços entre elementos para facilitar a leitura."
                }
                label="Espaçamento maior"
                onChange={(increasedSpacing) =>
                  void updatePreferences({ increasedSpacing })
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = createAccessibleStyleSheet({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
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
  heading: { gap: 8 },
  headingText: { flex: 1 },
  title: { color: "#0F172A", fontSize: 28, fontWeight: "700", lineHeight: 34 },
  description: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 16,
    lineHeight: 24,
  },
  saving: { color: "#64748B", fontSize: 14, fontWeight: "700" },
  fields: { gap: 16, marginTop: 24 },
  field: { gap: 8 },
  label: { color: "#334155", fontSize: 16, fontWeight: "700" },
  select: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  selectText: { color: "#0F172A", fontSize: 16 },
  toggle: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
  },
  toggleContent: { flex: 1, gap: 4 },
  toggleLabel: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
  toggleDescription: { color: "#64748B", fontSize: 14, lineHeight: 20 },
  loadingPreferences: { alignItems: "center", gap: 12, paddingVertical: 32 },
  loadingText: { color: "#475569", fontSize: 16 },
  empty: { marginTop: 16, color: "#475569", fontSize: 16 },
  error: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    lineHeight: 22,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  optionsCard: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  optionsTitle: {
    marginBottom: 12,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "700",
  },
  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  selectedOption: { backgroundColor: "#F5F3FF" },
  optionText: { color: "#334155", fontSize: 16 },
  selectedOptionText: { color: "#5B21B6", fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
