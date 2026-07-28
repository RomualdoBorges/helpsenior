import type { UserPreferences } from "@helpsenior/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UserPreferencesPanel } from "./UserPreferencesPanel";

const preferences: UserPreferences = {
  userId: "user-1",
  fontSize: "medium",
  contrast: "default",
  simpleMode: false,
  reduceMotion: false,
  increasedSpacing: false,
  updatedAt: new Date("2026-01-01T10:00:00"),
};

describe("UserPreferencesPanel", () => {
  it("permite ativar a redução de animações", async () => {
    const user = userEvent.setup();
    const onUpdatePreferences = vi.fn().mockResolvedValue(undefined);

    render(
      <UserPreferencesPanel
        preferences={preferences}
        isLoading={false}
        isUpdating={false}
        error={null}
        onUpdatePreferences={onUpdatePreferences}
      />,
    );

    await user.click(
      screen.getByRole("checkbox", { name: /reduzir animações/i }),
    );

    expect(onUpdatePreferences).toHaveBeenCalledWith({
      reduceMotion: true,
    });
  });
});
