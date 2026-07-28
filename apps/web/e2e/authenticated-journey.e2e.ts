import { expect, test } from "@playwright/test";

test.describe("jornada autenticada com Firebase Emulator", () => {
  test("persiste atividade, tarefa, lembrete e preferência após novo login", async ({
    page,
  }) => {
    const uniqueId = `${Date.now()}-${test.info().workerIndex}`;
    const email = `maria-${uniqueId}@example.com`;
    const password = "senha123";

    await page.goto("/");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await page.getByLabel("Nome completo").fill("Maria Silva");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByLabel("Confirmar senha").fill(password);
    await page
      .locator('form button[type="submit"]')
      .filter({ hasText: "Criar conta" })
      .click();

    await expect(
      page.getByRole("button", { name: /Abrir opções da conta/ }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: "Atividades", exact: true })
      .click();
    await page.getByRole("button", { name: "Nova atividade" }).click();
    await page.getByLabel("Título").fill("Preparar documentos");
    await page
      .getByLabel("Descrição")
      .fill("Guia para organizar documentos importantes");
    await page.getByLabel("Passo 1").fill("Separar documento com foto");
    await page
      .getByRole("button", { name: "Adicionar mais uma etapa" })
      .click();
    await page.getByLabel("Passo 2").fill("Guardar os documentos na pasta");
    await page.getByRole("button", { name: "Criar atividade" }).click();

    await expect(page.getByText("Preparar documentos")).toBeVisible();

    await page.getByRole("link", { name: "Tarefas", exact: true }).click();
    await page.getByRole("button", { name: "Nova tarefa" }).click();
    await page.getByLabel("Título").fill("Ir ao banco");
    await page
      .getByLabel("Atividade (opcional)")
      .selectOption({ label: "Preparar documentos" });
    await page.getByRole("button", { name: "Criar tarefa" }).click();

    await expect(page.getByText("Ir ao banco")).toBeVisible();
    await expect(
      page.getByRole("region", {
        name: "Atividade anexada: Preparar documentos",
      }),
    ).toBeVisible();
    await expect(page.getByText("Separar documento com foto")).toBeVisible();

    await page
      .getByRole("link", { name: "Lembretes", exact: true })
      .click();
    await page.getByRole("button", { name: "Novo lembrete" }).click();
    await page.getByLabel("Título").fill("Levar documentos");
    await page.getByLabel("Data").fill("2099-12-31");
    await page.getByLabel("Horário").fill("09:00");
    await page.getByRole("button", { name: "Criar lembrete" }).click();

    await expect(page.getByText("Levar documentos")).toBeVisible();

    await page.goto("/configuracoes");
    const reduceMotionToggle = page.getByRole("checkbox", {
      name: /Reduzir animações/,
    });
    await reduceMotionToggle.check();
    await expect(reduceMotionToggle).toBeChecked();
    await expect(page.locator("html")).toHaveClass(/reduce-motion/);

    await page
      .getByRole("button", { name: /Abrir opções da conta/ })
      .click();
    await page.getByRole("menuitem", { name: "Sair" }).click();
    await expect(
      page.getByRole("heading", { name: "Entrar na conta" }),
    ).toBeVisible();

    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page
      .locator('form button[type="submit"]')
      .filter({ hasText: "Entrar" })
      .click();
    await expect(
      page.getByRole("button", { name: /Abrir opções da conta/ }),
    ).toBeVisible();

    await page.goto("/configuracoes");
    await expect(
      page.getByRole("checkbox", { name: /Reduzir animações/ }),
    ).toBeChecked();
    await expect(page.locator("html")).toHaveClass(/reduce-motion/);

    await page.goto("/atividades");
    await expect(page.getByText("Preparar documentos")).toBeVisible();

    await page.goto("/tarefas");
    await expect(page.getByText("Ir ao banco")).toBeVisible();
    await expect(
      page.getByRole("region", {
        name: "Atividade anexada: Preparar documentos",
      }),
    ).toBeVisible();

    await page.goto("/lembretes");
    await expect(page.getByText("Levar documentos")).toBeVisible();
  });
});
