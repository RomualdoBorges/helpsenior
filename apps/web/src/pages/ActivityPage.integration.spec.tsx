import type { Activity } from "@helpsenior/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ActivityPage } from "./ActivityPage";

const activityPageMocks = vi.hoisted(() => ({
  createActivity: vi.fn(),
  deleteActivity: vi.fn(),
  updateActivity: vi.fn(),
}));

const activities: Activity[] = [
  {
    id: "medicine-activity",
    userId: "user-1",
    title: "Organizar remédios",
    description: "Separar os comprimidos da semana",
    steps: [{ order: 1, description: "Conferir as receitas" }],
    createdAt: new Date("2026-07-01T10:00:00"),
    updatedAt: new Date("2026-07-01T10:00:00"),
  },
  {
    id: "coffee-activity",
    userId: "user-1",
    title: "Preparar café",
    steps: [{ order: 1, description: "Aquecer a água" }],
    createdAt: new Date("2026-07-02T10:00:00"),
    updatedAt: new Date("2026-07-02T10:00:00"),
  },
];

vi.mock("../features/activities/hooks/useActivities", () => ({
  useActivities: () => ({
    activities,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    createActivity: activityPageMocks.createActivity,
    updateActivity: activityPageMocks.updateActivity,
    deleteActivity: activityPageMocks.deleteActivity,
  }),
}));

function renderActivityPage() {
  return render(
    <MemoryRouter>
      <ActivityPage user={{ id: "user-1" }} />
    </MemoryRouter>,
  );
}

describe("ActivityPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activityPageMocks.createActivity.mockResolvedValue(undefined);
    activityPageMocks.deleteActivity.mockResolvedValue(undefined);
    activityPageMocks.updateActivity.mockResolvedValue(undefined);
  });

  it("abre o formulário, cria uma atividade e volta à lista", async () => {
    const user = userEvent.setup();
    renderActivityPage();

    await user.click(screen.getByRole("button", { name: "Nova atividade" }));
    await user.type(screen.getByLabelText("Título"), "Fazer uma ligação");
    await user.type(screen.getByLabelText("Passo 1"), "Abrir os contatos");
    await user.click(
      screen.getByRole("button", { name: "Criar atividade" }),
    );

    expect(activityPageMocks.createActivity).toHaveBeenCalledWith({
      title: "Fazer uma ligação",
      description: undefined,
      steps: [{ order: 1, description: "Abrir os contatos" }],
      resources: [],
    });
    expect(
      screen.getByRole("heading", { name: "Minhas atividades" }),
    ).toBeInTheDocument();
  });

  it("busca atividades pelo conteúdo", async () => {
    const user = userEvent.setup();
    renderActivityPage();

    await user.type(screen.getByLabelText("Buscar atividades"), "remédios");

    expect(screen.getByText("Organizar remédios")).toBeInTheDocument();
    expect(screen.queryByText("Preparar café")).not.toBeInTheDocument();
    expect(screen.getByText("1 de 2 atividades")).toBeInTheDocument();
  });

  it("edita uma atividade após confirmação", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderActivityPage();

    await user.click(
      screen.getByRole("button", {
        name: "Editar atividade Organizar remédios",
      }),
    );
    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "Organizar medicamentos");
    await user.click(
      screen.getByRole("button", { name: "Atualizar atividade" }),
    );

    expect(confirmSpy).toHaveBeenCalledWith(
      'Deseja atualizar a atividade "Organizar medicamentos"?',
    );
    expect(activityPageMocks.updateActivity).toHaveBeenCalledWith({
      activityId: "medicine-activity",
      title: "Organizar medicamentos",
      description: "Separar os comprimidos da semana",
      steps: [{ order: 1, description: "Conferir as receitas" }],
      resources: [],
    });

    confirmSpy.mockRestore();
  });

  it("exclui uma atividade após confirmação", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderActivityPage();

    await user.click(
      screen.getByRole("button", {
        name: "Excluir atividade Preparar café",
      }),
    );

    expect(confirmSpy).toHaveBeenCalledWith(
      'Deseja excluir a atividade "Preparar café"?',
    );
    expect(activityPageMocks.deleteActivity).toHaveBeenCalledWith(
      "coffee-activity",
    );

    confirmSpy.mockRestore();
  });
});
