import { useState, type SyntheticEvent } from "react";

import type { UserProfile } from "@helpsenior/core";

import { Alert, Button, FormField, Input } from "../../../shared/ui";

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
  if (isLoading) {
    return (
      <section
        className="mx-auto mt-8 w-full max-w-6xl"
        aria-labelledby="profile-title"
      >
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
        className="mx-auto mt-8 w-full max-w-6xl"
        aria-labelledby="profile-title"
      >
        <h2 id="profile-title" className="m-0 text-[28px] font-bold">
          Meu perfil
        </h2>

        <p className="mt-4 text-slate-600">Perfil não encontrado.</p>
      </section>
    );
  }

  return (
    <UserProfileFields
      key={profile.updatedAt.getTime()}
      profile={profile}
      isUpdating={isUpdating}
      error={error}
      onUpdateProfile={onUpdateProfile}
    />
  );
}

interface UserProfileFieldsProps {
  profile: UserProfile;
  isUpdating: boolean;
  error: string | null;
  onUpdateProfile: UserProfileFormProps["onUpdateProfile"];
}

function UserProfileFields({
  profile,
  isUpdating,
  error,
  onUpdateProfile,
}: UserProfileFieldsProps) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(formatPhone(profile.phone ?? ""));
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "");

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    await onUpdateProfile({
      name: name.trim(),
      phone: getPhoneDigits(phone) || undefined,
      birthDate: birthDate || undefined,
    });
  }

  return (
    <section
      className="mx-auto mt-8 w-full max-w-6xl"
      aria-labelledby="profile-title"
    >
      <div>
        <h2 id="profile-title" className="m-0 text-[28px] font-bold">
          Meu perfil
        </h2>

        <p className="simple-mode-secondary mt-2 text-base leading-6 text-slate-500">
          Atualize seus dados básicos para personalizar sua experiência no
          HelpSenior.
        </p>
      </div>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <FormField label="Nome">
          <Input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
          />
        </FormField>

        <FormField label="E-mail">
          <Input
            type="email"
            value={profile.email ?? ""}
            disabled
          />
        </FormField>

        <FormField label="Telefone">
          <Input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(formatPhone(event.target.value))}
            placeholder="Ex: (11) 99999-9999"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={15}
          />
        </FormField>

        <FormField label="Data de nascimento">
          <Input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
          />
        </FormField>

        <Button
          type="submit"
          disabled={isUpdating}
          size="lg">
          {isUpdating ? "Salvando..." : "Salvar perfil"}
        </Button>
      </form>
    </section>
  );
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatPhone(value: string) {
  const digits = getPhoneDigits(value);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length < 3) {
    return `(${digits}`;
  }

  const areaCode = digits.slice(0, 2);
  const phoneNumber = digits.slice(2);

  if (phoneNumber.length <= 4) {
    return `(${areaCode}) ${phoneNumber}`;
  }

  const firstPartLength = phoneNumber.length > 8 ? 5 : 4;
  const firstPart = phoneNumber.slice(0, firstPartLength);
  const secondPart = phoneNumber.slice(firstPartLength);

  return `(${areaCode}) ${firstPart}${secondPart ? `-${secondPart}` : ""}`;
}
