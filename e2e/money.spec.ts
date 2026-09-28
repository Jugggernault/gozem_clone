import { test, expect, type Page } from "@playwright/test";

// Track "money": F10 (wallet, activity, GoWin, notifications), F11 (scheduled ride, transfer), F15 AC3 (QR pay).
const balance = (page: Page) => page.getByTestId("wallet-balance");

async function enterPin(page: Page) {
  for (const d of ["1", "2", "3", "4"]) await page.getByRole("button", { name: d, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.clear());
});

test("F10 AC1: wallet balance toggle, actions, transactions", async ({ page }) => {
  await page.goto("/wallet");
  await expect(balance(page)).toHaveText(/125\s500/);
  await page.getByRole("button", { name: "Masquer le solde" }).click();
  await expect(balance(page)).toHaveText("••••••");
  await page.getByRole("button", { name: "Afficher le solde" }).click();
  await expect(balance(page)).toHaveText(/125\s500/);

  await page.getByRole("button", { name: "Recevoir" }).click();
  await expect(page.getByTestId("receive-qr")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("+229 97 12 34 56")).toBeVisible();
  await page.getByRole("button", { name: "Fermer" }).click();

  await page.getByRole("button", { name: "Recharger", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^Recharger 10/ }).click();
  await expect(page.getByText("Recharge réussie ✓")).toBeVisible();
  await expect(balance(page)).toHaveText(/135\s500/);

  await page.getByRole("button", { name: "Retirer", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^Retirer 10/ }).click();
  await expect(page.getByText("Retrait effectué ✓")).toBeVisible();
  await expect(balance(page)).toHaveText(/125\s500/);
  await expect(page.getByTestId("tx-list").locator("li").first()).toContainText("Retrait MTN MoMo");

  await page.getByRole("link", { name: "Payer" }).click();
  await expect(page).toHaveURL(/\/wallet\/pay$/);
});

test("F15 AC3: QR pay Burger House 8 500 FCFA", async ({ page }) => {
  await page.goto("/wallet/pay");
  await page.getByRole("button", { name: "Scanner un QR" }).click();
  await expect(page.getByText("Recherche du QR code…")).toBeVisible();
  const merchant = page.getByTestId("qr-merchant");
  await expect(merchant).toContainText("Burger House", { timeout: 4000 });
  await expect(merchant).toContainText(/8\s500/);
  await merchant.getByRole("button", { name: /^Payer/ }).click();
  await enterPin(page);
  await expect(page.getByText("Paiement réussi", { exact: true })).toBeVisible();
  await page.goto("/wallet");
  await expect(balance(page)).toHaveText(/117\s000/);
  await expect(page.getByTestId("tx-list").locator("li").first()).toContainText("Paiement Burger House");
});

test("F11 AC3+AC4: transfer validates +229, 10 000 to Koffi A., insufficient funds", async ({ page }) => {
  await page.goto("/wallet/send");
  const phone = page.getByRole("textbox", { name: "Numéro du destinataire" });
  await phone.fill("97123456");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByText(/^Numéro invalide/)).toBeVisible();
  await phone.fill("+229 96 11 22 33");
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("textbox", { name: "Montant (FCFA)" }).fill("10000");
  await page.getByRole("textbox", { name: "Message (facultatif)" }).fill("Pour le carburant");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByText(/^Envoyer 10\s000\sFCFA à Koffi A\.$/)).toBeVisible();
  await page.getByRole("button", { name: "Confirmer" }).click();
  await enterPin(page);
  await expect(page.getByText("Transfert réussi")).toBeVisible();
  await page.goto("/wallet");
  await expect(balance(page)).toHaveText(/115\s500/);

  // AC4: more than the balance → error at PIN step, balance unchanged
  await page.goto("/wallet/send");
  await page.getByRole("textbox", { name: "Numéro du destinataire" }).fill("+229 96 11 22 33");
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("textbox", { name: "Montant (FCFA)" }).fill("500000");
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("button", { name: "Confirmer" }).click();
  await enterPin(page);
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Solde insuffisant");
  await page.goto("/wallet");
  await expect(balance(page)).toHaveText(/115\s500/);
});

test("F11 AC1+AC2: scheduled ride Demain 07:00 Maison → Aéroport, listed under À venir, cancellable", async ({ page }) => {
  await page.goto("/ride/schedule");
  await page.getByRole("radiogroup", { name: "Jour" }).getByRole("radio", { name: "Demain" }).click();
  await page.getByRole("radiogroup", { name: "Heure" }).getByRole("radio", { name: "07:00" }).click();
  await page.getByRole("radiogroup", { name: "Départ" }).getByRole("radio", { name: "Maison" }).click();
  await page.getByRole("radiogroup", { name: "Destination" }).getByRole("radio", { name: "Aéroport de Cotonou" }).click();
  await page.getByRole("button", { name: "Programmer le trajet" }).click();
  await expect(page.getByText("Trajet programmé ✓", { exact: true })).toBeVisible();
  await expect(page.getByText("Demain à 07:00", { exact: true })).toBeVisible();
  await expect(page.getByText("✓ Chauffeur assigné avant votre départ")).toBeVisible();

  await page.getByRole("link", { name: "Voir dans Activité" }).click();
  const upcoming = page.getByRole("region", { name: "À venir" });
  await expect(upcoming).toContainText("Trajet vers Aéroport de Cotonou");
  await expect(upcoming).toContainText("Demain à 07:00");
  await upcoming.getByRole("button", { name: /^Annuler/ }).click();
  await expect(page.getByText("Trajet annulé ✓")).toBeVisible();
  await expect(page.getByRole("region", { name: "À venir" })).toHaveCount(0);
});

test("F10 AC2: activity tabs, groups, empty state, receipt detail", async ({ page }) => {
  await page.goto("/activity");
  await expect(page.getByRole("region", { name: "Hier" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Plus tôt" })).toBeVisible();
  await page.getByRole("tab", { name: "Trajets" }).click();
  const rows = page.getByTestId("activity-row");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toHaveAttribute("data-type", "ride");
  await page.getByRole("tab", { name: "Livraisons" }).click();
  await expect(page.getByTestId("activity-empty")).toBeVisible();
  await page.getByRole("tab", { name: "Tout" }).click();
  await page.getByRole("link", { name: /Trajet vers Travail/ }).click();
  await expect(page).toHaveURL(/\/activity\/act-seed-1$/);
  const receipt = page.getByTestId("receipt");
  await expect(receipt).toContainText("Trajet vers Travail");
  await expect(receipt).toContainText("Destination");
  await expect(receipt).toContainText(/1\s200/);
});

test("F10 AC3: GoWin redeem 500 pts", async ({ page }) => {
  await page.goto("/gowin");
  await expect(page.getByTestId("points-total")).toContainText(/2\s450/);
  await expect(page.getByText("Gold", { exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();
  await page.getByRole("button", { name: /Échanger 500 pts contre 500 FCFA de réduction/ }).click();
  await expect(page.getByText("Récompense activée ✓")).toBeVisible();
  await expect(page.getByTestId("points-total")).toContainText(/1\s950/);
  await expect(page.getByTestId("points-history").locator("li").first()).toContainText("500 FCFA de réduction");
});

test("F10 AC4: notifications unread → Tout marquer comme lu clears the bell", async ({ page }) => {
  // A ride + an order notification, as the ride / food flows would create them.
  await page.goto("/");
  await page.evaluate(() => {
    const k = "gozem-demo";
    const s = JSON.parse(localStorage.getItem(k)!);
    const now = new Date().toISOString();
    s.state.notifications.items.unshift(
      { id: "n-ride", kind: "ride", title: "Trajet terminé", body: "Aéroport de Cotonou · 1 500 FCFA", date: now, read: false },
      { id: "n-order", kind: "order", title: "Commande confirmée", body: "Burger House · 9 000 FCFA", date: now, read: false },
    );
    localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
  await expect(page.getByTestId("bell-badge").first()).toHaveText("3");
  await page.goto("/notifications");
  await expect(page.locator('[data-testid="notification"][data-unread="true"]')).toHaveCount(3);
  await expect(page.getByText("Trajet terminé").first()).toBeVisible();
  await expect(page.getByText("Commande confirmée")).toBeVisible();
  await page.getByRole("button", { name: "Tout marquer comme lu" }).click();
  await expect(page.locator('[data-testid="notification"][data-unread="true"]')).toHaveCount(0);
  await page.goto("/");
  await expect(page.getByTestId("bell-badge")).toHaveCount(0);
});
