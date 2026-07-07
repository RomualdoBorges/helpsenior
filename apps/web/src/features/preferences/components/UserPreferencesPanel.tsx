import type {
  ContrastPreference,
  FontSizePreference,
  UserPreferences,
} from "@helpsenior/core";

interface UserPreferencesPanelProps {
  preferences: UserPreferences | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  onUpdatePreferences: (input: {
    fontSize?: FontSizePreference;
    contrast?: ContrastPreference;
    simpleMode?: boolean;
    reduceMotion?: boolean;
    increasedSpacing?: boolean;
  }) => Promise<void>;
}

export function UserPreferencesPanel({
  preferences,
  isLoading,
  isUpdating,
  error,
  onUpdatePreferences,
}: UserPreferencesPanelProps) {
  if (isLoading) {
    return (
      <section
        className="app-card mt-8 rounded-[20px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)]"
        aria-labelledby="preferences-title">
        <h2 id="preferences-title" className="m-0 text-[28px] font-bold">
          Preferências de acessibilidade
        </h2>

        <p className="mt-4 text-slate-600">Carregando preferências...</p>
      </section>
    );
  }

  if (!preferences) {
    return (
      <section
        className="app-card mt-8 rounded-[20px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)]"
        aria-labelledby="preferences-title">
        <h2 id="preferences-title" className="m-0 text-[28px] font-bold">
          Preferências de acessibilidade
        </h2>

        <p className="mt-4 text-slate-600">Preferências não encontradas.</p>
      </section>
    );
  }

  return (
    <section
      className="app-card mt-8 rounded-[20px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)]"
      aria-labelledby="preferences-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="preferences-title" className="m-0 text-[28px] font-bold">
            Preferências de acessibilidade
          </h2>

          <p className="preferences-description mt-2 text-base leading-6 text-slate-500">
            Ajuste a experiência visual para deixar o HelpSenior mais
            confortável e fácil de usar.
          </p>
        </div>

        {isUpdating && (
          <span className="text-sm font-bold text-slate-500">Salvando...</span>
        )}
      </div>

      {error && (
        <p className="app-error mt-4 font-bold text-red-700">{error}</p>
      )}

      <div className="mt-6 grid gap-4">
        <label className="flex flex-col gap-2 font-bold">
          <span>Tamanho da fonte</span>

          <select
            value={preferences.fontSize}
            onChange={(event) =>
              void onUpdatePreferences({
                fontSize: event.target.value as FontSizePreference,
              })
            }
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950">
            <option value="small">Pequena</option>
            <option value="medium">Média</option>
            <option value="large">Grande</option>
            <option value="extra_large">Extra grande</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 font-bold">
          <span>Contraste</span>

          <select
            value={preferences.contrast}
            onChange={(event) =>
              void onUpdatePreferences({
                contrast: event.target.value as ContrastPreference,
              })
            }
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950">
            <option value="default">Padrão</option>
            <option value="high">Alto contraste</option>
          </select>
        </label>

        <label className="preferences-toggle flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={preferences.simpleMode}
            onChange={(event) =>
              void onUpdatePreferences({
                simpleMode: event.target.checked,
              })
            }
            className="mt-0.5 h-5 w-5"
          />

          <span className="flex flex-col gap-1">
            <strong>Modo simples</strong>

            <small className="text-sm leading-5 text-slate-500">
              Reduz informações e prioriza ações principais.
            </small>
          </span>
        </label>

        <label className="preferences-toggle flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={preferences.reduceMotion}
            onChange={(event) =>
              void onUpdatePreferences({
                reduceMotion: event.target.checked,
              })
            }
            className="mt-0.5 h-5 w-5"
          />

          <span className="flex flex-col gap-1">
            <strong>Reduzir animações</strong>

            <small className="text-sm leading-5 text-slate-500">
              Diminui movimentos visuais na interface.
            </small>
          </span>
        </label>

        <label className="preferences-toggle flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={preferences.increasedSpacing}
            onChange={(event) =>
              void onUpdatePreferences({
                increasedSpacing: event.target.checked,
              })
            }
            className="mt-0.5 h-5 w-5"
          />

          <span className="flex flex-col gap-1">
            <strong>Espaçamento maior</strong>

            <small className="text-sm leading-5 text-slate-500">
              Aumenta os espaços entre elementos para facilitar a leitura.
            </small>
          </span>
        </label>
      </div>
    </section>
  );
}
