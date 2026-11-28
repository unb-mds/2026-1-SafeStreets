import { test, expect } from "@playwright/test";

/**
 * E2E da conexão front <-> back.
 *
 * Sobe um navegador REAL, carrega o site publicado (Vercel) e verifica que ele
 * consome o backend (Render) de verdade — o round-trip HTTP completo, com o
 * CORS liberando a resposta. Diferente dos testes de contrato (que mockam o
 * limite), aqui os dois lados conversam de verdade.
 */
test.describe("Conexão front <-> back (E2E)", () => {
  test("a home dispara a chamada à API de ocorrências e recebe 200 + dados", async ({
    page,
  }) => {
    // Espera a requisição REAL que o front faz ao backend ao carregar a home.
    const respostaOcorrencias = page.waitForResponse(
      (r) => r.url().includes("/ocorrencias") && r.request().method() === "GET",
      { timeout: 100_000 }, // cold start do Render free
    );

    await page.goto("/");
    const resp = await respostaOcorrencias;

    // Conexão OK: status 200 e o contrato { data: [...] } — CORS não bloqueou.
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("o mapa carrega sem erro de conexão/CORS", async ({ page }) => {
    const errosConsole: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errosConsole.push(msg.text());
    });

    await page.goto("/mapa");
    await expect(page.locator("body")).toBeVisible();

    // Nenhum erro de CORS no console (o sinal clássico de front <-> back quebrado).
    const errosCors = errosConsole.filter((t) => /cors/i.test(t));
    expect(errosCors, `erros de CORS: ${errosCors.join(" | ")}`).toHaveLength(0);
  });
});
