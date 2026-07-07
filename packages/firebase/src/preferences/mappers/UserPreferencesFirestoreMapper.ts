import type { UserPreferences } from "@helpsenior/core";
import { Timestamp } from "firebase/firestore";

interface FirestoreUserPreferences {
  userId: string;
  fontSize: UserPreferences["fontSize"];
  contrast: UserPreferences["contrast"];
  simpleMode: boolean;
  reduceMotion: boolean;
  increasedSpacing: boolean;
  updatedAt: Timestamp;
}

export class UserPreferencesFirestoreMapper {
  static toFirestore(preferences: UserPreferences): FirestoreUserPreferences {
    return {
      userId: preferences.userId,
      fontSize: preferences.fontSize,
      contrast: preferences.contrast,
      simpleMode: preferences.simpleMode,
      reduceMotion: preferences.reduceMotion,
      increasedSpacing: preferences.increasedSpacing,
      updatedAt: Timestamp.fromDate(preferences.updatedAt),
    };
  }

  static fromFirestore(data: FirestoreUserPreferences): UserPreferences {
    return {
      userId: data.userId,
      fontSize: data.fontSize,
      contrast: data.contrast,
      simpleMode: data.simpleMode,
      reduceMotion: data.reduceMotion,
      increasedSpacing: data.increasedSpacing,
      updatedAt: data.updatedAt.toDate(),
    };
  }
}
