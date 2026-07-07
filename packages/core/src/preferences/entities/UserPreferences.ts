export type FontSizePreference = "small" | "medium" | "large" | "extra_large";

export type ContrastPreference = "default" | "high";

export interface UserPreferences {
  userId: string;
  fontSize: FontSizePreference;
  contrast: ContrastPreference;
  simpleMode: boolean;
  reduceMotion: boolean;
  increasedSpacing: boolean;
  updatedAt: Date;
}

export function createDefaultUserPreferences(userId: string): UserPreferences {
  const now = new Date();

  return {
    userId,
    fontSize: "medium",
    contrast: "default",
    simpleMode: false,
    reduceMotion: false,
    increasedSpacing: false,
    updatedAt: now,
  };
}
