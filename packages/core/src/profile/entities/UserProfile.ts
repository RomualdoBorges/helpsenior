export interface UserProfile {
  userId: string;
  name: string;
  email: string | null;
  phone?: string;
  birthDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createDefaultUserProfile(input: {
  userId: string;
  email: string | null;
}): UserProfile {
  const now = new Date();

  return {
    userId: input.userId,
    name: "",
    email: input.email,
    createdAt: now,
    updatedAt: now,
  };
}
