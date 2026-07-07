import { useState } from "react";

import type { ReminderRecurrence } from "@helpsenior/core";

interface CreateReminderFormProps {
  isCreating: boolean;
  onCreateReminder: (input: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    recurrence?: ReminderRecurrence;
    recurrenceEndDate?: string;
  }) => Promise<void>;
}

export function CreateReminderForm({
  isCreating,
  onCreateReminder,
}: CreateReminderFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreateReminder({
      title,
      description: description.trim() ? description : undefined,
      date,
      time: time.trim() ? time : undefined,
      recurrence,
      recurrenceEndDate:
        recurrence !== "none" && recurrenceEndDate.trim()
          ? recurrenceEndDate
          : undefined,
    });

    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setRecurrence("none");
    setRecurrenceEndDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="m-0 text-xl font-bold text-slate-950">Criar lembrete</h3>

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
            placeholder="Ex: Tomar o remédio da pressão com água"
            className="min-h-24 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-slate-950"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-bold text-slate-700">Data</span>

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="font-bold text-slate-700">Horário</span>

            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-bold text-slate-700">Recorrência</span>

            <select
              value={recurrence}
              onChange={(event) =>
                setRecurrence(event.target.value as ReminderRecurrence)
              }
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950">
              <option value="none">Nenhuma recorrência</option>
              <option value="daily">Todos os dias</option>
              <option value="weekly">Toda semana</option>
              <option value="monthly">Todo mês</option>
            </select>
          </label>

          {recurrence !== "none" && (
            <label className="grid gap-2">
              <span className="font-bold text-slate-700">
                Data final da recorrência
              </span>

              <input
                type="date"
                value={recurrenceEndDate}
                onChange={(event) => setRecurrenceEndDate(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
              />
            </label>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isCreating}
        className="mt-4 min-h-12 rounded-xl bg-slate-950 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {isCreating ? "Criando lembrete..." : "Criar lembrete"}
      </button>
    </form>
  );
}
