import type {
  ContrastPreference,
  FontSizePreference,
  UserPreferences,
} from "@helpsenior/core";

import {
  Alert,
  FormField,
  PageHeader,
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
        className="mx-auto mt-8 w-full max-w-7xl"
        aria-labelledby="preferences-title"
      >
        <PageHeader
          titleId="preferences-title"
          title="Preferências de acessibilidade"
        />

        <p className="mt-4 text-slate-600">Carregando preferências...</p>
      </section>
    );
  }

  if (!preferences) {
    return (
      <section
        className="mx-auto mt-8 w-full max-w-7xl"
        aria-labelledby="preferences-title"
      >
        <PageHeader
          titleId="preferences-title"
          title="Preferências de acessibilidade"
        />

        <p className="mt-4 text-slate-600">Preferências não encontradas.</p>
      </section>
    );
  }

  return (
    <section
      className="mx-auto mt-8 w-full max-w-7xl"
      aria-labelledby="preferences-title"
    >
      <PageHeader
        titleId="preferences-title"
        title="Preferências de acessibilidade"
        description="Ajuste a experiência visual para deixar o HelpSenior mais confortável e fácil de usar."
        action={
          isUpdating ? (
            <span className="text-sm font-bold text-slate-500">Salvando...</span>
          ) : null
        }
      />

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
    </section>
  );
}
