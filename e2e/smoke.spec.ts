import { test, expect } from "@playwright/test";

// Demo script smoke: each feature appends its step here.
test("home greets Abed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Bonjour Abed")).toBeVisible();
});

test("formatFCFA uses narrow no-break thousands", async () => {
  const { formatFCFA } = await import("../lib/format");
  expect(formatFCFA(125500)).toBe("125\u202f500\u00a0FCFA");
  expect(formatFCFA(500)).toBe("500\u00a0FCFA");
});

test("F01: login splash → Continuer → home", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Continuer" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /Bonjour Abed/ })).toBeVisible();
});

test("F01: mobile bottom nav reaches all tabs, back works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const nav = page.locator("nav").filter({ hasText: "Accueil" }).last();
  for (const [label, path] of [["Explorer", "/explore"], ["Activité", "/activity"], ["Wallet", "/wallet"], ["Compte", "/account"]] as const) {
    await nav.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/wallet$/);
});

test("F01: desktop sidebar + top bar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const sidebar = page.locator("aside");
  await expect(sidebar).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Recherche globale" })).toBeVisible();
  await sidebar.getByRole("link", { name: "Activité" }).click();
  await expect(page).toHaveURL(/\/activity$/);
  await sidebar.getByRole("link", { name: "Compte" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/activity$/);
});

test("F01: account shows profile and resets the demo", async ({ page }) => {
  await page.goto("/account");
  await expect(page.getByText("Abed-Négo")).toBeVisible();
  await expect(page.getByText("Utilisateur Gold")).toBeVisible();
  await expect(page.getByText("+229 97 12 34 56")).toBeVisible();
  await page.evaluate(() => {
    const k = "gozem-demo";
    const s = JSON.parse(localStorage.getItem(k)!);
    s.state.wallet.balance = 1000;
    s.state.points.total = 10;
    localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
  await expect(page.getByText("1 000 FCFA")).toBeVisible();
  await page.getByRole("button", { name: "Réinitialiser la démo" }).click();
  await expect(page.getByText("Démo réinitialisée ✓")).toBeVisible();
  await expect(page.getByText("125 500 FCFA").first()).toBeVisible();
  await expect(page.getByText("2 450 pts").first()).toBeVisible();
});

test("F10/F11: wallet balance, transfer 10 000 to Koffi A.", async ({ page }) => {
  await page.goto("/wallet");
  await expect(page.getByTestId("wallet-balance")).toContainText(/\d/);
  await page.getByRole("link", { name: "Envoyer" }).click();
  await page.getByRole("textbox", { name: "Numéro du destinataire" }).fill("+229 96 11 22 33");
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("textbox", { name: "Montant (FCFA)" }).fill("10000");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByText(/^Envoyer 10\s000\sFCFA à Koffi A\.$/)).toBeVisible();
});
