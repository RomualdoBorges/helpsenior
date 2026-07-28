import { expect, test } from "@playwright/test";

test.describe("autenticação", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Entrar na conta" }),
    ).toBeVisible();
  });

  test("alterna entre login e criação de conta", async ({ page }) => {
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(
      page.getByRole("heading", { name: "Criar conta" }),
    ).toBeVisible();
    await expect(page.getByLabel("Nome completo")).toBeVisible();
    await expect(page.getByLabel("Confirmar senha")).toBeVisible();

    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(
      page.getByRole("heading", { name: "Entrar na conta" }),
    ).toBeVisible();
    await expect(page.getByLabel("Nome completo")).not.toBeVisible();
  });

  test("valida senhas diferentes sem acessar o Firebase", async ({ page }) => {
    await page.getByRole("button", { name: "Criar conta" }).click();
    await page.getByLabel("Nome completo").fill("Maria Silva");
    await page.getByLabel("E-mail").fill("maria@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("senha123");
    await page.getByLabel("Confirmar senha").fill("outraSenha");
    await page
      .locator('form button[type="submit"]')
      .filter({ hasText: "Criar conta" })
      .click();

    await expect(page.getByText("As senhas não conferem.")).toBeVisible();
  });

  test("abre a recuperação de senha e volta ao login", async ({ page }) => {
    await page.getByRole("button", { name: "Esqueci minha senha" }).click();

    await expect(
      page.getByRole("heading", { name: "Recuperar senha" }),
    ).toBeVisible();
    await expect(page.getByLabel("Senha")).not.toBeVisible();

    await page
      .getByRole("button", { name: "Voltar para o login" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Entrar na conta" }),
    ).toBeVisible();
  });
});
