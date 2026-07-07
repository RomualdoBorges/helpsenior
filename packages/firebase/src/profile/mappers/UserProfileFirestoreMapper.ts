import type { UserProfile } from "@helpsenior/core";
import { Timestamp } from "firebase/firestore";

interface FirestoreUserProfile {
  userId: string;
  name: string;
  email: string | null;
  phone?: string;
  birthDate?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class UserProfileFirestoreMapper {
  static toFirestore(profile: UserProfile): FirestoreUserProfile {
    const firestoreProfile: FirestoreUserProfile = {
      userId: profile.userId,
      name: profile.name,
      email: profile.email,
      createdAt: Timestamp.fromDate(profile.createdAt),
      updatedAt: Timestamp.fromDate(profile.updatedAt),
    };

    if (profile.phone) {
      firestoreProfile.phone = profile.phone;
    }

    if (profile.birthDate) {
      firestoreProfile.birthDate = profile.birthDate;
    }

    return firestoreProfile;
  }

  static fromFirestore(data: FirestoreUserProfile): UserProfile {
    return {
      userId: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }
}
