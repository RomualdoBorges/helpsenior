import { useState, type SyntheticEvent } from "react";

interface TaskStepFormData {
  title: string;
}

interface CreateTaskFormProps {
  isCreating: boolean;
  onCreateTask: (title: string, steps: TaskStepFormData[]) => Promise<void>;
}

export function CreateTaskForm({
  isCreating,
  onCreateTask,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<TaskStepFormData[]>([]);
  const [stepTitle, setStepTitle] = useState("");

  function handleAddStep() {
    const trimmedStepTitle = stepTitle.trim();

    if (!trimmedStepTitle) {
      return;
    }

    setSteps((currentSteps) => [
      ...currentSteps,
      {
        title: trimmedStepTitle,
      },
    ]);

    setStepTitle("");
  }

  function handleRemoveStep(stepIndex: number) {
    setSteps((currentSteps) =>
      currentSteps.filter((_, index) => index !== stepIndex),
    );
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    await onCreateTask(trimmedTitle, steps);

    setTitle("");
    setSteps([]);
    setStepTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex: Tomar remédio"
          aria-label="Título da tarefa"
          className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-base text-slate-950 placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={isCreating || !title.trim()}
          className="min-h-12 rounded-xl border-0 bg-slate-950 px-5 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {isCreating ? "Criando..." : "Criar tarefa"}
        </button>
      </div>

      <div className="task-steps-box rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <label
          htmlFor="task-step-title"
          className="mb-2 block font-bold text-slate-950">
          Etapas guiadas
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="task-step-title"
            type="text"
            value={stepTitle}
            onChange={(event) => setStepTitle(event.target.value)}
            placeholder="Ex: Pegar o remédio"
            aria-label="Título da etapa"
            className="min-h-11 flex-1 rounded-[10px] border border-slate-300 px-3.5 text-[15px] text-slate-950 placeholder:text-slate-400"
          />

          <button
            type="button"
            className="add-step-button min-h-11 rounded-[10px] border border-slate-300 bg-white px-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleAddStep}
            disabled={!stepTitle.trim()}>
            Adicionar etapa
          </button>
        </div>

        {steps.length > 0 && (
          <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5">
            {steps.map((step, index) => (
              <li key={`${step.title}-${index}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-700">{step.title}</span>

                  <button
                    type="button"
                    onClick={() => handleRemoveStep(index)}
                    className="border-0 bg-transparent font-bold text-red-700">
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </form>
  );
}
