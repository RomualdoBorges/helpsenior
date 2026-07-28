import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { Activity, Step } from "@helpsenior/core";
import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useActivities,
  type ActivityInput,
} from "@/src/features/activities/useActivities";
import { useAuth } from "@/src/features/auth/useAuth";
import {
  createAccessibleStyleSheet,
  useAccessibility,
} from "@/src/features/preferences/accessibility";
import { AppBar, type AppBarRoute } from "@/src/shared/layout/AppBar";

type ScreenMode = "list" | "create" | "edit";

function filterActivities(activities: Activity[], search: string) {
  const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return activities;
  }

  return activities.filter((activity) => {
    const searchableContent = [
      activity.title,
      activity.description ?? "",
      ...activity.steps.map((step) => step.description),
    ]
      .join(" ")
      .toLocaleLowerCase();

    return terms.some((term) => searchableContent.includes(term));
  });
}

interface ActivityFormProps {
  activity: Activity | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (input: ActivityInput) => Promise<boolean>;
}

function ActivityForm({
  activity,
  isSaving,
  onCancel,
  onSave,
}: ActivityFormProps) {
  const [title, setTitle] = useState(activity?.title ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [steps, setSteps] = useState<Step[]>(
    activity
      ? [...activity.steps].sort((first, second) => first.order - second.order)
      : [{ order: 1, description: "" }],
  );
  const [localError, setLocalError] = useState<string | null>(null);

  function updateStep(order: number, value: string) {
    setSteps((currentSteps) =>
      currentSteps.map((step) =>
        step.order === order ? { ...step, description: value } : step,
      ),
    );
  }

  function removeStep(order: number) {
    setSteps((currentSteps) =>
      currentSteps
        .filter((step) => step.order !== order)
        .map((step, index) => ({ ...step, order: index + 1 })),
    );
  }

  async function handleSave() {
    const normalizedSteps = steps
      .map((step) => ({ ...step, description: step.description.trim() }))
      .filter((step) => step.description)
      .map((step, index) => ({ ...step, order: index + 1 }));

    setLocalError(null);

    if (!title.trim()) {
      setLocalError("Informe o título da atividade.");
      return;
    }

    if (normalizedSteps.length === 0) {
      setLocalError("A atividade deve ter pelo menos um passo.");
      return;
    }

    const didSave = await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      steps: normalizedSteps,
    });

    if (didSave) {
      onCancel();
    }
  }

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.formTitle}>
        {activity ? "Atualizar atividade" : "Criar guia"}
      </Text>
      <Text style={styles.formDescription}>
        {activity
          ? "Atualize os campos necessários e salve as alterações."
          : "Registre etapas guiadas para consultar sempre que precisar."}
      </Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        accessibilityLabel="Título da atividade"
        autoCapitalize="sentences"
        onChangeText={setTitle}
        placeholder="Ex: Pagar conta de luz"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={title}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        accessibilityLabel="Descrição da atividade"
        multiline
        onChangeText={setDescription}
        placeholder="Ex: Pagar a conta antes do vencimento"
        placeholderTextColor="#94A3B8"
        style={[styles.input, styles.textArea]}
        textAlignVertical="top"
        value={description}
      />

      {steps.map((step) => (
        <View key={step.order}>
          <Text style={styles.label}>Passo {step.order}</Text>
          <TextInput
            accessibilityLabel={`Descrição do passo ${step.order}`}
            onChangeText={(value) => updateStep(step.order, value)}
            placeholder="Descreva este passo"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={step.description}
          />
          {steps.length > 1 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => removeStep(step.order)}
              style={({ pressed }) => [
                styles.removeButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.removeButtonText}>Remover passo</Text>
            </Pressable>
          )}
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        disabled={!steps.at(-1)?.description.trim()}
        onPress={() =>
          setSteps((currentSteps) => [
            ...currentSteps,
            { order: currentSteps.length + 1, description: "" },
          ])
        }
        style={({ pressed }) => [
          styles.secondaryButton,
          !steps.at(-1)?.description.trim() && styles.disabledButton,
          pressed && styles.pressed,
        ]}>
        <Text style={styles.secondaryButtonText}>Adicionar mais uma etapa</Text>
      </Pressable>

      {localError && <Text style={styles.error}>{localError}</Text>}

      <Pressable
        accessibilityRole="button"
        disabled={isSaving}
        onPress={() => void handleSave()}
        style={({ pressed }) => [
          styles.primaryButton,
          styles.formSubmitButton,
          isSaving && styles.disabledButton,
          pressed && styles.pressed,
        ]}>
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {activity ? "Atualizar atividade" : "Criar atividade"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

interface ActivityItemProps {
  activity: Activity;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function ActivityItem({
  activity,
  isDeleting,
  onEdit,
  onDelete,
}: ActivityItemProps) {
  const { preferences } = useAccessibility();
  const orderedSteps = [...activity.steps].sort(
    (first, second) => first.order - second.order,
  );

  return (
    <View style={styles.activityItem}>
      <Text accessibilityRole="header" style={styles.activityTitle}>
        {activity.title}
      </Text>
      {activity.description && (
        <Text style={styles.activityDescription}>{activity.description}</Text>
      )}
      <Text style={styles.stepsTitle}>Passo a passo</Text>
      {orderedSteps.map((step) => (
        <View key={step.order} style={styles.step}>
          <View
            style={[
              styles.stepNumber,
              preferences?.contrast === "high" && {
                backgroundColor: "#FACC15",
              },
            ]}>
            <Text
              style={[
                styles.stepNumberText,
                preferences?.contrast === "high" && { color: "#000000" },
              ]}>
              {step.order}
            </Text>
          </View>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>
      ))}
      <View style={styles.itemActions}>
        <Pressable
          accessibilityLabel={`Editar atividade ${activity.title}`}
          accessibilityRole="button"
          onPress={onEdit}
          style={({ pressed }) => [
            styles.itemButton,
            pressed && styles.pressed,
          ]}>
          <MaterialCommunityIcons
            color={
              preferences?.contrast === "high" ? "#FACC15" : "#6D28D9"
            }
            name="pencil-outline"
            size={20}
          />
          <Text style={styles.itemButtonText}>Editar</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Excluir atividade ${activity.title}`}
          accessibilityRole="button"
          disabled={isDeleting}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.itemButton,
            styles.deleteButton,
            preferences?.contrast === "high" &&
              {
                borderColor: "#B96F6F",
                borderRadius: 9,
                backgroundColor: "transparent",
              },
            isDeleting && styles.disabledButton,
            pressed && styles.pressed,
          ]}>
          <MaterialCommunityIcons
            color={
              preferences?.contrast === "high" ? "#D98282" : "#B91C1C"
            }
            name="trash-can-outline"
            size={20}
          />
          <Text
            style={[
              styles.deleteButtonText,
              preferences?.contrast === "high" &&
                styles.deleteButtonTextHighContrast,
            ]}>
            Excluir
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ActivitiesScreen() {
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { preferences } = useAccessibility();
  const {
    activities,
    isLoading,
    isSaving,
    isDeleting,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
  } = useActivities(user?.id ?? null);
  const [mode, setMode] = useState<ScreenMode>("list");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const filteredActivities = useMemo(
    () => filterActivities(activities, search),
    [activities, search],
  );

  function handleNavigation(route: AppBarRoute) {
    if (route === "activities") return;
    if (route === "home") {
      router.navigate("/home");
      return;
    }
    if (route === "tasks") {
      router.navigate("/tasks");
      return;
    }
    if (route === "reminders") {
      router.navigate("/reminders");
      return;
    }

    if (route === "profile") {
      router.navigate("/profile");
      return;
    }
    if (route === "settings") {
      router.navigate("/settings");
      return;
    }
    Alert.alert(
      "Área indisponível",
      "Esta área ainda não está disponível no aplicativo mobile.",
    );
  }

  function confirmDelete(activity: Activity) {
    Alert.alert(
      "Excluir atividade",
      `Deseja excluir a atividade "${activity.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => void deleteActivity(activity.id),
        },
      ],
    );
  }

  async function handleSignOut() {
    if (await signOut()) router.replace("/");
  }

  if (isAuthLoading) {
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
        activeRoute="activities"
        email={user.email}
        userId={user.id}
        onNavigate={handleNavigation}
        onSignOut={handleSignOut}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {mode === "list" ? (
            <>
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <Text accessibilityRole="header" style={styles.title}>
                    Minhas atividades
                  </Text>
                  <Text style={styles.description}>
                    Crie guias simples para acompanhar atividades importantes do
                    dia a dia.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedActivity(null);
                    setMode("create");
                  }}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.newButton,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={styles.primaryButtonText}>
                    ＋ Nova atividade
                  </Text>
                </Pressable>
              </View>

              <View style={styles.summary}>
                <MaterialCommunityIcons
                  color={
                    preferences?.contrast === "high" ? "#FACC15" : "#6D28D9"
                  }
                  name="format-list-bulleted"
                  size={28}
                />
                <View>
                  <Text style={styles.summaryValue}>{activities.length}</Text>
                  <Text style={styles.summaryLabel}>
                    Atividades cadastradas
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.tip,
                  preferences?.contrast === "high" && {
                    borderColor: "#FACC15",
                    backgroundColor: "#111111",
                  },
                ]}>
                <View
                  style={[
                    styles.tipIcon,
                    preferences?.contrast === "high" && {
                      backgroundColor: "#FACC15",
                    },
                  ]}>
                  <Text
                    style={[
                      styles.tipIconText,
                      preferences?.contrast === "high" && {
                        color: "#000000",
                      },
                    ]}>
                    i
                  </Text>
                </View>
                <Text
                  style={[
                    styles.tipText,
                    preferences?.contrast === "high" && { color: "#FFFFFF" },
                  ]}>
                  <Text
                    style={[
                      styles.tipStrong,
                      preferences?.contrast === "high" && {
                        color: "#FACC15",
                      },
                    ]}>
                    Dica:{" "}
                  </Text>
                  cadastre suas atividades e utilize-as nas tarefas e nos
                  lembretes para organizar melhor sua rotina.
                </Text>
              </View>

              {error && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              )}

              <View style={styles.listPanel}>
                <Text accessibilityRole="header" style={styles.listTitle}>
                  Lista de atividades
                </Text>
                <Text style={styles.listCount}>
                  {filteredActivities.length} de {activities.length} atividade
                  {activities.length === 1 ? "" : "s"}
                </Text>
                <TextInput
                  accessibilityLabel="Buscar atividades"
                  onChangeText={setSearch}
                  placeholder="Procure por suas atividades"
                  placeholderTextColor="#94A3B8"
                  style={[styles.input, styles.searchInput]}
                  value={search}
                />

                {isLoading ? (
                  <ActivityIndicator
                    color="#6D28D9"
                    size="large"
                    style={styles.listFeedback}
                  />
                ) : filteredActivities.length === 0 ? (
                  <Text style={styles.emptyMessage}>
                    Nenhuma atividade encontrada.
                  </Text>
                ) : (
                  <View style={styles.activityList}>
                    {filteredActivities.map((activity) => (
                      <ActivityItem
                        activity={activity}
                        isDeleting={isDeleting}
                        key={activity.id}
                        onDelete={() => confirmDelete(activity)}
                        onEdit={() => {
                          setSelectedActivity(activity);
                          setMode("edit");
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => setMode("list")}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.backButtonText}>← Voltar para a lista</Text>
              </Pressable>
              {error && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              )}
              <ActivityForm
                activity={selectedActivity}
                isSaving={isSaving}
                onCancel={() => {
                  setSelectedActivity(null);
                  setMode("list");
                }}
                onSave={(input) =>
                  selectedActivity
                    ? updateActivity({
                        activityId: selectedActivity.id,
                        ...input,
                      })
                    : createActivity(input)
                }
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = createAccessibleStyleSheet({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  keyboardArea: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 92, paddingBottom: 40 },
  header: { gap: 20 },
  headerText: { gap: 6 },
  title: { color: "#6D28D9", fontSize: 28, fontWeight: "800", lineHeight: 35 },
  description: { color: "#64748B", fontSize: 16, lineHeight: 25 },
  primaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#6D28D9",
    paddingHorizontal: 20,
  },
  formSubmitButton: {
    marginTop: 16,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  newButton: { alignSelf: "stretch" },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
  },
  summaryValue: { color: "#4C1D95", fontSize: 30, fontWeight: "800" },
  summaryLabel: { color: "#475569", fontSize: 15, fontWeight: "700" },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDE9FE",
    borderRadius: 16,
    backgroundColor: "#F8F7FF",
  },
  tipIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#6D28D9",
  },
  tipIconText: { color: "#FFFFFF", fontWeight: "800" },
  tipText: { flex: 1, color: "#475569", fontSize: 15, lineHeight: 23 },
  tipStrong: { fontWeight: "800" },
  error: {
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  listPanel: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  listTitle: { color: "#0F172A", fontSize: 21, fontWeight: "800" },
  listCount: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    minHeight: 52,
    marginTop: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: 16,
  },
  searchInput: { marginTop: 16 },
  textArea: { minHeight: 104, paddingTop: 14 },
  label: { marginTop: 18, color: "#334155", fontSize: 16, fontWeight: "800" },
  listFeedback: { marginVertical: 32 },
  emptyMessage: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 14,
    color: "#64748B",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  activityList: { gap: 16, marginTop: 20 },
  activityItem: {
    padding: 18,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  activityTitle: {
    color: "#6D28D9",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 27,
  },
  activityDescription: {
    marginTop: 8,
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
  },
  stepsTitle: {
    marginTop: 16,
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "800",
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
  },
  stepNumberText: { color: "#6D28D9", fontSize: 14, fontWeight: "800" },
  stepDescription: { flex: 1, color: "#475569", fontSize: 16, lineHeight: 24 },
  itemActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  itemButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#C4B5FD",
    borderRadius: 10,
    backgroundColor: "#F5F3FF",
  },
  itemButtonText: { color: "#6D28D9", fontSize: 15, fontWeight: "800" },
  deleteButton: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  deleteButtonText: { color: "#B91C1C", fontSize: 15, fontWeight: "800" },
  deleteButtonTextHighContrast: { color: "#D98282" },
  backButton: {
    minHeight: 48,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#6D28D9",
  },
  backButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  card: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  formTitle: { color: "#6D28D9", fontSize: 22, fontWeight: "800" },
  formDescription: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 15,
    lineHeight: 23,
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#C4B5FD",
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
  },
  secondaryButtonText: { color: "#6D28D9", fontSize: 15, fontWeight: "800" },
  removeButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  removeButtonText: { color: "#B91C1C", fontSize: 14, fontWeight: "800" },
  disabledButton: { opacity: 0.48 },
  pressed: { opacity: 0.72 },
});
