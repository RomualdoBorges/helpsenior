import { useState, type FormEvent } from "react";

interface CreateTaskStepInput {
  title: string;
  description?: string;
}

interface CreateTaskInput {
  title: string;
  description?: string;
  steps: CreateTaskStepInput[];
  date?: string;
}

interface CreateTaskFormProps {
  isCreating: boolean;
  onCreateTask: (input: CreateTaskInput) => Promise<void>;
}

export function CreateTaskForm({
  isCreating,
  onCreateTask,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [steps, setSteps] = useState<CreateTaskStepInput[]>([]);
  const [stepTitle, setStepTitle] = useState("");
  const [stepDescription, setStepDescription] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setSteps([]);
    setStepTitle("");
    setStepDescription("");
    setLocalError(null);
  }

  function addStep() {
    if (!stepTitle.trim()) {
      setLocalError("Informe o título da etapa.");
      return;
    }

    setSteps((currentSteps) => [
      ...currentSteps,
      {
        title: stepTitle.trim(),
        description: stepDescription.trim() || undefined,
      },
    ]);

    setStepTitle("");
    setStepDescription("");
    setLocalError(null);
  }

  function removeStep(indexToRemove: number) {
    setSteps((currentSteps) =>
      currentSteps.filter((_, index) => index !== indexToRemove),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError(null);

    if (!title.trim()) {
      setLocalError("Informe o título da tarefa.");
      return;
    }

    await onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
      steps,
      date: date || undefined,
    });

    resetForm();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <h3 className="m-0 text-xl font-bold text-slate-950">Criar tarefa</h3>

      <p className="mt-1 text-sm font-bold text-slate-500">
        Para avisos, horários e repetição, use a área de lembretes.
      </p>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="font-bold text-slate-700">Título</span>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Tomar remédio"
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="font-bold text-slate-700">Descrição</span>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Tomar o remédio da pressão após o café"
            className="min-h-24 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-slate-950"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-bold text-slate-700">Data</span>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
          />
        </label>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <h4 className="m-0 text-lg font-bold text-slate-950">
              Etapas opcionais
            </h4>

            <p className="mt-1 text-sm font-bold text-slate-500">
              Use etapas quando quiser dividir a tarefa em passos menores.
            </p>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <span className="font-bold text-slate-700">Título da etapa</span>

              <input
                type="text"
                value={stepTitle}
                onChange={(event) => setStepTitle(event.target.value)}
                placeholder="Ex: Pegar o remédio"
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-bold text-slate-700">
                Descrição da etapa
              </span>

              <textarea
                value={stepDescription}
                onChange={(event) => setStepDescription(event.target.value)}
                placeholder="Ex: Conferir se é o remédio correto"
                className="min-h-20 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-slate-950"
              />
            </label>

            <button
              type="button"
              onClick={addStep}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-700 hover:border-slate-950 hover:text-slate-950"
            >
              Adicionar etapa
            </button>
          </div>

          {steps.length > 0 && (
            <ol className="mt-4 grid gap-3">
              {steps.map((step, index) => (
                <li
                  key={`${step.title}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">
                        {index + 1}. {step.title}
                      </p>

                      {step.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {step.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="rounded-lg px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {localError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
            {localError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isCreating}
        className="mt-4 min-h-12 rounded-xl bg-slate-950 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreating ? "Criando tarefa..." : "Criar tarefa"}
      </button>
    </form>
  );
}