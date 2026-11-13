import { defineConfig, devices } from "@playwright/test";

// E2E da conexão front <-> back, rodando contra o ambiente PUBLICADO
// (Vercel -> Render) — valida o round-trip real, com CORS e tudo.
// Sobrescreva com E2E_BASE_URL para apontar para outro alvo, ex.:
//   E2E_BASE_URL=http://localhost:3000 npx playwright test   (dev local)
const BASE_URL =
  process.env.E2E_BASE_URL ?? "https://frontend-iota-nine-81.vercel.app";

export default defineConfig({
  testDir: "./e2e",
  // O Render free "dorme" após inatividade; o cold start pode levar ~50s.
  timeout: 120_000,
  expect: { timeout: 20_000 },
  // 1 retry cobre um cold start pontual do backend na primeira tentativa.
  retries: 1,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
