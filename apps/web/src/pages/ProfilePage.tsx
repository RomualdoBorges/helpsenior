import type { UserProfile } from "@helpsenior/core";

import { UserProfileForm } from "../features/profile/components/UserProfileForm";

interface ProfilePageProps {
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  isUpdatingProfile: boolean;
  profileError: string | null;
  updateProfile: (input: {
    name?: string;
    phone?: string;
    birthDate?: string;
  }) => Promise<void>;
}

export function ProfilePage({
  profile,
  isLoadingProfile,
  isUpdatingProfile,
  profileError,
  updateProfile,
}: ProfilePageProps) {
  return (
    <UserProfileForm
      profile={profile}
      isLoading={isLoadingProfile}
      isUpdating={isUpdatingProfile}
      error={profileError}
      onUpdateProfile={updateProfile}
    />
  );
}
