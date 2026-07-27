import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import type { Reminder } from "@helpsenior/core";

import { classNames } from "../ui";
import { formatDisplayDate } from "../utils/formatDisplayDate";

interface AppBarProps {
  dueReminders: Reminder[];
  email: string | null;
  userName?: string;
  onSignOut: () => void | Promise<void>;
}

type IconName =
  | "activity"
  | "bell"
  | "chevron"
  | "logout"
  | "profile"
  | "settings"
  | "task"
  | "home";

const links: { to: string; label: string; end: boolean; icon: IconName }[] = [
  { to: "/", label: "Home", end: true, icon: "home" },
  { to: "/atividades", label: "Atividades", end: true, icon: "activity" },
  { to: "/tarefas", label: "Tarefas", end: true, icon: "task" },
  { to: "/lembretes", label: "Lembretes", end: false, icon: "bell" },
];

function AppBarIcon({
  name,
  className = "size-5",
}: {
  name: IconName;
  className?: string;
}) {
  const commonProps = {
    "aria-hidden": true,
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  if (name === "home") {
    return (
      <svg {...commonProps}>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v10h13V10M9.5 20v-6h5v6" />
      </svg>
    );
  }

  if (name === "activity") {
    return (
      <svg {...commonProps}>
        <circle cx="5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="17.5" r="1" fill="currentColor" stroke="none" />
        <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      </svg>
    );
  }

  if (name === "task") {
    return (
      <svg {...commonProps}>
        <rect x="6" y="4" width="12" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...commonProps}>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7 2-.7Z" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...commonProps}>
        <path d="M10 17 15 12 10 7M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="m8 10 4 4 4-4" />
    </svg>
  );
}

function getFirstName(userName: string | undefined) {
  const firstName = userName?.trim().split(/\s+/)[0];

  if (!firstName) {
    return "Usuário";
  }

  return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`;
}

export function AppBar({
  dueReminders,
  email,
  userName,
  onSignOut,
}: AppBarProps) {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dueReminderCount = dueReminders.length;
  const displayName = getFirstName(userName);
  const displayEmail = email || "E-mail não informado";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function closeMenuOnOutsideClick(event: MouseEvent) {
      if (
        alertsRef.current &&
        !alertsRef.current.contains(event.target as Node)
      ) {
        setIsAlertsOpen(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAlertsOpen(false);
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenuOnOutsideClick);
    document.addEventListener("keydown", closeMenuOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenuOnOutsideClick);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, []);

  return (
    <header className="app-bar fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200 bg-white ">
      <div className="flex h-16 items-stretch justify-between gap-4">
        <Link
          to="/"
          aria-label="HelpSenior — página inicial"
          className="flex shrink-0 items-center rounded-lg font-bold text-slate-950 no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
          <span className="px-5 text-2xl">HelpSenior</span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex min-w-0 items-stretch overflow-x-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                classNames(
                  "relative flex shrink-0 items-center gap-2 px-3 text-base font-bold no-underline transition-colors focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-violet-700 sm:px-4",
                  isActive
                    ? "text-violet-700 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-violet-700"
                    : "text-slate-600 hover:text-violet-700",
                )
              }>
              <AppBarIcon name={link.icon} />
              <span className="hidden md:inline">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-stretch">
          <div ref={alertsRef} className="relative h-full">
            <button
              type="button"
              aria-label={
                dueReminderCount > 0
                  ? `Mostrar ${dueReminderCount} alertas`
                  : "Mostrar alertas"
              }
              aria-expanded={isAlertsOpen}
              aria-haspopup="dialog"
              className="relative flex h-full w-12 items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-violet-700 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-violet-700"
              onClick={() => {
                setIsAlertsOpen((currentValue) => !currentValue);
                setIsUserMenuOpen(false);
              }}>
              <span className="relative flex items-center justify-center">
                <AppBarIcon name="bell" className="size-6" />
                {dueReminderCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold leading-5 text-white">
                    {dueReminderCount > 9 ? "9+" : dueReminderCount}
                  </span>
                )}
              </span>
            </button>

            {isAlertsOpen && (
              <div
                role="dialog"
                aria-label="Alertas de lembretes"
                className="notification-popover absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <strong className="text-base text-slate-950">Alertas</strong>
                  <span className="text-sm font-bold text-slate-500">
                    {dueReminderCount}
                  </span>
                </div>

                {dueReminderCount === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    Nenhum alerta no momento.
                  </p>
                ) : (
                  <ul className="m-0 max-h-80 list-none overflow-y-auto p-2">
                    {dueReminders.map((reminder) => (
                      <li
                        key={reminder.id}
                        className="flex gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 size-2 shrink-0 rounded-full bg-red-600"
                        />
                        <div className="min-w-0">
                          <strong className="block truncate text-sm text-slate-950">
                            {reminder.title}
                          </strong>
                          <span className="mt-1 block text-sm text-slate-500">
                            {formatDisplayDate(reminder.date)}
                            {reminder.time ? ` às ${reminder.time}` : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div ref={userMenuRef} className="relative h-full">
            <button
              type="button"
              className="flex h-full items-center gap-2 px-2 text-slate-950 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-violet-700 sm:px-3"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              onClick={() => {
                setIsUserMenuOpen((currentValue) => !currentValue);
                setIsAlertsOpen(false);
              }}>
              <span className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                {initial}
              </span>
              <span className="hidden max-w-28 truncate text-base font-bold lg:block">
                {displayName}
              </span>
              <AppBarIcon
                name="chevron"
                className={classNames(
                  "hidden size-4 transition-transform sm:block",
                  isUserMenuOpen && "rotate-180",
                )}
              />
              <span className="sr-only">Abrir opções da conta</span>
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="border-b border-slate-200 px-3 py-3">
                  <strong className="block truncate text-sm text-slate-950">
                    {displayName}
                  </strong>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {displayEmail}
                  </span>
                </div>

                <Link
                  to="/perfil"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 font-bold text-slate-700 no-underline hover:bg-slate-100 hover:text-violet-700">
                  <AppBarIcon name="profile" />
                  Perfil
                </Link>
                <Link
                  to="/configuracoes"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 font-bold text-slate-700 no-underline hover:bg-slate-100 hover:text-violet-700">
                  <AppBarIcon name="settings" />
                  Configurações
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 font-bold text-red-700 hover:bg-red-50"
                  onClick={() => void onSignOut()}>
                  <AppBarIcon name="logout" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
