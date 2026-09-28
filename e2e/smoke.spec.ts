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
  await expect(page.getByText("Bonjour Abed")).toBeVisible();
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

test("F12/F15: errands screens render", async ({ page }) => {
  await page.goto("/delivery?to=ganhi");
  await expect(page.getByLabel("Adresse de livraison")).toHaveValue("Ganhi");
  await page.goto("/gas");
  await expect(page.getByText("Votre bouteille est vide ?")).toBeVisible();
  await page.goto("/shopping");
  await expect(page.getByRole("tab", { name: "Épicerie" })).toBeVisible();
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
