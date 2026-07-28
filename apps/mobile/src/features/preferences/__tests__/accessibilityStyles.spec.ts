import { describe, expect, it } from "vitest";

import {
  createDefaultUserPreferences,
  type UserPreferences,
} from "@helpsenior/core";

import { transformAccessibilityStyle } from "../accessibilityStyles";

function createPreferences(
  input: Partial<UserPreferences> = {},
): UserPreferences {
  return {
    ...createDefaultUserPreferences("user-1"),
    ...input,
  };
}

describe("transformAccessibilityStyle", () => {
  it("mantém o estilo sem preferências carregadas", () => {
    const style = { color: "#0F172A", fontSize: 16 };

    expect(transformAccessibilityStyle(style, null)).toBe(style);
  });

  it("aumenta fonte e altura da linha proporcionalmente", () => {
    const transformed = transformAccessibilityStyle(
      { fontSize: 16, lineHeight: 24 },
      createPreferences({ fontSize: "extra_large" }),
    );

    expect(transformed.fontSize).toBe(20);
    expect(transformed.lineHeight).toBe(30);
  });

  it("aumenta espaçamentos e área mínima de toque", () => {
    const transformed = transformAccessibilityStyle(
      { gap: 8, minHeight: 40, padding: 16 },
      createPreferences({ increasedSpacing: true }),
    );

    expect(transformed.gap).toBe(10);
    expect(transformed.padding).toBe(20);
    expect(transformed.minHeight).toBe(46);
  });

  it("remove transformações quando reduzir animações está ativo", () => {
    const transformed = transformAccessibilityStyle(
      { opacity: 0.7, transform: [{ scale: 0.99 }] },
      createPreferences({ reduceMotion: true }),
    );

    expect(transformed.transform).toBeUndefined();
    expect(transformed.opacity).toBe(0.7);
  });

  it("aplica cores de alto contraste e remove sombras", () => {
    const transformed = transformAccessibilityStyle(
      {
        color: "#0F172A",
        backgroundColor: "#FFFFFF",
        borderColor: "#CBD5E1",
        shadowOpacity: 0.2,
      },
      createPreferences({ contrast: "high" }),
    );

    expect(transformed).toMatchObject({
      color: "#FFFFFF",
      backgroundColor: "#111111",
      borderColor: "#FFFFFF",
      shadowOpacity: 0,
    });
  });
});
