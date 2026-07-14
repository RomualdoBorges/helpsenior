import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import type { Reminder } from "@helpsenior/core";

import { classNames } from "../ui";

const navigationLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/tarefas", label: "Tarefas", end: false },
  { to: "/lembretes", label: "Lembretes", end: false },
];

interface AppBarProps {
  alerts: Reminder[];
  userName?: string;
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export function AppBar({ alerts, userName, userEmail, onSignOut }: AppBarProps) {
  const [isAlertsMenuOpen, setIsAlertsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const alertsMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const avatarLabel = getAvatarLabel(userName, userEmail);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAlertsMenuOpen(false);
        setIsAccountMenuOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }

      if (
        alertsMenuRef.current &&
        !alertsMenuRef.current.contains(event.target as Node)
      ) {
        setIsAlertsMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  async function handleSignOut() {
    setIsAccountMenuOpen(false);
    await onSignOut();
  }

  return (
    <>
      <header className="app-bar fixed inset-x-0 top-0 z-30 grid min-h-18 grid-cols-[1fr_auto] items-center border-b border-slate-300 bg-white px-4 sm:h-18 sm:grid-cols-[auto_1fr_auto] sm:px-0">
        <Link
          to="/"
          className="flex h-full items-center justify-self-start text-xl font-bold text-slate-950 no-underline sm:px-6"
        >
          HelpSenior
        </Link>

        <nav
          id="app-navigation"
          aria-label="Menu principal"
          className="order-3 col-span-2 -mx-4 flex h-full items-stretch justify-center border-t border-slate-200 sm:order-0 sm:col-span-1 sm:mx-0 sm:border-t-0"
        >
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                classNames(
                  "flex items-center border-b-4 px-4 py-3 font-bold text-slate-600 no-underline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-slate-950 sm:h-full sm:px-6 sm:py-0",
                  isActive
                    ? "border-slate-950 text-slate-950"
                    : "border-transparent",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex h-full items-center">
          <div
            ref={alertsMenuRef}
            className="relative flex h-full items-center px-2 sm:px-4"
          >
            <button
              type="button"
              className="relative flex size-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-950 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
              aria-label={`Abrir alertas. ${alerts.length} alerta${alerts.length === 1 ? "" : "s"}`}
              aria-haspopup="menu"
              aria-expanded={isAlertsMenuOpen}
              onClick={() => {
                setIsAlertsMenuOpen((isOpen) => !isOpen);
                setIsAccountMenuOpen(false);
              }}
            >
              <BellIcon />
              {alerts.length > 0 ? (
                <span className="absolute -right-1 -top-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {alerts.length > 99 ? "99+" : alerts.length}
                </span>
              ) : null}
            </button>

            {isAlertsMenuOpen ? (
              <div
                className="alerts-menu absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-300 bg-white p-2 shadow-lg"
                role="menu"
              >
                <div className="border-b border-slate-200 px-3 py-3">
                  <strong className="block text-lg text-slate-950">
                    Alertas
                  </strong>
                  <p className="mt-1 text-sm text-slate-500">
                    {alerts.length === 0
                      ? "Nenhum lembrete vencido."
                      : `${alerts.length} lembrete${alerts.length === 1 ? "" : "s"} aguardando atenção.`}
                  </p>
                </div>

                {alerts.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {alerts.map((alert) => (
                      <Link
                        key={alert.id}
                        to="/lembretes"
                        role="menuitem"
                        className="block rounded-xl px-3 py-3 text-slate-950 no-underline hover:bg-amber-50 focus-visible:outline-3 focus-visible:outline-amber-700"
                        onClick={() => setIsAlertsMenuOpen(false)}
                      >
                        <strong className="block">{alert.title}</strong>
                        <span className="mt-1 block text-sm text-slate-600">
                          {alert.time
                            ? `${formatAlertDate(alert.date)} às ${alert.time}`
                            : formatAlertDate(alert.date)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}

                <Link
                  to="/lembretes"
                  role="menuitem"
                  className="block border-t border-slate-200 px-3 py-3 text-center font-bold text-slate-950 no-underline hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-slate-950"
                  onClick={() => setIsAlertsMenuOpen(false)}
                >
                  Ver todos os lembretes
                </Link>
              </div>
            ) : null}
          </div>

          <div
            ref={accountMenuRef}
            className="relative flex h-full items-center pl-2 sm:px-4"
          >
            <button
              type="button"
              className="flex size-12 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-950 font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
              aria-label="Abrir menu da conta"
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              onClick={() => {
                setIsAccountMenuOpen((isOpen) => !isOpen);
                setIsAlertsMenuOpen(false);
              }}
            >
              {avatarLabel}
            </button>

            {isAccountMenuOpen ? (
              <div
                className="account-menu absolute right-0 top-full mt-3 w-64 rounded-2xl border border-slate-300 bg-white p-2 shadow-lg"
                role="menu"
              >
                <div className="border-b border-slate-200 px-3 py-3">
                  <strong className="block truncate text-slate-950">
                    {userName || "Conta conectada"}
                  </strong>
                  {userEmail ? (
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {userEmail}
                    </p>
                  ) : null}
                </div>

                <Link
                  to="/perfil"
                  role="menuitem"
                  className="mt-2 block rounded-xl px-3 py-3 font-bold text-slate-950 no-underline hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-slate-950"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  Meu perfil
                </Link>

                <Link
                  to="/configuracoes"
                  role="menuitem"
                  className="block rounded-xl px-3 py-3 font-bold text-slate-950 no-underline hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-slate-950"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  Configurações
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  className="w-full rounded-xl px-3 py-3 text-left font-bold text-red-700 hover:bg-red-50 focus-visible:outline-3 focus-visible:outline-red-700"
                  onClick={() => void handleSignOut()}
                >
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="h-26 sm:h-18" aria-hidden="true" />
    </>
  );
}

function getAvatarLabel(userName?: string, userEmail?: string | null) {
  const source = userName?.trim() || userEmail?.trim() || "Usuário";
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return `${words[0]?.[0] ?? ""}${words.at(-1)?.[0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function formatAlertDate(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function BellIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="none">
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
