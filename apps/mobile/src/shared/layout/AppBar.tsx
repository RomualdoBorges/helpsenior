import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState, type ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useReminderAlertCount } from "@/src/features/reminders/useReminders";
import {
  createAccessibleStyleSheet,
  useAccessibility,
} from "@/src/features/preferences/accessibility";
import { useUserProfile } from "@/src/features/profile/useUserProfile";

type OpenPanel = "navigation" | "alerts" | "account" | null;
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

interface AppBarProps {
  email: string | null;
  userId?: string;
  userName?: string;
  activeRoute?: AppBarRoute;
  alertCount?: number;
  onNavigate?: (route: AppBarRoute) => void;
  onSignOut: () => void | Promise<void>;
}

export type AppBarRoute =
  | "home"
  | "activities"
  | "tasks"
  | "reminders"
  | "profile"
  | "settings";

const navigationItems: {
  route: AppBarRoute;
  label: string;
  icon: IconName;
}[] = [
  { route: "home", label: "Home", icon: "home-outline" },
  { route: "activities", label: "Atividades", icon: "format-list-bulleted" },
  { route: "tasks", label: "Tarefas", icon: "clipboard-check-outline" },
  { route: "reminders", label: "Lembretes", icon: "bell-outline" },
];

function getFirstName(userName: string | undefined) {
  const firstName = userName?.trim().split(/\s+/)[0];

  if (!firstName) {
    return "Usuário";
  }

  return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`;
}

export function AppBar({
  email,
  userId,
  userName,
  activeRoute = "home",
  alertCount,
  onNavigate,
  onSignOut,
}: AppBarProps) {
  const insets = useSafeAreaInsets();
  const { preferences } = useAccessibility();
  const { profile } = useUserProfile(userId ?? null, email);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const displayName = getFirstName(userName ?? profile?.name);
  const displayEmail = email || "E-mail não informado";
  const initial = displayName.charAt(0).toUpperCase();
  const isNavigationOpen = openPanel === "navigation";
  const isHighContrast = preferences?.contrast === "high";
  const accessibilityKey = preferences
    ? [
        preferences.fontSize,
        preferences.contrast,
        preferences.simpleMode,
        preferences.increasedSpacing,
      ].join("-")
    : "default";
  const loadedAlertCount = useReminderAlertCount(userId ?? null);
  const visibleAlertCount = alertCount ?? loadedAlertCount;

  function togglePanel(panel: Exclude<OpenPanel, null>) {
    setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel));
  }

  function handleNavigation(route: AppBarRoute) {
    setOpenPanel(null);
    onNavigate?.(route);
  }

  return (
    <View
      key={accessibilityKey}
      style={[styles.layer, { top: insets.top }]}
      pointerEvents="box-none">
      {openPanel && (
        <Pressable
          accessibilityLabel="Fechar menu"
          onPress={() => setOpenPanel(null)}
          style={styles.backdrop}
        />
      )}

      <View style={styles.appBar}>
        <Pressable
          accessibilityLabel={isNavigationOpen ? "Fechar menu" : "Abrir menu"}
          accessibilityRole="button"
          accessibilityState={{ expanded: isNavigationOpen }}
          hitSlop={4}
          onPress={() => togglePanel("navigation")}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}>
          <MenuIcon isOpen={isNavigationOpen} />
        </Pressable>

        <Pressable
          accessibilityLabel="HelpSenior — página inicial"
          accessibilityRole="button"
          onPress={() => handleNavigation("home")}
          style={({ pressed }) => [
            styles.logoButton,
            pressed && styles.pressed,
          ]}>
          <Text
            style={[
              styles.logo,
              isHighContrast && { color: "#FFFFFF" },
            ]}>
            HelpSenior
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={
              visibleAlertCount > 0
                ? `Mostrar ${visibleAlertCount} alertas`
                : "Mostrar alertas"
            }
            accessibilityRole="button"
            accessibilityState={{ expanded: openPanel === "alerts" }}
            onPress={() => togglePanel("alerts")}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}>
            <MaterialCommunityIcons
              accessibilityElementsHidden
              color={isHighContrast ? "#FACC15" : "#475569"}
              name="bell-outline"
              size={26}
            />
            {visibleAlertCount > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>
                  {visibleAlertCount > 9 ? "9+" : visibleAlertCount}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityLabel="Abrir opções da conta"
            accessibilityRole="button"
            accessibilityState={{ expanded: openPanel === "account" }}
            onPress={() => togglePanel("account")}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.pressed,
            ]}>
            <View
              style={[
                styles.avatar,
                isHighContrast && { backgroundColor: "#FACC15" },
              ]}>
              <Text
                style={[
                  styles.avatarText,
                  isHighContrast && { color: "#000000" },
                ]}>
                {initial}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {openPanel === "navigation" && (
        <View accessibilityRole="menu" style={styles.navigationPanel}>
          {navigationItems.map((item) => {
            const isActive = item.route === activeRoute;

            return (
              <Pressable
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isActive }}
                key={item.route}
                onPress={() => handleNavigation(item.route)}
                style={({ pressed }) => [
                  styles.navigationItem,
                  isActive && styles.activeNavigationItem,
                  pressed && styles.pressed,
                ]}>
                <MaterialCommunityIcons
                  accessibilityElementsHidden
                  color={
                    isActive && preferences?.contrast === "high"
                      ? "#FACC15"
                      : isActive
                        ? "#6D28D9"
                        : "#334155"
                  }
                  name={item.icon}
                  size={25}
                  style={styles.navigationIcon}
                />
                <Text
                  style={[
                    styles.navigationText,
                    isActive && styles.activeNavigationText,
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {openPanel === "alerts" && (
        <View accessibilityRole="alert" style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Alertas</Text>
            <Text style={styles.panelCount}>{visibleAlertCount}</Text>
          </View>
          {visibleAlertCount > 0 ? (
            <Pressable
              accessibilityHint="Abre a lista de lembretes"
              accessibilityRole="button"
              onPress={() => handleNavigation("reminders")}
              style={({ pressed }) => [
                styles.alertItem,
                pressed && styles.pressed,
              ]}>
              <View style={styles.alertIcon}>
                <MaterialCommunityIcons
                  accessibilityElementsHidden
                  color={isHighContrast ? "#FACC15" : "#B45309"}
                  name="alert-circle-outline"
                  size={24}
                />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {visibleAlertCount} lembrete
                  {visibleAlertCount === 1 ? "" : "s"} vencido
                  {visibleAlertCount === 1 ? "" : "s"}
                </Text>
                <Text style={styles.alertDescription}>
                  Toque para revisar os lembretes pendentes.
                </Text>
              </View>
              <MaterialCommunityIcons
                accessibilityElementsHidden
                color={isHighContrast ? "#FFFFFF" : "#64748B"}
                name="chevron-right"
                size={24}
              />
            </Pressable>
          ) : (
            <Text style={styles.emptyMessage}>Nenhum alerta no momento.</Text>
          )}
        </View>
      )}

      {openPanel === "account" && (
        <View accessibilityRole="menu" style={styles.accountPanel}>
          <View style={styles.accountHeader}>
            <Text numberOfLines={1} style={styles.accountName}>
              {displayName}
            </Text>
            <Text numberOfLines={1} style={styles.accountEmail}>
              {displayEmail}
            </Text>
          </View>

          <AccountItem
            icon="account-circle-outline"
            label="Perfil"
            onPress={() => handleNavigation("profile")}
          />
          <AccountItem
            icon="cog-outline"
            label="Configurações"
            onPress={() => handleNavigation("settings")}
          />
          <AccountItem
            danger
            icon="logout"
            label="Sair"
            onPress={() => {
              setOpenPanel(null);
              void onSignOut();
            }}
          />
        </View>
      )}
    </View>
  );
}

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  const { preferences } = useAccessibility();

  return (
    <MaterialCommunityIcons
      accessibilityElementsHidden
      color={preferences?.contrast === "high" ? "#FACC15" : "#334155"}
      name={isOpen ? "close" : "menu"}
      size={30}
    />
  );
}

interface AccountItemProps {
  icon: IconName;
  label: string;
  danger?: boolean;
  onPress: () => void;
}

function AccountItem({
  icon,
  label,
  danger = false,
  onPress,
}: AccountItemProps) {
  const { preferences } = useAccessibility();
  const isHighContrast = preferences?.contrast === "high";

  return (
    <Pressable
      accessibilityRole="menuitem"
      onPress={onPress}
      style={({ pressed }) => [
        styles.accountItem,
        danger && styles.dangerItem,
        pressed && styles.pressed,
      ]}>
      <MaterialCommunityIcons
        accessibilityElementsHidden
        color={
          isHighContrast ? (danger ? "#FCA5A5" : "#FACC15") : danger ? "#B91C1C" : "#334155"
        }
        name={icon}
        size={23}
        style={styles.accountItemIcon}
      />
      <Text style={[styles.accountItemText, danger && styles.dangerText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = createAccessibleStyleSheet({
  layer: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    zIndex: 20,
  },
  backdrop: {
    position: "absolute",
    top: 64,
    right: 0,
    bottom: -1000,
    left: 0,
    backgroundColor: "rgba(15, 23, 42, 0.24)",
  },
  appBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  iconButton: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  logoButton: {
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  logo: {
    color: "#0F172A",
    fontSize: 21,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    alignItems: "stretch",
    marginLeft: "auto",
  },
  alertBadge: {
    position: "absolute",
    top: 10,
    right: 6,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#DC2626",
  },
  alertBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  alertItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFBEB",
  },
  alertIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "800",
  },
  alertDescription: {
    marginTop: 3,
    color: "#78716C",
    fontSize: 12,
    lineHeight: 18,
  },
  avatarButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#6D28D9",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  navigationPanel: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  navigationItem: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeNavigationItem: {
    backgroundColor: "#F5F3FF",
  },
  navigationIcon: {
    width: 26,
    textAlign: "center",
  },
  navigationText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "700",
  },
  activeNavigationText: {
    color: "#6D28D9",
  },
  panel: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  panelHeader: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  panelTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  panelCount: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyMessage: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
  accountPanel: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  accountHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  accountName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  accountEmail: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
  },
  accountItem: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dangerItem: {
    backgroundColor: "#FFF",
  },
  accountItemIcon: {
    width: 24,
    textAlign: "center",
  },
  accountItemText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "700",
  },
  dangerText: {
    color: "#B91C1C",
  },
  pressed: {
    opacity: 0.65,
  },
});
