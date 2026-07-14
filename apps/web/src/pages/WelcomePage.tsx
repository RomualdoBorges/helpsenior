import { Link } from "react-router-dom";

export function WelcomePage() {
  return (
    <section
      className="mx-auto mt-8 w-full max-w-6xl"
      aria-labelledby="welcome-title"
    >
      <p className="app-eyebrow mb-2 text-sm font-bold uppercase tracking-[0.08em] text-slate-500">
        HelpSenior
      </p>

      <h1
        id="welcome-title"
        className="m-0 max-w-180 text-[44px] font-bold leading-[1.1] text-slate-950"
      >
        Organize atividades com mais clareza e segurança.
      </h1>

      <p className="app-description mt-4 max-w-170 text-xl leading-[1.6] text-slate-600">
        Crie tarefas simples e lembretes recorrentes para ajudar pessoas idosas
        a acompanhar a rotina com mais autonomia.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-slate-950">
        O que você deseja acessar?
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          to="/tarefas"
          className="welcome-action group rounded-2xl border-2 border-slate-300 bg-white p-6 text-slate-950 no-underline transition hover:border-slate-950 hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-slate-950"
        >
          <strong className="block text-2xl">Ir para tarefas</strong>
          <span className="mt-2 block leading-6 text-slate-600">
            Organize o que precisa ser feito e acompanhe o que já foi concluído.
          </span>
          <span className="mt-5 block font-bold" aria-hidden="true">
            Acessar tarefas →
          </span>
        </Link>

        <Link
          to="/lembretes"
          className="welcome-action group rounded-2xl border-2 border-slate-300 bg-white p-6 text-slate-950 no-underline transition hover:border-slate-950 hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-slate-950"
        >
          <strong className="block text-2xl">Ir para lembretes</strong>
          <span className="mt-2 block leading-6 text-slate-600">
            Defina quando receber avisos e acompanhe lembretes recorrentes.
          </span>
          <span className="mt-5 block font-bold" aria-hidden="true">
            Acessar lembretes →
          </span>
        </Link>
      </div>
    </section>
  );
}
