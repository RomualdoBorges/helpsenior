import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { Activity, Task } from "@helpsenior/core";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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

import { useActivities } from "@/src/features/activities/useActivities";
import { useAuth } from "@/src/features/auth/useAuth";
import {
  createAccessibleStyleSheet,
  useAccessibility,
} from "@/src/features/preferences/accessibility";
import { useTasks, type TaskInput } from "@/src/features/tasks/useTasks";
import { AppBar, type AppBarRoute } from "@/src/shared/layout/AppBar";

type ScreenMode = "list" | "create" | "edit";
type TaskFilter = "all" | "pending" | "completed" | "withDate";

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function TaskDateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [year, month, day] = value.split("-").map(Number);
  const pickerValue = year && month && day ? new Date(year, month - 1, day) : new Date();

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed") {
      setIsOpen(false);
      return;
    }
    if (selectedDate) {
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const selectedDay = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${selectedYear}-${selectedMonth}-${selectedDay}`);
    }
    if (Platform.OS === "android") setIsOpen(false);
  }

  return (
    <View>
      <View style={styles.dateFieldRow}>
        <Pressable accessibilityLabel="Data da tarefa" accessibilityRole="button" onPress={() => setIsOpen(true)} style={styles.datePickerButton}>
          <MaterialCommunityIcons color="#6D28D9" name="calendar-blank-outline" size={22} />
          <Text style={[styles.datePickerText, !value && styles.placeholderText]}>{value ? formatDate(value) : "Selecionar data"}</Text>
          <MaterialCommunityIcons color="#64748B" name="chevron-down" size={22} />
        </Pressable>
        {value && (
          <Pressable accessibilityLabel="Limpar data da tarefa" accessibilityRole="button" onPress={() => onChange("")} style={styles.clearDateButton}>
            <MaterialCommunityIcons color="#B91C1C" name="close" size={22} />
          </Pressable>
        )}
      </View>
      {isOpen && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker display={Platform.OS === "ios" ? "spinner" : "default"} mode="date" onChange={handleChange} value={pickerValue} />
          {Platform.OS === "ios" && (
            <Pressable accessibilityRole="button" onPress={() => setIsOpen(false)} style={styles.confirmDateButton}>
              <Text style={styles.confirmDateText}>Confirmar</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

interface TaskFormProps {
  task: Task | null;
  activities: Activity[];
  isSaving: boolean;
  onCancel: () => void;
  onSave: (input: TaskInput) => Promise<boolean>;
}

function TaskForm({
  task,
  activities,
  isSaving,
  onCancel,
  onSave,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [date, setDate] = useState(task?.date ?? "");
  const [activityId, setActivityId] = useState(task?.activityId ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSave() {
    setLocalError(null);
    if (!title.trim()) {
      setLocalError("Informe o título da tarefa.");
      return;
    }
    const didSave = await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || undefined,
      activityId: activityId || undefined,
    });
    if (didSave) onCancel();
  }

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.formTitle}>
        {task ? "Atualizar tarefa" : "Criar tarefa"}
      </Text>
      <Text style={styles.formDescription}>
        Use tarefas para registrar o que precisa ser feito. Para avisos,
        horários e repetição, use a área de lembretes.
      </Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        accessibilityLabel="Título da tarefa"
        onChangeText={setTitle}
        placeholder="Ex: Pagar conta de luz"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={title}
      />
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        accessibilityLabel="Descrição da tarefa"
        multiline
        onChangeText={setDescription}
        placeholder="Ex: Pagar a conta antes do vencimento"
        placeholderTextColor="#94A3B8"
        style={[styles.input, styles.textArea]}
        textAlignVertical="top"
        value={description}
      />
      <Text style={styles.label}>Data (opcional)</Text>
      <TaskDateField onChange={setDate} value={date} />
      <Text style={styles.label}>Atividade (opcional)</Text>
      <View style={styles.activityOptions}>
        <OptionButton
          label="Nenhuma"
          selected={!activityId}
          onPress={() => setActivityId("")}
        />
        {activities.map((activity) => (
          <OptionButton
            key={activity.id}
            label={activity.title}
            selected={activityId === activity.id}
            onPress={() => setActivityId(activity.id)}
          />
        ))}
      </View>
      {localError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {localError}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={isSaving}
        onPress={() => void handleSave()}
        style={({ pressed }) => [
          styles.primaryButton,
          styles.submitButton,
          isSaving && styles.disabled,
          pressed && styles.pressed,
        ]}>
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {task ? "Atualizar tarefa" : "Criar tarefa"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

interface TaskItemProps {
  task: Task;
  activity?: Activity;
  isDeleting: boolean;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

function TaskItem({
  task,
  activity,
  isDeleting,
  onComplete,
  onDelete,
  onEdit,
}: TaskItemProps) {
  const { preferences } = useAccessibility();
  const isHighContrast = preferences?.contrast === "high";

  return (
    <View style={[styles.taskItem, task.completed && styles.completedItem]}>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.taskTitle}>
          {task.title}
        </Text>
        <View
          style={[
            styles.badge,
            task.completed ? styles.completedBadge : styles.pendingBadge,
          ]}>
          <Text
            style={[
              styles.badgeText,
              task.completed
                ? styles.completedBadgeText
                : styles.pendingBadgeText,
            ]}>
            {task.completed ? "Concluída" : "Pendente"}
          </Text>
        </View>
      </View>
      {task.description && (
        <Text style={styles.taskDescription}>{task.description}</Text>
      )}
      {task.date && (
        <View style={styles.dateRow}>
          <MaterialCommunityIcons
            color="#6D28D9"
            name="calendar-blank-outline"
            size={18}
          />
          <Text style={styles.dateText}>{formatDate(task.date)}</Text>
        </View>
      )}
      {activity && (
        <View style={styles.stepsSection}>
          <Text style={styles.stepsTitle}>Passo a passo</Text>
          {[...activity.steps]
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <View key={step.order} style={styles.step}>
                <View
                  style={[
                    styles.stepNumber,
                    isHighContrast && { backgroundColor: "#FACC15" },
                  ]}>
                  <Text
                    style={[
                      styles.stepNumberText,
                      isHighContrast && { color: "#000000" },
                    ]}>
                    {step.order}
                  </Text>
                </View>
                <Text style={styles.stepText}>{step.description}</Text>
              </View>
            ))}
        </View>
      )}
      <View style={styles.actions}>
        {!task.completed && (
          <ActionButton icon="pencil-outline" label="Editar" onPress={onEdit} />
        )}
        <ActionButton
          danger
          disabled={isDeleting}
          icon="trash-can-outline"
          label="Excluir"
          onPress={onDelete}
        />
        {!task.completed && (
          <ActionButton
            primary
            icon="check"
            label="Concluir"
            onPress={onComplete}
          />
        )}
      </View>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  danger = false,
  primary = false,
  disabled = false,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  danger?: boolean;
  primary?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { preferences } = useAccessibility();
  const isHighContrastDanger =
    danger && preferences?.contrast === "high";
  const color = isHighContrastDanger
    ? "#FCA5A5"
    : primary
      ? "#FFFFFF"
      : danger
        ? "#B91C1C"
        : "#6D28D9";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        danger && styles.dangerButton,
        isHighContrastDanger && {
          borderColor: "#FCA5A5",
          backgroundColor: "#111111",
        },
        primary && styles.completeButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <MaterialCommunityIcons color={color} name={icon} size={19} />
      <Text
        style={[
          styles.actionText,
          danger && styles.dangerText,
          isHighContrastDanger && { color: "#FCA5A5" },
          primary && styles.completeText,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function TasksScreen() {
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { activities } = useActivities(user?.id ?? null);
  const {
    tasks,
    isLoading,
    isSaving,
    isDeleting,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  } = useTasks(user?.id ?? null);
  const [mode, setMode] = useState<ScreenMode>("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");

  const summary = useMemo(
    () => ({
      pending: tasks.filter((task) => !task.completed).length,
      completed: tasks.filter((task) => task.completed).length,
      withDate: tasks.filter((task) => task.date).length,
    }),
    [tasks],
  );
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "pending") return !task.completed;
        if (filter === "completed") return task.completed;
        if (filter === "withDate") return Boolean(task.date);
        return true;
      }),
    [filter, tasks],
  );

  function navigate(route: AppBarRoute) {
    if (route === "tasks") return;
    if (route === "home") return router.navigate("/home");
    if (route === "activities") return router.navigate("/activities");
    if (route === "reminders") return router.navigate("/reminders");
    if (route === "profile") return router.navigate("/profile");
    if (route === "settings") return router.navigate("/settings");
    Alert.alert(
      "Área indisponível",
      "Esta área ainda não está disponível no aplicativo mobile.",
    );
  }

  function confirmDelete(task: Task) {
    Alert.alert("Excluir tarefa", `Deseja excluir a tarefa "${task.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => void deleteTask(task.id),
      },
    ]);
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
        activeRoute="tasks"
        email={user.email}
        userId={user.id}
        onNavigate={navigate}
        onSignOut={async () => {
          if (await signOut()) router.replace("/");
        }}
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
                <Text accessibilityRole="header" style={styles.title}>
                  Minhas tarefas
                </Text>
                <Text style={styles.description}>
                  Crie tarefas simples para acompanhar atividades importantes do
                  dia a dia.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedTask(null);
                    setMode("create");
                  }}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={styles.primaryButtonText}>＋ Nova tarefa</Text>
                </Pressable>
              </View>
              <View style={styles.summaryGrid}>
                <SummaryCard
                  icon="clipboard-text-outline"
                  label="Pendentes"
                  value={summary.pending}
                />
                <SummaryCard
                  green
                  icon="check-circle-outline"
                  label="Concluídas"
                  value={summary.completed}
                />
                <SummaryCard
                  icon="calendar-blank-outline"
                  label="Com data"
                  value={summary.withDate}
                />
              </View>
              {error && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              )}
              <View style={styles.listPanel}>
                <Text accessibilityRole="header" style={styles.listTitle}>
                  Lista de tarefas
                </Text>
                <Text style={styles.listCount}>
                  {filteredTasks.length} de {tasks.length} tarefa
                  {tasks.length === 1 ? "" : "s"}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filters}>
                  <FilterButton
                    label={`Todas ${tasks.length}`}
                    selected={filter === "all"}
                    onPress={() => setFilter("all")}
                  />
                  <FilterButton
                    label={`Pendentes ${summary.pending}`}
                    selected={filter === "pending"}
                    onPress={() => setFilter("pending")}
                  />
                  <FilterButton
                    label={`Concluídas ${summary.completed}`}
                    selected={filter === "completed"}
                    onPress={() => setFilter("completed")}
                  />
                  <FilterButton
                    label={`Com data ${summary.withDate}`}
                    selected={filter === "withDate"}
                    onPress={() => setFilter("withDate")}
                  />
                </ScrollView>
                {isLoading ? (
                  <ActivityIndicator
                    color="#6D28D9"
                    size="large"
                    style={styles.feedback}
                  />
                ) : filteredTasks.length === 0 ? (
                  <Text style={styles.empty}>Nenhuma tarefa encontrada.</Text>
                ) : (
                  <View style={styles.taskList}>
                    {filteredTasks.map((task) => (
                      <TaskItem
                        activity={activities.find(
                          (activity) => activity.id === task.activityId,
                        )}
                        isDeleting={isDeleting}
                        key={task.id}
                        onComplete={() => void completeTask(task.id)}
                        onDelete={() => confirmDelete(task)}
                        onEdit={() => {
                          setSelectedTask(task);
                          setMode("edit");
                        }}
                        task={task}
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
                <Text style={styles.backText}>← Voltar para a lista</Text>
              </Pressable>
              {error && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              )}
              <TaskForm
                activities={activities}
                isSaving={isSaving}
                onCancel={() => {
                  setSelectedTask(null);
                  setMode("list");
                }}
                onSave={(input) =>
                  selectedTask
                    ? updateTask({ taskId: selectedTask.id, ...input })
                    : createTask(input)
                }
                task={selectedTask}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  green = false,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: number;
  green?: boolean;
}) {
  const { preferences } = useAccessibility();
  const isHighContrastGreen =
    green && preferences?.contrast === "high";

  return (
    <View
      style={[
        styles.summaryCard,
        green && styles.greenSummary,
        isHighContrastGreen && {
          borderColor: "#86EFAC",
          backgroundColor: "#052E16",
        },
      ]}>
      <MaterialCommunityIcons
        color={isHighContrastGreen ? "#86EFAC" : green ? "#15803D" : "#6D28D9"}
        name={icon}
        size={25}
      />
      <Text
        style={[
          styles.summaryValue,
          green && styles.greenText,
          isHighContrastGreen && { color: "#86EFAC" },
        ]}>
        {value}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function FilterButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.filter, selected && styles.selectedFilter]}>
      <Text style={[styles.filterText, selected && styles.selectedFilterText]}>
        {label}
      </Text>
    </Pressable>
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
  header: { gap: 8 },
  title: { color: "#6D28D9", fontSize: 28, fontWeight: "800", lineHeight: 35 },
  description: { color: "#64748B", fontSize: 16, lineHeight: 25 },
  primaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#6D28D9",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  summaryGrid: { flexDirection: "row", gap: 10, marginTop: 24 },
  summaryCard: {
    flex: 1,
    minHeight: 126,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
  },
  greenSummary: { borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" },
  summaryValue: {
    marginTop: 5,
    color: "#4C1D95",
    fontSize: 28,
    fontWeight: "800",
  },
  greenText: { color: "#166534" },
  summaryLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
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
  filters: { gap: 8, paddingTop: 16, paddingBottom: 2 },
  filter: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
  },
  selectedFilter: { borderColor: "#6D28D9", backgroundColor: "#6D28D9" },
  filterText: { color: "#475569", fontSize: 14, fontWeight: "800" },
  selectedFilterText: { color: "#FFFFFF" },
  feedback: { marginVertical: 32 },
  empty: {
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
  taskList: { gap: 16, marginTop: 20 },
  taskItem: {
    padding: 18,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  completedItem: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
    opacity: 0.72,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  taskTitle: {
    flexShrink: 1,
    color: "#6D28D9",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 27,
  },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  completedBadge: { backgroundColor: "#DCFCE7" },
  badgeText: { fontSize: 12, fontWeight: "800" },
  pendingBadgeText: { color: "#92400E" },
  completedBadgeText: { color: "#166534" },
  taskDescription: {
    marginTop: 8,
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  dateText: { color: "#6D28D9", fontSize: 14, fontWeight: "800" },
  stepsSection: { marginTop: 16 },
  stepsTitle: { color: "#1E293B", fontSize: 16, fontWeight: "800" },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
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
  stepText: { flex: 1, color: "#475569", fontSize: 16, lineHeight: 24 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 },
  actionButton: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#C4B5FD",
    borderRadius: 10,
    backgroundColor: "#F5F3FF",
  },
  actionText: { color: "#6D28D9", fontSize: 14, fontWeight: "800" },
  dangerButton: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  dangerText: { color: "#B91C1C" },
  completeButton: { borderColor: "#6D28D9", backgroundColor: "#6D28D9" },
  completeText: { color: "#FFFFFF" },
  backButton: {
    minHeight: 48,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#6D28D9",
  },
  backText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
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
  label: { marginTop: 18, color: "#334155", fontSize: 16, fontWeight: "800" },
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
  dateFieldRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  datePickerButton: { minHeight: 52, flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, backgroundColor: "#FFFFFF" },
  datePickerText: { flex: 1, color: "#0F172A", fontSize: 16 },
  placeholderText: { color: "#64748B" },
  clearDateButton: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FECACA", borderRadius: 12, backgroundColor: "#FEF2F2" },
  datePickerContainer: { marginTop: 8, padding: 8, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, backgroundColor: "#F8FAFC" },
  confirmDateButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#6D28D9" },
  confirmDateText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  textArea: { minHeight: 104, paddingTop: 14 },
  activityOptions: { gap: 8, marginTop: 8 },
  option: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  optionSelected: { borderColor: "#6D28D9", backgroundColor: "#F5F3FF" },
  optionText: { color: "#475569", fontSize: 15, fontWeight: "700" },
  optionTextSelected: { color: "#6D28D9" },
  submitButton: { marginTop: 20 },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.72 },
});
