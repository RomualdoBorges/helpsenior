import { useState, type FormEvent } from "react";

interface CreateTaskInput {
  title: string;
  description?: string;
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
  const [localError, setLocalError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setLocalError(null);
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
      date: date || undefined,
    });

    resetForm();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="m-0 text-xl font-bold text-slate-950">Criar tarefa</h3>

      <p className="mt-1 text-sm font-bold text-slate-500">
        Use tarefas para registrar o que precisa ser feito. Para avisos,
        horários e repetição, use a área de lembretes.
      </p>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="font-bold text-slate-700">Título</span>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Pagar conta de luz"
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="font-bold text-slate-700">Descrição</span>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Pagar a conta antes do vencimento"
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

        {localError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
            {localError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isCreating}
        className="mt-4 min-h-12 rounded-xl bg-slate-950 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {isCreating ? "Criando tarefa..." : "Criar tarefa"}
      </button>
    </form>
  );
}
