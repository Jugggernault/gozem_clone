import { test, expect, type Page } from "@playwright/test";

/** Price renders "1 500" + "FCFA" in separate spans → match with optional whitespace. */
const fcfa = (s: string) => new RegExp(s.replace(/ /g, "\\s?"));

const fresh = async (page: Page) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.clear());
};

test("F03 AC1-2: search map, autofocus, chips, accent-insensitive results", async ({ page }) => {
  await fresh(page);
  await page.goto("/ride/search");
  await expect(page.getByRole("heading", { name: "Où allez-vous ?" })).toBeVisible();
  const input = page.getByRole("textbox", { name: "Destination" });
  await expect(input).toBeFocused();
  for (const chip of ["Maison", "Travail", "Lieu récent"]) await expect(page.getByRole("button", { name: chip })).toBeVisible();
  await expect(page.getByTestId("map-marker-user").or(page.getByTestId("map-fallback")).first()).toBeAttached();

  await input.fill("aeroport");
  const first = page.getByRole("list", { name: "Résultats" }).getByRole("button").first();
  await expect(first).toContainText("Aéroport International de Cotonou");
  await expect(first).toContainText("Cadjehoun");

  await input.fill("zzzz");
  await expect(page.getByText("Aucun lieu trouvé pour « zzzz »")).toBeVisible();
});

test("F03 AC3-5: options → taxi price → stops → confirm → matching", async ({ page }) => {
  await fresh(page);
  await page.goto("/ride/search");
  await page.getByRole("textbox", { name: "Destination" }).fill("aeroport");
  await page.getByRole("list", { name: "Résultats" }).getByRole("button").first().click();
  await expect(page).toHaveURL(/\/ride\/options$/);

  await expect(page.getByRole("heading", { name: "Vers Aéroport de Cotonou · 12 min · 4.8 km" })).toBeVisible();
  await expect(page.getByTestId("map-marker-vehicle").first()).toBeAttached();
  for (const [id, name, price, eta] of [
    ["zem", "Zem", "1 500 FCFA", "4 min"],
    ["tricycle", "Tricycle", "2 000 FCFA", "7 min"],
    ["taxi", "Taxi", "3 000 FCFA", "9 min"],
    ["comfort", "Gozem Comfort", "4 500 FCFA", "10 min"],
  ]) {
    const row = page.getByTestId(`vehicle-${id}`);
    await expect(row).toContainText(name);
    await expect(row).toContainText(fcfa(price));
    await expect(row).toContainText(eta);
  }
  await expect(page.getByText("Prix estimé")).toBeVisible();
  await expect(page.getByText("Prix garanti*")).toBeVisible();
  const footerPrice = page.locator("section").filter({ hasText: "Prix estimé" }).locator(".text-price-hero");
  await expect(footerPrice).toHaveText(fcfa("1 500 FCFA"));
  await page.getByTestId("vehicle-taxi").click();
  await expect(footerPrice).toHaveText(fcfa("3 000 FCFA"));
  await page.getByTestId("vehicle-zem").click();

  // Options sheet: schedule + stops
  await page.getByRole("button", { name: "⚙ Options" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("radio", { name: "Maintenant" })).toHaveAttribute("aria-checked", "true");
  for (const l of ["Aujourd'hui", "Demain"]) await expect(dialog.getByRole("radio", { name: l })).toBeVisible();
  await dialog.getByRole("radio", { name: "Choisir une date" }).click();
  await expect(dialog.locator('input[type="date"]')).toBeVisible();
  await expect(dialog.locator('input[type="time"]')).toBeVisible();
  await dialog.getByRole("radio", { name: "Maintenant" }).click();
  await dialog.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "+ Ajouter un arrêt" }).click();
  await page.getByRole("list", { name: "Lieux d'arrêt" }).getByRole("button", { name: /Fidjrossè/ }).first().click();
  await expect(page.getByRole("heading", { name: "Vers Aéroport de Cotonou · 16 min · 6.3 km" })).toBeVisible();
  await expect(footerPrice).not.toHaveText(fcfa("1 500 FCFA"));
  await page.getByRole("button", { name: "+ Ajouter un arrêt" }).click();
  await page.getByRole("list", { name: "Lieux d'arrêt" }).getByRole("button", { name: /Erevan/ }).first().click();
  await expect(page.getByRole("heading", { name: "Vers Aéroport de Cotonou · 20 min · 7.8 km" })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Ajouter un arrêt" })).toBeDisabled();
  await expect(page.getByText("Maximum 2 arrêts")).toBeVisible();
  await page.getByRole("button", { name: "Retirer l'arrêt 2" }).click();
  await page.getByRole("button", { name: "Retirer l'arrêt 1" }).click();
  await expect(page.getByRole("heading", { name: "Vers Aéroport de Cotonou · 12 min · 4.8 km" })).toBeVisible();

  await page.getByRole("button", { name: "Choisir Zem" }).click();
  await expect(page).toHaveURL(/\/ride\/confirm$/);
  await expect(page.getByRole("heading", { name: "Confirmer votre trajet" })).toBeVisible();
  const itin = page.getByRole("list", { name: "Itinéraire" });
  await expect(itin).toContainText("Ma position");
  await expect(itin).toContainText("Aéroport");
  await expect(page.getByText("Zem", { exact: true })).toBeVisible();
  await expect(page.getByText(fcfa("1 500 FCFA")).first()).toBeVisible();
  await expect(page.getByText("Gozem Money").first()).toBeVisible();
  await page.getByRole("button", { name: "Confirmer le trajet" }).click();
  await expect(page).toHaveURL(/\/ride\/matching$/);
});

test("F13 AC3: -20% promo activated on /promotions → Zem 1 200 FCFA with promo tag", async ({ page }) => {
  await fresh(page);
  await page.goto("/promotions");
  await expect(page.getByRole("heading", { name: "Offres pour vous" })).toBeVisible();
  expect(await page.locator("main li, li").filter({ has: page.locator("h2") }).count()).toBeGreaterThanOrEqual(3);
  const card = page.locator("li").filter({ hasText: "-20% sur votre prochaine course" });
  await card.getByRole("button", { name: "Activer" }).click();
  await expect(card.getByText("Activée")).toBeVisible();

  await page.goto("/ride/options?to=aeroport");
  const zem = page.getByTestId("vehicle-zem");
  await expect(zem).toContainText(fcfa("1 200 FCFA"));
  await expect(zem).toContainText("Promo -20%");
});
