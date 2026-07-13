import { NavLink } from "react-router-dom";

import { classNames } from "../ui";

const links = [
  { to: "/", label: "Tarefas", end: true },
  { to: "/lembretes", label: "Lembretes", end: false },
  { to: "/perfil", label: "Perfil", end: false },
  { to: "/configuracoes", label: "Configurações", end: false },
];

export function AppNavigation() {
  return (
    <nav className="mt-6 flex gap-3">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            classNames(
              "rounded-xl border px-4 py-3 font-bold no-underline",
              isActive
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-950",
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
