import type { Activity } from "@helpsenior/core";
import { describe, expect, it } from "vitest";
import { filterActivities } from "./filterActivities";
import {
  sortActivitiesOldest,
  sortActivitiesRecent,
} from "./sortActivities";

function createActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity-1",
    userId: "user-1",
    title: "Atividade",
    steps: [],
    createdAt: new Date("2026-01-01T10:00:00"),
    updatedAt: new Date("2026-01-01T10:00:00"),
    ...overrides,
  };
}

describe("filterActivities", () => {
  const activities = [
    createActivity({
      id: "medicine",
      title: "Organizar remédios",
      description: "Separar os comprimidos da semana",
      steps: [{ order: 1, description: "Conferir as receitas" }],
    }),
    createActivity({
      id: "walk",
      title: "Caminhada",
      description: "Passeio no parque",
    }),
  ];

  it("mantém todas as atividades para busca vazia ou all", () => {
    expect(filterActivities(activities, "   ")).toBe(activities);
    expect(filterActivities(activities, "ALL")).toBe(activities);
  });

  it.each([
    ["REMÉDIOS", "medicine"],
    ["comprimidos", "medicine"],
    ["receitas", "medicine"],
    ["parque", "walk"],
  ])("busca %s no título, descrição ou etapas", (term, expectedId) => {
    expect(
      filterActivities(activities, term).map((activity) => activity.id),
    ).toEqual([expectedId]);
  });

  it("não duplica uma atividade que corresponde em mais de um campo", () => {
    const repeatedTerm = createActivity({
      id: "repeated",
      title: "Consulta médica",
      description: "Preparar consulta",
      steps: [{ order: 1, description: "Confirmar consulta" }],
    });

    expect(filterActivities([repeatedTerm], "consulta")).toEqual([
      repeatedTerm,
    ]);
  });
});

describe("activity sorting", () => {
  const older = createActivity({
    id: "older",
    updatedAt: new Date("2026-01-01T10:00:00"),
  });
  const newer = createActivity({
    id: "newer",
    updatedAt: new Date("2026-01-02T10:00:00"),
  });

  it("ordena da atividade mais recente para a mais antiga", () => {
    expect(
      sortActivitiesRecent([older, newer]).map((activity) => activity.id),
    ).toEqual(["newer", "older"]);
  });

  it("ordena da atividade mais antiga para a mais recente", () => {
    expect(
      sortActivitiesOldest([newer, older]).map((activity) => activity.id),
    ).toEqual(["older", "newer"]);
  });
});
