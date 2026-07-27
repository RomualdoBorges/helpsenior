import { useEffect, useState, type FormEvent } from "react";

import {
  Alert,
  Badge,
  Button,
  FormField,
  Input,
  Textarea,
} from "../../../shared/ui";
import type { Activity } from "@helpsenior/core";

interface Step {
  order: number;
  description: string;
}

interface NecessaryResources {
  description: string;
}

interface CreateActivityInput {
  title: string;
  steps: Step[];
  description?: string;
  resources?: NecessaryResources[];
}

interface UpdateActivityInput extends CreateActivityInput {
  activityId: string;
}

interface CreateActivityFormProps {
  isCreating: boolean;
  onCreateActivity: (input: CreateActivityInput) => Promise<void>;

  activity: Activity | null;
  isUpdating: boolean;
  onUpdateActivity: (input: UpdateActivityInput) => Promise<void>;
}

export function CreateActivityForm({
  isCreating,
  onCreateActivity,
  activity,
  onUpdateActivity,
}: CreateActivityFormProps) {
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ order: 1, description: "" }]);
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState<NecessaryResources[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setSteps([{ order: 1, description: "" }]);
    setResources([]);
    setLocalError(null);
  }

  function handleStep(step: Step, description: string) {
    const updatedSteps = steps.map((s) => {
      if (s.order === step.order) {
        return { ...s, description };
      }
      return s;
    });

    setSteps(updatedSteps);
  }

  function handleAddStep(steps: Step[]) {
    const newStep: Step = {
      order: steps.length + 1,
      description: "",
    };

    setSteps([...steps, newStep]);
  }

  function handleRemoveStep(stepOrder: number) {
    steps.splice(stepOrder - 1, 1);
    const filteredSteps: Step[] = steps.map((step) => {
      if (step.order > stepOrder) {
        step.order = step.order - 1;
      }

      return step;
    });

    setSteps(filteredSteps);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const filteredSteps = steps.filter((step) => step.description);

    event.preventDefault();

    setLocalError(null);

    if (!title.trim()) {
      setLocalError("Informe o título da atividade.");
      return;
    }

    if (filteredSteps.length <= 0) {
      setLocalError("A atividade deve ter pelo menos um passo.");
      return;
    }

    if (activity) {
      await onUpdateActivity({
        activityId: activity.id,
        title: title.trim(),
        steps: filteredSteps,
        description: description.trim() || undefined,
        resources: resources,
      });
    } else {
      await onCreateActivity({
        title: title.trim(),
        steps: filteredSteps,
        description: description.trim() || undefined,
        resources: resources,
      });
    }

    resetForm();
  }

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setSteps(activity.steps);
      setLocalError(null);

      if (activity.description) setDescription(activity.description);

      if (activity.resources) setResources([]);
    }
  }, [activity]);

  return (
    <form onSubmit={handleSubmit} className="create-form mt-2">
      {!activity ? (
        <>
          <h3 className="activity-form-title m-0 text-xl font-bold text-violet-700">
            Criar Guia
          </h3>

          <p className="simple-mode-secondary mt-1 text-sm font-bold text-slate-500">
            Use Atividades para registrar etapas guiadas para suas difculdades
            do dia a dia. Como usar aquele aplicativo? Como era mesmo aquela
            receita? Faça seu manual pessoal para cosultar quando quiser.
          </p>
        </>
      ) : (
        <>
          <h3 className="activity-form-title m-0 text-xl font-bold text-violet-700">
            Atualizar atividade
          </h3>

          <p className="simple-mode-secondary mt-1 text-sm font-bold text-slate-500">
            Atualize os campos que achar necessáriro e avance
          </p>
        </>
      )}

      <div className="mt-4 grid gap-4">
        <FormField label="Título">
          <Input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Pagar conta de luz"
            required
          />
        </FormField>

        <FormField label="Descrição">
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Pagar a conta antes do vencimento"
          />
        </FormField>

        <div>
          {steps.map((step) => {
            return (
              <div key={step.order}>
                <FormField label={`Passo ${step.order}`}>
                  <Input
                    type="text"
                    value={step.description}
                    onChange={(event) => handleStep(step, event.target.value)}
                  />
                </FormField>
                {steps.length > 1 && (
                  <div
                    className="mt-2 text-center cursor-pointer"
                    onClick={() => handleRemoveStep(step.order)}>
                    <Badge tone="red" className="mt-2">
                      remover
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={() => handleAddStep(steps)}
          disabled={!steps[steps.length - 1].description}
          variant="secondary"
          className="mt-2">
          Adicionar mais uma etapa
        </Button>

        {localError && <Alert tone="error">{localError}</Alert>}
      </div>

      <Button
        type="submit"
        disabled={isCreating}
        size="lg"
        className="activities-primary-action mt-4 mb-4 w-full">
        {activity ? "Atualizar atividade" : "Criar atividade"}
      </Button>
    </form>
  );
}
