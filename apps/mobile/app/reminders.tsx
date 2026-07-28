import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { Reminder, ReminderRecurrence } from "@helpsenior/core";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import {
  useReminders,
  type ReminderInput,
} from "@/src/features/reminders/useReminders";
import { useReminderNotifications } from "@/src/features/reminders/useReminderNotifications";
import { AppBar, type AppBarRoute } from "@/src/shared/layout/AppBar";

type ScreenMode = "list" | "create" | "edit";
type ReminderFilter = "all" | "pending" | "completed" | "recurring";

const recurrenceLabels: Record<ReminderRecurrence, string> = {
  none: "Sem recorrência",
  daily: "Todos os dias",
  weekly: "Toda semana",
  monthly: "Todo mês",
};

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

function formatTimeValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parsePickerValue(value: string, mode: "date" | "time") {
  if (mode === "date") {
    const [year, month, day] = value.split("-").map(Number);

    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  } else {
    const [hours, minutes] = value.split(":").map(Number);
    const date = new Date();

    if (hours !== undefined && minutes !== undefined) {
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }

  return new Date();
}

function PickerField({
  accessibilityLabel,
  mode,
  placeholder,
  value,
  onChange,
  onClear,
}: {
  accessibilityLabel: string;
  mode: "date" | "time";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}) {
  const { preferences } = useAccessibility();
  const isHighContrast = preferences?.contrast === "high";
  const [isOpen, setIsOpen] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedValue?: Date) {
    if (event.type === "dismissed") {
      setIsOpen(false);
      return;
    }

    if (selectedValue) {
      onChange(
        mode === "date"
          ? formatDateValue(selectedValue)
          : formatTimeValue(selectedValue),
      );
    }

    if (Platform.OS === "android") {
      setIsOpen(false);
    }
  }

  return (
    <View>
      <View style={styles.pickerFieldRow}>
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          onPress={() => setIsOpen(true)}
          style={({ pressed }) => [
            styles.pickerButton,
            pressed && styles.pressed,
          ]}>
          <MaterialCommunityIcons
            color={isHighContrast ? "#FACC15" : "#6D28D9"}
            name={mode === "date" ? "calendar-blank-outline" : "clock-outline"}
            size={22}
          />
          <Text style={[styles.pickerText, !value && styles.placeholderText]}>
            {value
              ? mode === "date"
                ? formatDate(value)
                : value
              : placeholder}
          </Text>
          <MaterialCommunityIcons
            color="#64748B"
            name="chevron-down"
            size={22}
          />
        </Pressable>
        {value && onClear && (
          <Pressable
            accessibilityLabel={`Limpar ${accessibilityLabel.toLowerCase()}`}
            accessibilityRole="button"
            onPress={onClear}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressed,
            ]}>
            <MaterialCommunityIcons color="#B91C1C" name="close" size={22} />
          </Pressable>
        )}
      </View>
      {isOpen && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            display={Platform.OS === "ios" ? "spinner" : "default"}
            is24Hour
            mode={mode}
            onChange={handleChange}
            value={parsePickerValue(value, mode)}
          />
          {Platform.OS === "ios" && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsOpen(false)}
              style={({ pressed }) => [
                styles.pickerDoneButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.pickerDoneText}>Confirmar</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function isDue(reminder: Reminder) {
  if (reminder.completed) return false;
  return (
    new Date(`${reminder.date}T${reminder.time || "00:00"}:00`) <= new Date()
  );
}

interface ReminderFormProps {
  reminder: Reminder | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (input: ReminderInput) => Promise<boolean>;
}

function ReminderForm({
  reminder,
  isSaving,
  onCancel,
  onSave,
}: ReminderFormProps) {
  const [title, setTitle] = useState(reminder?.title ?? "");
  const [description, setDescription] = useState(reminder?.description ?? "");
  const [date, setDate] = useState(reminder?.date ?? "");
  const [time, setTime] = useState(reminder?.time ?? "");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>(
    reminder?.recurrence ?? "none",
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    reminder?.recurrenceEndDate ?? "",
  );
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSave() {
    setLocalError(null);

    if (!title.trim()) {
      setLocalError("Informe o título do lembrete.");
      return;
    }
    if (!date) {
      setLocalError("Selecione a data do lembrete.");
      return;
    }

    const didSave = await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      recurrence,
      recurrenceEndDate:
        recurrence !== "none" ? recurrenceEndDate || undefined : undefined,
      taskId: reminder?.taskId,
    });

    if (didSave) onCancel();
  }

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.formTitle}>
        {reminder ? "Atualizar lembrete" : "Criar lembrete"}
      </Text>
      <Text style={styles.formDescription}>
        {reminder
          ? "Atualize os dados do lembrete conforme necessário."
          : "Defina quando deseja receber o aviso e, se precisar, escolha uma recorrência."}
      </Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        accessibilityLabel="Título do lembrete"
        onChangeText={setTitle}
        placeholder="Ex: Tomar remédio"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={title}
      />
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        accessibilityLabel="Descrição do lembrete"
        multiline
        onChangeText={setDescription}
        placeholder="Ex: Tomar o remédio da pressão com água"
        placeholderTextColor="#94A3B8"
        style={[styles.input, styles.textArea]}
        textAlignVertical="top"
        value={description}
      />
      <Text style={styles.label}>Data</Text>
      <PickerField
        accessibilityLabel="Data do lembrete"
        mode="date"
        onChange={setDate}
        placeholder="Selecionar data"
        value={date}
      />
      <Text style={styles.label}>Horário (opcional)</Text>
      <PickerField
        accessibilityLabel="Horário do lembrete"
        mode="time"
        onChange={setTime}
        onClear={() => setTime("")}
        placeholder="Selecionar horário"
        value={time}
      />
      <Text style={styles.label}>Recorrência</Text>
      <View style={styles.options}>
        {(Object.keys(recurrenceLabels) as ReminderRecurrence[]).map(
          (value) => (
            <OptionButton
              key={value}
              label={recurrenceLabels[value]}
              selected={recurrence === value}
              onPress={() => setRecurrence(value)}
            />
          ),
        )}
      </View>
      {recurrence !== "none" && (
        <>
          <Text style={styles.label}>Data final da recorrência (opcional)</Text>
          <PickerField
            accessibilityLabel="Data final da recorrência"
            mode="date"
            onChange={setRecurrenceEndDate}
            onClear={() => setRecurrenceEndDate("")}
            placeholder="Selecionar data final"
            value={recurrenceEndDate}
          />
        </>
      )}
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
            {reminder ? "Atualizar lembrete" : "Criar lembrete"}
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
  const isHighContrast = preferences?.contrast === "high";
  const color = isHighContrast
    ? danger
      ? "#FCA5A5"
      : primary
        ? "#000000"
        : "#FACC15"
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
        danger &&
          isHighContrast && {
            borderColor: "#FCA5A5",
            backgroundColor: "#111111",
          },
        primary && styles.completeButton,
        primary &&
          isHighContrast && {
            borderColor: "#FACC15",
            backgroundColor: "#FACC15",
          },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <MaterialCommunityIcons color={color} name={icon} size={19} />
      <Text
        style={[
          styles.actionText,
          danger && styles.dangerText,
          danger && isHighContrast && { color: "#FCA5A5" },
          primary && styles.completeText,
          primary && isHighContrast && { color: "#000000" },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ReminderItem({
  reminder,
  isDeleting,
  onComplete,
  onDelete,
  onEdit,
  onTaskDetail,
}: {
  reminder: Reminder;
  isDeleting: boolean;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onTaskDetail: () => void;
}) {
  const { preferences } = useAccessibility();
  const isHighContrast = preferences?.contrast === "high";

  return (
    <View
      style={[
        styles.reminderItem,
        reminder.completed && styles.completedItem,
        reminder.completed &&
          isHighContrast && {
            borderColor: "#FFFFFF",
            backgroundColor: "#111111",
            opacity: 1,
          },
      ]}>
      <View style={styles.titleRow}>
        <Text
          accessibilityRole="header"
          style={[
            styles.reminderTitle,
            reminder.completed &&
              isHighContrast && { color: "#FACC15" },
          ]}>
          {reminder.title}
        </Text>
        <View
          style={[
            styles.badge,
            reminder.completed ? styles.completedBadge : styles.pendingBadge,
            isHighContrast && {
              borderWidth: 1,
              borderColor: "#FACC15",
              backgroundColor: "#111111",
            },
          ]}>
          <Text
            style={[
              styles.badgeText,
              reminder.completed
                ? styles.completedBadgeText
                : styles.pendingBadgeText,
              isHighContrast && {
                color: "#FACC15",
              },
            ]}>
            {reminder.completed ? "Concluído" : "Pendente"}
          </Text>
        </View>
      </View>
      {reminder.description && (
        <Text style={styles.reminderDescription}>{reminder.description}</Text>
      )}
      <View style={styles.dateRow}>
        <MaterialCommunityIcons
          color={isHighContrast ? "#FACC15" : "#6D28D9"}
          name="calendar-blank-outline"
          size={18}
        />
        <Text style={styles.dateText}>
          {formatDate(reminder.date)}
          {reminder.time ? ` às ${reminder.time}` : ""}
        </Text>
      </View>
      <View style={styles.metadata}>
        <Text
          style={[
            styles.recurrenceBadge,
            isHighContrast && {
              borderWidth: 1,
              borderColor: "#FFFFFF",
              backgroundColor: "#111111",
              color: "#FFFFFF",
            },
          ]}>
          {recurrenceLabels[reminder.recurrence]}
        </Text>
        {reminder.recurrenceEndDate && (
          <Text
            style={[
              styles.endDateBadge,
              isHighContrast && {
                borderWidth: 1,
                borderColor: "#FFFFFF",
                backgroundColor: "#111111",
                color: "#FFFFFF",
              },
            ]}>
            Até {formatDate(reminder.recurrenceEndDate)}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        {!reminder.completed && (
          <ActionButton icon="pencil-outline" label="Editar" onPress={onEdit} />
        )}
        <ActionButton
          danger
          disabled={isDeleting}
          icon="trash-can-outline"
          label="Excluir"
          onPress={onDelete}
        />
        {!reminder.completed && (
          <ActionButton
            primary
            icon="check"
            label="Concluir"
            onPress={onComplete}
          />
        )}
        {reminder.taskId && (
          <ActionButton
            icon="clipboard-text-outline"
            label="Ver tarefa"
            onPress={onTaskDetail}
          />
        )}
      </View>
    </View>
  );
}

export default function RemindersScreen() {
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { preferences } = useAccessibility();
  const isHighContrast = preferences?.contrast === "high";
  const {
    reminders,
    isLoading,
    isSaving,
    isDeleting,
    error,
    createReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
  } = useReminders(user?.id ?? null);
  const {
    permission: notificationPermission,
    isRequesting: isRequestingNotifications,
    error: notificationError,
    requestPermission: requestNotificationPermission,
  } = useReminderNotifications(reminders);
  const [mode, setMode] = useState<ScreenMode>("list");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null,
  );
  const [filter, setFilter] = useState<ReminderFilter>("all");

  const counts = useMemo(
    () => ({
      due: reminders.filter(isDue).length,
      pending: reminders.filter((reminder) => !reminder.completed).length,
      completed: reminders.filter((reminder) => reminder.completed).length,
      recurring: reminders.filter((reminder) => reminder.recurrence !== "none")
        .length,
    }),
    [reminders],
  );
  const filteredReminders = useMemo(
    () =>
      reminders.filter((reminder) => {
        if (filter === "pending") return !reminder.completed;
        if (filter === "completed") return reminder.completed;
        if (filter === "recurring") return reminder.recurrence !== "none";
        return true;
      }),
    [filter, reminders],
  );
  const dueReminders = useMemo(() => reminders.filter(isDue), [reminders]);

  function navigate(route: AppBarRoute) {
    if (route === "reminders") return;
    if (route === "home") return router.navigate("/home");
    if (route === "activities") return router.navigate("/activities");
    if (route === "tasks") return router.navigate("/tasks");
    if (route === "profile") return router.navigate("/profile");
    if (route === "settings") return router.navigate("/settings");
    Alert.alert(
      "Área indisponível",
      "Esta área ainda não está disponível no aplicativo mobile.",
    );
  }

  function confirmDelete(reminder: Reminder) {
    Alert.alert(
      "Excluir lembrete",
      `Deseja excluir o lembrete "${reminder.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => void deleteReminder(reminder.id),
        },
      ],
    );
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
        activeRoute="reminders"
        alertCount={counts.due}
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
                  Meus lembretes
                </Text>
                <Text style={styles.description}>
                  Crie lembretes com data, horário e recorrência para acompanhar
                  compromissos e atividades importantes.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedReminder(null);
                    setMode("create");
                  }}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={styles.primaryButtonText}>＋ Novo lembrete</Text>
                </Pressable>
              </View>
              <View style={styles.summaryGrid}>
                <SummaryCard
                  amber
                  icon="alert-circle-outline"
                  label="Vencidos"
                  value={counts.due}
                />
                <SummaryCard
                  icon="bell-outline"
                  label="Pendentes"
                  value={counts.pending}
                />
                <SummaryCard
                  blue
                  icon="repeat"
                  label="Recorrentes"
                  value={counts.recurring}
                />
                <SummaryCard
                  green
                  icon="check-circle-outline"
                  label="Concluídos"
                  value={counts.completed}
                />
              </View>
              {notificationPermission !== "granted" && (
                <View
                  accessibilityRole="alert"
                  style={[
                    styles.notificationAlert,
                    isHighContrast && {
                      borderColor: "#FACC15",
                      backgroundColor: "#111111",
                    },
                  ]}>
                  <MaterialCommunityIcons
                    color={isHighContrast ? "#FACC15" : "#6D28D9"}
                    name="bell-ring-outline"
                    size={26}
                  />
                  <View style={styles.notificationAlertContent}>
                    <Text
                      style={[
                        styles.notificationAlertTitle,
                        isHighContrast && { color: "#FACC15" },
                      ]}>
                      Ative os avisos de lembretes
                    </Text>
                    <Text
                      style={[
                        styles.notificationAlertText,
                        isHighContrast && { color: "#FFFFFF" },
                      ]}>
                      {notificationPermission === "denied"
                        ? "A permissão está desativada. Abra as configurações do aparelho para permitir notificações."
                        : notificationPermission === "unsupported"
                          ? "No Android, os avisos não são carregados no Expo Go. Use um development build para testar esta funcionalidade."
                        : "Permita notificações para receber os lembretes mesmo quando o aplicativo estiver fechado."}
                    </Text>
                    {notificationPermission !== "unsupported" && (
                      <Pressable
                        accessibilityRole="button"
                        disabled={isRequestingNotifications}
                        onPress={() => {
                          if (notificationPermission === "denied") {
                            void Linking.openSettings();
                            return;
                          }

                          void requestNotificationPermission();
                        }}
                        style={({ pressed }) => [
                          styles.notificationButton,
                          isHighContrast && {
                            borderColor: "#FACC15",
                            backgroundColor: "#FACC15",
                          },
                          isRequestingNotifications && styles.disabled,
                          pressed && styles.pressed,
                        ]}>
                        {isRequestingNotifications ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text
                            style={[
                              styles.notificationButtonText,
                              isHighContrast && { color: "#000000" },
                            ]}>
                            {notificationPermission === "denied"
                              ? "Abrir configurações"
                              : "Ativar notificações"}
                          </Text>
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>
              )}
              {notificationError && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {notificationError}
                </Text>
              )}
              {dueReminders.length > 0 && (
                <View
                  accessibilityRole="alert"
                  style={[
                    styles.dueAlert,
                    isHighContrast && {
                      borderColor: "#FACC15",
                      backgroundColor: "#111111",
                    },
                  ]}>
                  <Text
                    style={[
                      styles.dueTitle,
                      isHighContrast && { color: "#FACC15" },
                    ]}>
                    Você tem {dueReminders.length} lembrete
                    {dueReminders.length === 1 ? "" : "s"} vencido
                    {dueReminders.length === 1 ? "" : "s"}
                  </Text>
                  <Text
                    style={[
                      styles.dueText,
                      isHighContrast && { color: "#FFFFFF" },
                    ]}>
                    Revise os lembretes pendentes e conclua o que já foi
                    realizado.
                  </Text>
                </View>
              )}
              {error && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              )}
              <View style={styles.listPanel}>
                <Text accessibilityRole="header" style={styles.listTitle}>
                  Lista de lembretes
                </Text>
                <Text style={styles.listCount}>
                  {filteredReminders.length} de {reminders.length} lembrete
                  {reminders.length === 1 ? "" : "s"}
                </Text>
                <ScrollView
                  horizontal
                  contentContainerStyle={styles.filters}
                  showsHorizontalScrollIndicator={false}>
                  <FilterButton
                    label={`Todos ${reminders.length}`}
                    selected={filter === "all"}
                    onPress={() => setFilter("all")}
                  />
                  <FilterButton
                    label={`Pendentes ${counts.pending}`}
                    selected={filter === "pending"}
                    onPress={() => setFilter("pending")}
                  />
                  <FilterButton
                    label={`Concluídos ${counts.completed}`}
                    selected={filter === "completed"}
                    onPress={() => setFilter("completed")}
                  />
                  <FilterButton
                    label={`Recorrentes ${counts.recurring}`}
                    selected={filter === "recurring"}
                    onPress={() => setFilter("recurring")}
                  />
                </ScrollView>
                {isLoading ? (
                  <ActivityIndicator
                    color="#6D28D9"
                    size="large"
                    style={styles.feedback}
                  />
                ) : filteredReminders.length === 0 ? (
                  <Text style={styles.empty}>Nenhum lembrete encontrado.</Text>
                ) : (
                  <View style={styles.reminderList}>
                    {filteredReminders.map((reminder) => (
                      <ReminderItem
                        isDeleting={isDeleting}
                        key={reminder.id}
                        onComplete={() => void completeReminder(reminder.id)}
                        onDelete={() => confirmDelete(reminder)}
                        onEdit={() => {
                          setSelectedReminder(reminder);
                          setMode("edit");
                        }}
                        onTaskDetail={() =>
                          router.navigate({
                            pathname: "/tasks",
                            params: { taskId: reminder.taskId },
                          })
                        }
                        reminder={reminder}
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
                onPress={() => {
                  setSelectedReminder(null);
                  setMode("list");
                }}
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
              <ReminderForm
                isSaving={isSaving}
                onCancel={() => {
                  setSelectedReminder(null);
                  setMode("list");
                }}
                onSave={(input) =>
                  selectedReminder
                    ? updateReminder({
                        reminderId: selectedReminder.id,
                        ...input,
                      })
                    : createReminder(input)
                }
                reminder={selectedReminder}
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
  amber = false,
  blue = false,
  green = false,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: number;
  amber?: boolean;
  blue?: boolean;
  green?: boolean;
}) {
  const { preferences } = useAccessibility();
  const isHighContrast = preferences?.contrast === "high";
  const color = isHighContrast
    ? green
      ? "#86EFAC"
      : "#FACC15"
    : amber
      ? "#B45309"
      : blue
        ? "#1D4ED8"
        : green
          ? "#15803D"
          : "#6D28D9";

  return (
    <View
      style={[
        styles.summaryCard,
        amber && styles.amberSummary,
        blue && styles.blueSummary,
        green && styles.greenSummary,
        isHighContrast && {
          borderColor: green ? "#86EFAC" : "#FACC15",
          backgroundColor: green ? "#052E16" : "#111111",
        },
      ]}>
      <MaterialCommunityIcons color={color} name={icon} size={24} />
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
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
  const { preferences } = useAccessibility();
  const isHighContrastSelected =
    selected && preferences?.contrast === "high";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.filter,
        selected && styles.selectedFilter,
        isHighContrastSelected && {
          borderColor: "#FACC15",
          backgroundColor: "#FACC15",
        },
      ]}>
      <Text
        style={[
          styles.filterText,
          selected && styles.selectedFilterText,
          isHighContrastSelected && { color: "#000000" },
        ]}>
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
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24,
  },
  summaryCard: {
    width: "48%",
    minHeight: 116,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
  },
  amberSummary: { borderColor: "#FDE68A", backgroundColor: "#FFFBEB" },
  blueSummary: { borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" },
  greenSummary: { borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" },
  summaryValue: { marginTop: 4, fontSize: 28, fontWeight: "800" },
  summaryLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  dueAlert: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 14,
    backgroundColor: "#FFFBEB",
  },
  dueTitle: { color: "#92400E", fontSize: 16, fontWeight: "800" },
  dueText: { marginTop: 4, color: "#A16207", fontSize: 14, lineHeight: 21 },
  notificationAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
  },
  notificationAlertContent: { flex: 1 },
  notificationAlertTitle: {
    color: "#5B21B6",
    fontSize: 16,
    fontWeight: "800",
  },
  notificationAlertText: {
    marginTop: 4,
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
  },
  notificationButton: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#6D28D9",
    borderRadius: 10,
    backgroundColor: "#6D28D9",
  },
  notificationButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
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
  reminderList: { gap: 16, marginTop: 20 },
  reminderItem: {
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
  reminderTitle: {
    flexShrink: 1,
    color: "#6D28D9",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 27,
  },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  completedBadge: { backgroundColor: "#E2E8F0" },
  badgeText: { fontSize: 12, fontWeight: "800" },
  pendingBadgeText: { color: "#92400E" },
  completedBadgeText: { color: "#475569" },
  reminderDescription: {
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
  metadata: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  recurrenceBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "800",
  },
  endDateBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#EDE9FE",
    color: "#5B21B6",
    fontSize: 12,
    fontWeight: "800",
  },
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
  pickerFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  pickerButton: {
    minHeight: 52,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  pickerText: { flex: 1, color: "#0F172A", fontSize: 16 },
  placeholderText: { color: "#64748B" },
  clearButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  pickerContainer: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  pickerDoneButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#6D28D9",
  },
  pickerDoneText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  textArea: { minHeight: 104, paddingTop: 14 },
  options: { gap: 8, marginTop: 8 },
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
