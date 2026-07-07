import { useEffect, useState, type SyntheticEvent } from "react";

import type { UserProfile } from "@helpsenior/core";

interface UserProfileFormProps {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  onUpdateProfile: (input: {
    name?: string;
    phone?: string;
    birthDate?: string;
  }) => Promise<void>;
}

export function UserProfileForm({
  profile,
  isLoading,
  isUpdating,
  error,
  onUpdateProfile,
}: UserProfileFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.name);
    setPhone(profile.phone ?? "");
    setBirthDate(profile.birthDate ?? "");
  }, [profile]);

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    await onUpdateProfile({
      name: name.trim(),
      phone: phone.trim() || undefined,
      birthDate: birthDate || undefined,
    });
  }

  if (isLoading) {
    return (
      <section
        className="app-card mt-8 rounded-[20px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)]"
        aria-labelledby="profile-title">
        <h2 id="profile-title" className="m-0 text-[28px] font-bold">
          Meu perfil
        </h2>

        <p className="mt-4 text-slate-600">Carregando perfil...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section
        className="app-card mt-8 rounded-[20px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)]"
        aria-labelledby="profile-title">
        <h2 id="profile-title" className="m-0 text-[28px] font-bold">
          Meu perfil
        </h2>

        <p className="mt-4 text-slate-600">Perfil não encontrado.</p>
      </section>
    );
  }

  return (
    <section
      className="app-card mt-8 rounded-[20px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)]"
      aria-labelledby="profile-title">
      <div>
        <h2 id="profile-title" className="m-0 text-[28px] font-bold">
          Meu perfil
        </h2>

        <p className="mt-2 text-base leading-6 text-slate-500">
          Atualize seus dados básicos para personalizar sua experiência no
          HelpSenior.
        </p>
      </div>

      {error && <p className="mt-4 font-bold text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2 font-bold text-slate-950">
          <span>Nome</span>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
            className="min-h-12 rounded-xl border border-slate-300 px-4 text-base font-normal text-slate-950 placeholder:text-slate-400"
          />
        </label>

        <label className="flex flex-col gap-2 font-bold text-slate-950">
          <span>E-mail</span>

          <input
            type="email"
            value={profile.email ?? ""}
            disabled
            className="min-h-12 rounded-xl border border-slate-300 bg-slate-100 px-4 text-base font-normal text-slate-500"
          />
        </label>

        <label className="flex flex-col gap-2 font-bold text-slate-950">
          <span>Telefone</span>

          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Ex: (11) 99999-9999"
            autoComplete="tel"
            className="min-h-12 rounded-xl border border-slate-300 px-4 text-base font-normal text-slate-950 placeholder:text-slate-400"
          />
        </label>

        <label className="flex flex-col gap-2 font-bold text-slate-950">
          <span>Data de nascimento</span>

          <input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className="min-h-12 rounded-xl border border-slate-300 px-4 text-base font-normal text-slate-950"
          />
        </label>

        <button
          type="submit"
          disabled={isUpdating}
          className="min-h-12 rounded-xl border-0 bg-slate-950 px-5 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {isUpdating ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </section>
  );
}
