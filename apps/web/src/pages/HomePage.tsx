import { Link } from "react-router-dom";

interface HomeShortcutProps {
  description: string;
  label: string;
  title: string;
  to: string;
}

function HomeShortcut({ description, label, title, to }: HomeShortcutProps) {
  return (
    <Link
      to={to}
      className="app-card group flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 no-underline transition-shadow hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-violet-700">
      <div>
        <h2 className="home-shortcut-title m-0 text-lg font-bold text-violet-700">
          {title}
        </h2>
        <p className="simple-mode-secondary mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <span className="home-shortcut-link mt-auto flex items-center justify-between pt-5 text-sm font-bold text-violet-700">
        {label}
        <span
          aria-hidden="true"
          className="home-shortcut-arrow flex size-9 items-center justify-center rounded-full bg-violet-50 transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}

export function HomePage() {
  return (
    <div className="pb-4">
      <section className="pt-8" aria-labelledby="home-title">
        <p className="app-eyebrow home-eyebrow m-0 text-sm font-extrabold uppercase tracking-[0.08em] text-violet-700">
          HelpSenior
        </p>

        <h1
          id="home-title"
          className="mt-3 max-w-170 text-[40px] font-bold leading-[1.12] text-slate-950">
          Organize atividades com mais clareza e segurança.
        </h1>

        <p className="app-description mt-0 max-w-150 text-lg leading-8 text-slate-600">
          Crie e consulte guias claros para realizar atividades importantes do
          dia a dia com mais autonomia e tranquilidade.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="home-shortcuts-title">
        <h2
          id="home-shortcuts-title"
          className="m-0 text-2xl font-bold text-slate-950">
          O que você deseja acessar?
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <HomeShortcut
            to="/atividades"
            title="Ir para atividades"
            description="Acesse guias simples para acompanhar atividades importantes do dia a dia."
            label="Acessar atividades"
          />
          <HomeShortcut
            to="/tarefas"
            title="Ir para tarefas"
            description="Organize o que precisa ser feito e acompanhe o que já foi concluído."
            label="Acessar tarefas"
          />
          <HomeShortcut
            to="/lembretes"
            title="Ir para lembretes"
            description="Defina quando receber avisos e acompanhe lembretes recorrentes."
            label="Acessar lembretes"
          />
        </div>
      </section>

      <aside className="app-card mt-6 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 text-sm leading-6 text-slate-700">
        <span
          aria-hidden="true"
          className="home-tip-icon mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-700 font-bold text-white">
          i
        </span>
        <p className="m-0">
          <strong>Dica:</strong> use as atividades para registrar orientações
          simples e facilitar cada momento da sua rotina.
        </p>
      </aside>

    </div>
  );
}
