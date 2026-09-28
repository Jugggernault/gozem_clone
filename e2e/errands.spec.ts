import { test, expect, type Page } from "@playwright/test";

type Stored = { state: { wallet: { balance: number }; activity: { entries: { type: string; title: string; status: string; amount: number }[] } } };
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("gozem-demo")!) as Stored);
const balance = async (page: Page) => (await stored(page)).state.wallet.balance;

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.clear());
});

test("F12: parcel delivery form → price → courier → tracking → Livré", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/delivery?to=ganhi");
  await expect(page.getByLabel("Retrait")).toHaveValue("Ma position");
  await expect(page.getByLabel("Adresse de livraison")).toHaveValue("Ganhi");
  await page.getByLabel("Nom du destinataire").fill("Aïcha Dossou");
  await page.getByLabel("Téléphone du destinataire").fill("+229 97 00 11 22");
  await expect(page.getByRole("radio", { name: /Moto/ })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("radio", { name: /Voiture/ }).click();
  await page.getByRole("radio", { name: /Moto/ }).click();
  await page.getByLabel("Description du colis").fill("Documents");
  await page.getByRole("button", { name: "Voir le prix" }).click();
  await expect(page.getByTestId("parcel-price")).toHaveText(/1\s500\s?FCFA/);
  const before = await balance(page);
  await page.getByRole("button", { name: "Commander un coursier" }).click();
  await expect(page.getByText("Coursier Jean assigné")).toBeVisible();
  await expect(page).toHaveURL(/\/delivery\/tracking$/);
  await expect(page.getByText("Colis #GZ-2841")).toBeVisible();

  const steps = page.getByTestId("timeline-step");
  await expect(steps).toHaveText([/Commande créée/, /Coursier assigné/, /Colis récupéré/, /En livraison/, /Livré/]);
  await expect(page.locator('[aria-current="step"]')).toHaveText(/En livraison/, { timeout: 10_000 });
  await expect(steps.nth(2)).toHaveAttribute("data-state", "done");
  await expect(steps.nth(4)).toHaveAttribute("data-state", "todo");
  await expect(page.getByTestId("moving-marker").or(page.getByTestId("map-fallback")).first()).toBeAttached();

  await expect(steps.nth(4)).toHaveAttribute("data-state", "done", { timeout: 20_000 });
  await expect(page.getByText("Colis livré ✓")).toBeVisible();
  expect(await balance(page)).toBe(before - 1500);
  const entry = (await stored(page)).state.activity.entries.find((e) => e.title === "Colis #GZ-2841");
  expect(entry).toMatchObject({ type: "delivery", status: "completed", amount: 1500 });
});

test("F15 AC1: gas sizes, refill vs new prices, order debits and tracks to Livré", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto("/gas");
  await expect(page.getByText("Votre bouteille est vide ?")).toBeVisible();
  for (const s of ["6 kg", "12,5 kg", "Petite bouteille"]) await expect(page.getByRole("radio", { name: s })).toBeVisible();
  await page.getByRole("radio", { name: "12,5 kg" }).click();
  await expect(page.getByRole("radio", { name: /Recharge/ })).toHaveText(/9\s000/);
  await expect(page.getByRole("radio", { name: /Bouteille neuve/ })).toHaveText(/32\s000/);
  await expect(page.getByText("30-45 min")).toBeVisible();
  await expect(page.getByText("Livraison", { exact: true })).toBeVisible();
  await expect(page.getByTestId("gas-total")).toHaveText(/9\s500/);
  const before = await balance(page);
  await page.getByRole("button", { name: /^Commander/ }).click();
  await expect(page.getByTestId("timeline-step")).toHaveText([/Commande confirmée/, /Préparation/, /En livraison/, /Livré/]);
  await expect(page.getByTestId("timeline-step").last()).toHaveAttribute("data-state", "done", { timeout: 15_000 });
  await expect(page.getByText("Commande livrée ✓")).toBeVisible();
  expect(await balance(page)).toBe(before - 9500);
});

test("F15 AC2: shopping categories filter, add items, checkout debits and adds activity", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto("/shopping");
  for (const c of ["Épicerie", "Boissons", "Hygiène", "Maison", "Téléphones", "Électronique"]) await expect(page.getByRole("tab", { name: c })).toBeVisible();
  const cards = page.getByTestId("product-card");
  await page.getByRole("tab", { name: "Épicerie" }).click();
  await expect(cards.filter({ hasText: "Riz 5kg" })).toHaveText(/4\s500/);
  await expect(cards.filter({ hasText: "Huile 1L" })).toHaveText(/1\s800/);
  await expect(cards.filter({ hasText: "Lait" })).toHaveText(/1\s200/);
  await expect(cards.filter({ hasText: "Coca-Cola" })).toHaveCount(0);
  await page.getByRole("button", { name: "Ajouter Riz 5kg" }).click();
  await page.getByRole("button", { name: "Ajouter Riz 5kg" }).click();
  await page.getByRole("button", { name: "Ajouter Lait" }).click();
  await page.getByRole("tab", { name: "Boissons" }).click();
  await expect(cards.filter({ hasText: "Riz 5kg" })).toHaveCount(0);
  const before = await balance(page);
  // 2×4 500 + 1 200 + 1 000 delivery = 11 200
  await page.getByRole("button", { name: /^Commander/ }).click();
  await expect(page.getByText("Commande en cours")).toBeVisible();
  expect(await balance(page)).toBe(before - 11200);
  const entry = (await stored(page)).state.activity.entries[0];
  expect(entry).toMatchObject({ type: "order", title: "Courses Gozem", amount: 11200 });
  await expect(page.getByTestId("timeline-step").last()).toHaveAttribute("data-state", "done", { timeout: 15_000 });
});
