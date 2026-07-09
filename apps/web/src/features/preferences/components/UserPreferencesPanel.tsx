import type {
  ContrastPreference,
  FontSizePreference,
  UserPreferences,
} from "@helpsenior/core";

import {
  Alert,
  Card,
  FormField,
  Select,
  ToggleField,
} from "../../../shared/ui";

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
      <Card as="section" className="mt-8" aria-labelledby="preferences-title">
        <h2 id="preferences-title" className="m-0 text-[28px] font-bold">
          Preferências de acessibilidade
        </h2>

        <p className="mt-4 text-slate-600">Carregando preferências...</p>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card as="section" className="mt-8" aria-labelledby="preferences-title">
        <h2 id="preferences-title" className="m-0 text-[28px] font-bold">
          Preferências de acessibilidade
        </h2>

        <p className="mt-4 text-slate-600">Preferências não encontradas.</p>
      </Card>
    );
  }

  return (
    <Card as="section" className="mt-8" aria-labelledby="preferences-title">
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
        <Alert tone="error" className="app-error mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-6 grid gap-4">
        <FormField label="Tamanho da fonte">
          <Select
            value={preferences.fontSize}
            onChange={(event) =>
              void onUpdatePreferences({
                fontSize: event.target.value as FontSizePreference,
              })
            }>
            <option value="small">Pequena</option>
            <option value="medium">Média</option>
            <option value="large">Grande</option>
            <option value="extra_large">Extra grande</option>
          </Select>
        </FormField>

        <FormField label="Contraste">
          <Select
            value={preferences.contrast}
            onChange={(event) =>
              void onUpdatePreferences({
                contrast: event.target.value as ContrastPreference,
              })
            }>
            <option value="default">Padrão</option>
            <option value="high">Alto contraste</option>
          </Select>
        </FormField>

        <ToggleField
          checked={preferences.simpleMode}
          label="Modo simples"
          description="Reduz informações e prioriza ações principais."
          onChange={(event) =>
            void onUpdatePreferences({
              simpleMode: event.target.checked,
            })
          }
        />

        <ToggleField
          checked={preferences.reduceMotion}
          label="Reduzir animações"
          description="Diminui movimentos visuais na interface."
          onChange={(event) =>
            void onUpdatePreferences({
              reduceMotion: event.target.checked,
            })
          }
        />

        <ToggleField
          checked={preferences.increasedSpacing}
          label="Espaçamento maior"
          description="Aumenta os espaços entre elementos para facilitar a leitura."
          onChange={(event) =>
            void onUpdatePreferences({
              increasedSpacing: event.target.checked,
            })
          }
        />
      </div>
    </Card>
  );
}
