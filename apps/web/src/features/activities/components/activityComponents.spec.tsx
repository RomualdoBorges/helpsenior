import type { Activity } from "@helpsenior/core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActivityList } from "./ActivityList";
import { CreateActivityForm } from "./CreateActivityForm";

function createActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity-1",
    userId: "user-1",
    title: "Preparar café",
    description: "Guia da manhã",
    steps: [
      { order: 1, description: "Separar os ingredientes" },
      { order: 2, description: "Preparar a bebida" },
    ],
    createdAt: new Date("2026-07-01T10:00:00"),
    updatedAt: new Date("2026-07-01T10:00:00"),
    ...overrides,
  };
}

describe("CreateActivityForm", () => {
  it("cria uma atividade com as etapas preenchidas", async () => {
    const user = userEvent.setup();
    const onCreateActivity = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateActivityForm
        activity={null}
        isCreating={false}
        isUpdating={false}
        onCreateActivity={onCreateActivity}
        onUpdateActivity={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Título"), "  Fazer chá  ");
    await user.type(
      screen.getByLabelText("Descrição"),
      "  Guia para o fim da tarde  ",
    );
    await user.type(screen.getByLabelText("Passo 1"), "Aquecer a água");
    await user.click(
      screen.getByRole("button", { name: "Adicionar mais uma etapa" }),
    );
    await user.type(screen.getByLabelText("Passo 2"), "Colocar o sachê");
    await user.click(
      screen.getByRole("button", { name: "Criar atividade" }),
    );

    expect(onCreateActivity).toHaveBeenCalledWith({
      title: "Fazer chá",
      description: "Guia para o fim da tarde",
      steps: [
        { order: 1, description: "Aquecer a água" },
        { order: 2, description: "Colocar o sachê" },
      ],
      resources: [],
    });
  });

  it("carrega e edita uma atividade existente", async () => {
    const user = userEvent.setup();
    const activity = createActivity();
    const onUpdateActivity = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateActivityForm
        activity={activity}
        isCreating={false}
        isUpdating={false}
        onCreateActivity={vi.fn()}
        onUpdateActivity={onUpdateActivity}
      />,
    );

    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "Preparar café coado");
    await user.clear(screen.getByLabelText("Passo 2"));
    await user.type(screen.getByLabelText("Passo 2"), "Coar o café");
    await user.click(
      screen.getByRole("button", { name: "Atualizar atividade" }),
    );

    expect(onUpdateActivity).toHaveBeenCalledWith({
      activityId: "activity-1",
      title: "Preparar café coado",
      description: "Guia da manhã",
      steps: [
        { order: 1, description: "Separar os ingredientes" },
        { order: 2, description: "Coar o café" },
      ],
      resources: [],
    });
  });

  it("remove uma etapa e reorganiza a numeração das restantes", async () => {
    const user = userEvent.setup();
    const onCreateActivity = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateActivityForm
        activity={null}
        isCreating={false}
        isUpdating={false}
        onCreateActivity={onCreateActivity}
        onUpdateActivity={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Título"), "Organizar remédios");
    await user.type(screen.getByLabelText("Passo 1"), "Conferir as caixas");
    await user.click(
      screen.getByRole("button", { name: "Adicionar mais uma etapa" }),
    );
    await user.type(screen.getByLabelText("Passo 2"), "Separar os comprimidos");
    await user.click(screen.getAllByText("Remover")[0]);

    expect(screen.getByLabelText("Passo 1")).toHaveValue(
      "Separar os comprimidos",
    );
    expect(screen.queryByLabelText("Passo 2")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Criar atividade" }),
    );

    expect(onCreateActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: [{ order: 1, description: "Separar os comprimidos" }],
      }),
    );
  });
});

describe("ActivityList", () => {
  it("exibe as etapas ordenadas pelo número", () => {
    render(
      <ActivityList
        activities={[
          createActivity({
            steps: [
              { order: 3, description: "Guardar os materiais" },
              { order: 1, description: "Separar os materiais" },
              { order: 2, description: "Executar a atividade" },
            ],
          }),
        ]}
        isLoading={false}
        isDeleting={false}
        onEditActivity={vi.fn()}
        onDeleteActivity={vi.fn()}
      />,
    );

    const list = screen.getByRole("list");
    const steps = within(list).getAllByRole("listitem");

    expect(steps[0]).toHaveTextContent("Separar os materiais");
    expect(steps[1]).toHaveTextContent("Executar a atividade");
    expect(steps[2]).toHaveTextContent("Guardar os materiais");
  });
});
