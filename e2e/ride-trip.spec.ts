import { test, expect, type Page } from "@playwright/test";

// F04 matching + live tracking, F05 safety, F06 completion, F13 AC1–AC2 (in-trip stops / change destination).

const KEY = "gozem-demo";
const rideState = (page: Page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "{}").state?.ride ?? null, KEY);

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.clear());
});

test("F04 AC1: matching shows search steps, then the driver card", async ({ page }) => {
  await page.goto("/ride/matching");
  await expect(page.getByText("Recherche d'un chauffeur...")).toBeVisible();
  await expect(page.getByTestId("radar")).toBeVisible();
  await expect(page.getByText("Recherche de chauffeurs à proximité")).toBeVisible({ timeout: 3000 });
  await expect(page.getByText("Chauffeur trouvé ✓")).toBeVisible({ timeout: 4000 });
  const card = page.getByTestId("driver-card");
  await expect(card).toContainText("Koffi A.");
  await expect(card).toContainText("⭐ 4.9");
  await expect(card).toContainText(/1\s284 trajets/);
  await expect(card).toContainText("Honda Wave");
  await expect(card).toContainText("AB 1234 RB");
  // AC2: then goes to tracking
  await expect(page).toHaveURL(/\/ride\/tracking$/, { timeout: 6000 });
  await expect(page.getByText("Koffi arrive dans 3 min")).toBeVisible();
});

test("F04 AC1: Annuler during search returns to options", async ({ page }) => {
  await page.goto("/ride/matching");
  await page.getByRole("button", { name: "Annuler" }).click();
  await expect(page).toHaveURL(/\/ride\/options$/);
});

test("F04 AC2+AC3: marker moves and rotates, status runs to completion on its own", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/ride/tracking");
  await expect(page.getByText("Koffi arrive dans 3 min")).toBeVisible();
  const eta = page.getByTestId("eta-min");
  const first = Number(await eta.textContent());
  const marker = page.getByTestId("moving-marker");
  await expect(marker).toBeVisible();
  const positions = new Set<string>();
  for (let i = 0; i < 5; i++) {
    const b = await marker.boundingBox();
    if (b) positions.add(`${Math.round(b.x)},${Math.round(b.y)}`);
    await page.waitForTimeout(1200);
  }
  expect(positions.size).toBeGreaterThanOrEqual(4);
  await expect(marker.locator("svg")).toHaveAttribute("style", /rotate\(/);

  await expect.poll(async () => Number(await eta.textContent()), { timeout: 8000 }).toBeLessThan(first);

  await expect(page.getByText("Votre chauffeur est arrivé")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/En route vers Aéroport de Cotonou · arrivée \d\d:\d\d/)).toBeVisible({ timeout: 10_000 });
  const km = page.getByTestId("eta-km");
  const km0 = Number((await km.textContent())!.replace(",", "."));
  await expect.poll(async () => Number((await km.textContent())!.replace(",", ".")), { timeout: 6000 }).toBeLessThan(km0);
  await expect(page).toHaveURL(/\/ride\/complete$/, { timeout: 30_000 });
});

test("F04 AC4: simulate arrival, chat and call sheets", async ({ page }) => {
  await page.goto("/ride/tracking");
  await page.getByRole("button", { name: "Message" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Où êtes-vous ?" }).click();
  await expect(dialog.getByText("D'accord, j'arrive 👍")).toBeVisible({ timeout: 4000 });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Appeler" }).click();
  await expect(page.getByText("Appel en cours")).toBeVisible();
  await expect(page.getByTestId("call-timer")).toHaveText("00:00");
  await expect(page.getByTestId("call-timer")).toHaveText("00:02", { timeout: 4000 });
  await page.getByRole("button", { name: "Raccrocher" }).click();
  await page.getByRole("button", { name: "Simuler l'arrivée" }).click();
  await expect(page).toHaveURL(/\/ride\/complete$/);
});

test("F04 AC5: reload mid-trip keeps driver and phase", async ({ page }) => {
  await page.goto("/ride/tracking");
  await expect(page.getByText("Koffi arrive dans")).toBeVisible();
  await page.waitForTimeout(2500);
  const before = await rideState(page);
  expect(before.phase).toBe("driver_arriving");
  expect(before.progress).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByTestId("driver-card")).toContainText("Koffi A.");
  const after = await rideState(page);
  expect(after.rideId).toBe(before.rideId);
  expect(after.driverId).toBe("koffi");
  expect(after.phase).toBe("driver_arriving");
  expect(after.progress).toBeGreaterThanOrEqual(before.progress);
});

test("F05: safety center, share trip, emergency", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/ride/tracking");
  await page.getByRole("button", { name: "🛡 Sécurité" }).click();
  const d = page.getByRole("dialog");
  await expect(d.getByText("Votre sécurité")).toBeVisible();
  for (const t of ["✓ GPS", "✓ Chauffeur identifié", "✓ Véhicule identifié"]) await expect(d.getByText(t, { exact: true })).toBeVisible();
  for (const t of ["Contacter un proche", "Assistance", "Urgence"]) await expect(d.getByRole("button", { name: t })).toBeVisible();

  await d.getByRole("button", { name: "Partager mon trajet" }).click();
  const wa = page.getByRole("link", { name: "WhatsApp" });
  await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=.*gozem\.app%2Ft%2F8K92X/);
  await page.getByRole("button", { name: "Copier le lien" }).click();
  await expect(page.getByText("Trajet partagé ✓")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("gozem.app/t/8K92X");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "🛡 Sécurité" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Urgence" }).click();
  await expect(page.getByText("Déclencher une alerte d'urgence ?")).toBeVisible();
  await page.getByRole("button", { name: "Confirmer l'alerte" }).click();
  await expect(page.getByText("Alerte envoyée")).toBeVisible();
  const cd = page.getByTestId("sos-countdown");
  const c0 = Number(await cd.textContent());
  await expect.poll(async () => Number(await cd.textContent()), { timeout: 3000 }).toBeLessThan(c0);
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(page.getByText("Alerte envoyée")).toBeHidden();
});

test("F13 AC1: add up to 2 stops, 3rd refused", async ({ page }) => {
  await page.goto("/ride/tracking");
  const price = page.getByTestId("trip-price");
  await expect(price).toContainText(/1\s500/);
  for (const name of ["Fidjrossè", "Erevan"]) {
    await page.getByRole("button", { name: "+ Ajouter un arrêt" }).click();
    await page.getByRole("dialog").getByRole("button", { name: new RegExp(`^${name}`) }).click();
    await expect(page.getByTestId("stops")).toContainText(name);
  }
  await expect(page.getByTestId("map-marker-stop")).toHaveCount(2);
  await expect(price).not.toContainText(/^1\s500/);
  await expect(page.getByTestId("trip-duration")).toContainText("20 min");
  await page.getByRole("button", { name: "+ Ajouter un arrêt" }).click();
  await expect(page.getByText("Maximum 2 arrêts").first()).toBeVisible();
});

test("F13 AC2: change destination to Akpakpa", async ({ page }) => {
  await page.goto("/ride/tracking");
  await page.getByRole("button", { name: "Modifier destination" }).click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: /^Akpakpa/ }).click();
  await expect(d.getByText("Nouveau prix")).toBeVisible();
  await expect(d.getByText(/\+500\sFCFA/)).toBeVisible();
  await d.getByRole("button", { name: "Confirmer" }).click();
  await expect(page.getByTestId("destination-label")).toHaveText("Akpakpa");
});

test("F06: completion, rating, tip, receipt and side effects", async ({ page }) => {
  await page.goto("/");
  const bell0 = Number(await page.locator('[data-testid="bell-badge"]:visible').textContent());
  await page.goto("/ride/tracking");
  await page.getByRole("button", { name: "Simuler l'arrivée" }).click();
  await expect(page).toHaveURL(/\/ride\/complete$/);
  await expect(page.getByRole("heading", { name: "Vous êtes arrivé 🎉" })).toBeVisible();
  await expect(page.getByTestId("complete-price")).toContainText(/1\s500/);
  await expect(page.getByText("Payé avec Gozem Money")).toBeVisible();
  const r = page.getByTestId("receipt");
  await expect(r).toContainText("Course");
  await expect(r).toContainText(/1\s300/);
  await expect(r).toContainText("Frais");
  await expect(r).toContainText("200");
  await expect(r).toContainText(/Total\s*1\s500/);
  await expect(r).toContainText(/\d\d\/\d\d\/\d{4} · \d\d:\d\d/);

  for (const name of ["5 étoiles"]) {
    await page.getByRole("button", { name }).click();
    await expect(page.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
  }
  for (const name of ["Ponctuel", "Sympathique"]) {
    await page.getByRole("button", { name }).click();
    await expect(page.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
  }
  const tip = page.getByRole("button", { name: /^500\sFCFA$/ });
  await tip.click();
  await expect(tip).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Télécharger" }).click();
  await expect(page.getByText("Reçu téléchargé ✓")).toBeVisible();

  await page.getByRole("button", { name: "Terminer" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('[data-testid="bell-badge"]:visible')).toHaveText(String(bell0 + 1));

  await page.reload();
  const s = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).state, KEY);
  expect(s.wallet.balance).toBe(123500);
  expect(s.points.total).toBe(2500);
  expect(s.activity.entries[0]).toMatchObject({ type: "ride", status: "completed", title: "Trajet vers Aéroport de Cotonou" });
  expect(s.ride.phase).toBe("idle");
});
