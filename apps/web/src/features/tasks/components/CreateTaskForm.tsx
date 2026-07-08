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
    <section className="app-card rounded-[24px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42_/_0.08)]">
      <div>
        <p className="m-0 text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
          Nova tarefa
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          O que você precisa fazer?
        </h2>

        <p className="mt-2 text-base leading-6 text-slate-500">
          Crie uma tarefa simples ou adicione etapas para acompanhar o passo a
          passo. Para avisos e repetição, use a área de lembretes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <label className="grid gap-2">
          <span className="font-bold text-slate-700">Título da tarefa</span>

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
          <span className="font-bold text-slate-700">Descrição opcional</span>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Tomar o remédio da pressão após o café."
            className="min-h-24 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-slate-950"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-bold text-slate-700">Data da tarefa</span>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
          />
        </label>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              Etapas opcionais
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Use etapas quando a tarefa precisar de um passo a passo.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-2">
              <span className="font-bold text-slate-700">
                Título da etapa
              </span>

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
                placeholder="Ex: Conferir se é o remédio correto."
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
                  className="rounded-xl border border-slate-200 bg-white p-4"
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

        <button
          type="submit"
          disabled={isCreating}
          className="min-h-12 rounded-xl bg-slate-950 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreating ? "Criando..." : "Criar tarefa"}
        </button>
      </form>
    </section>
  );
}