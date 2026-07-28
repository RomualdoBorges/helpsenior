import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

describe("infraestrutura de hooks", () => {
  it("renderiza e atualiza um hook React", async () => {
    const { result } = await renderHook(() => useState(0));

    await act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);
  });
});
