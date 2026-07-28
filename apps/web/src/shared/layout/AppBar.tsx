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
  | "close"
  | "logout"
  | "menu"
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
      <svg
        {...commonProps}
        fill="currentColor"
        stroke="none"
        viewBox="0 -960 960 960">
        <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
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

  if (name === "menu") {
    return (
      <svg {...commonProps}>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...commonProps}>
        <path d="m5 5 14 14M19 5 5 19" />
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dueReminderCount = dueReminders.length;
  const displayName = getFirstName(userName);
  const displayEmail = email || "E-mail não informado";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function closeMenuOnOutsideClick(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !mobileMenuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }

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
        setIsMobileMenuOpen(false);
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
      <div className="flex h-16 items-stretch md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex shrink-0 items-stretch justify-self-start">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-controls="mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            className="flex w-12 items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-violet-700 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-violet-700 md:hidden"
            onClick={() => {
              setIsMobileMenuOpen((currentValue) => !currentValue);
              setIsAlertsOpen(false);
              setIsUserMenuOpen(false);
            }}>
            <AppBarIcon
              name={isMobileMenuOpen ? "close" : "menu"}
              className="size-7"
            />
          </button>

          <Link
            to="/"
            aria-label="HelpSenior — página inicial"
            className="app-bar-logo flex shrink-0 items-center rounded-lg font-bold text-slate-950 no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
            <span className="pr-2 text-xl sm:pr-5 sm:text-2xl md:px-5">
              HelpSenior
            </span>
          </Link>
        </div>

        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 items-stretch overflow-x-auto md:flex">
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

        <div className="ml-auto flex shrink-0 items-stretch justify-self-end md:ml-0">
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
                setIsMobileMenuOpen(false);
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
                className="app-bar-panel notification-popover fixed inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-white shadow-xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-80 md:rounded-2xl md:border">
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
                setIsMobileMenuOpen(false);
              }}>
              <span className="app-bar-avatar flex size-9 items-center justify-center rounded-full bg-violet-700 text-xs font-bold text-white">
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
                className="app-bar-panel fixed inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-white p-2 shadow-xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-64 md:rounded-2xl md:border">
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

      {isMobileMenuOpen && (
        <nav
          ref={mobileMenuRef}
          id="mobile-navigation"
          aria-label="Navegação principal"
          className="app-bar-panel absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-white p-2 shadow-xl md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold no-underline focus-visible:outline-3 focus-visible:outline-violet-700",
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-violet-700",
                )
              }>
              <AppBarIcon name={link.icon} className="size-6" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
