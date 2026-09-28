import { test, expect, type Page } from "@playwright/test";

const KEY = "gozem-demo";
// Price renders "8\u202f000" + "FCFA" (no space in textContent).
const fcfa = (n: number) => new RegExp(`^${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\\s")}\\s?FCFA$`);
const state = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).state, KEY);
const patchState = (page: Page, fn: string) =>
  page.evaluate(
    ([k, body]) => {
      const s = JSON.parse(localStorage.getItem(k)!);
      new Function("s", body)(s.state);
      localStorage.setItem(k, JSON.stringify(s));
    },
    [KEY, fn] as const,
  );

async function fillCart(page: Page) {
  await page.goto("/food/burger-house");
  const add = (name: string) => page.getByRole("button", { name: `Ajouter ${name}` }).first();
  await add("Classic Burger").click();
  await expect(page.getByText("Ajouté au panier ✓").first()).toBeVisible();
  await add("Classic Burger").click();
  await add("Coca-Cola 33 cl").click();
  await add("Coca-Cola 33 cl").click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/food");
  await page.evaluate(() => localStorage.clear());
});

test("F07 AC1: browse, categories filter", async ({ page }) => {
  await page.goto("/food");
  await expect(page.getByRole("heading", { name: "Que voulez-vous manger ?" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Rechercher un restaurant" })).toBeVisible();
  for (const c of ["Burgers", "Pizza", "Poulet", "Asiatique", "Healthy", "Desserts"]) await expect(page.getByRole("button", { name: c, exact: true })).toBeVisible();
  const cards = page.getByTestId("restaurant-card");
  await expect(cards.first()).toBeVisible(); // F14 AC4: skeletons show first while the mock service loads
  expect(await cards.count()).toBeGreaterThanOrEqual(8);
  await expect(cards.filter({ hasText: "Burger House" })).toBeVisible();
  await expect(cards.filter({ hasText: "Chez Maman Bénin" })).toBeVisible();
  await expect(cards.first().locator("img")).toHaveCount(1);
  await expect(cards.first()).toContainText("min");
  await expect(cards.first()).toContainText("km");
  await page.getByRole("button", { name: "Burgers", exact: true }).click();
  await expect(cards.filter({ hasText: "Chez Maman Bénin" })).toHaveCount(0);
  await expect(cards.filter({ hasText: "Burger House" })).toBeVisible();
  await cards.filter({ hasText: "Burger House" }).click();
  await expect(page).toHaveURL(/\/food\/burger-house$/);
});

test("F07 AC2: sticky section tabs scroll to section", async ({ page }) => {
  await page.goto("/food/burger-house");
  const tabs = page.getByRole("navigation", { name: "Sections du menu" });
  for (const t of ["Populaire", "Burgers", "Menus", "Boissons", "Desserts"]) await expect(tabs.getByRole("button", { name: t })).toBeVisible();
  await tabs.getByRole("button", { name: "Desserts" }).click();
  await expect(page.locator("#section-desserts")).toBeInViewport();
  await expect(tabs).toBeInViewport();
  await tabs.getByRole("button", { name: "Boissons" }).click();
  await expect(page.locator("#section-boissons").getByRole("heading", { name: "Boissons" })).toBeInViewport();
});

test("F07 AC3+AC4: cart totals, survives reload", async ({ page }) => {
  await fillCart(page);
  await page.getByRole("button", { name: /Voir le panier/ }).click();
  await expect(page.getByTestId("cart-subtotal")).toHaveText(fcfa(8000));
  await expect(page.getByTestId("cart-delivery")).toHaveText(fcfa(1000));
  await expect(page.getByTestId("cart-total")).toHaveText(fcfa(9000));
  await page.reload();
  await page.getByRole("button", { name: /Voir le panier/ }).click();
  await expect(page.getByTestId("cart-total")).toHaveText(fcfa(9000));
});

test("F08: group order with simulated friends", async ({ page }) => {
  await fillCart(page);
  await page.getByRole("button", { name: "👥 Commander ensemble" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Budget max")).toBeVisible();
  await expect(dialog.getByLabel("Date limite")).toBeVisible();
  await expect(dialog.getByText("Je paie pour tout le monde")).toBeVisible();
  await dialog.getByText("Chacun paie sa part").click();
  await dialog.getByRole("button", { name: "Créer le lien" }).click();
  await expect(dialog.getByText("gozem.app/group/X92K")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Partager" })).toBeVisible();
  await dialog.getByRole("button", { name: "Copier" }).click();
  await expect(page.getByText("Lien copié ✓")).toBeVisible();
  await dialog.getByRole("link", { name: /Voir la commande groupée/ }).click();
  await expect(page).toHaveURL(/\/food\/group\/X92K$/);
  await expect(page.getByTestId("member-abed")).toContainText("Classic Burger");
  await expect(page.getByTestId("member-abed")).toContainText(/8\s000/);
  const bar = page.getByTestId("budget-bar");
  const w0 = await bar.evaluate((el) => (el as HTMLElement).style.width);
  await expect(page.getByTestId("member-aicha")).toContainText("Chicken Burger", { timeout: 7000 });
  await expect(page.getByTestId("member-rodrigue")).toContainText("Double Cheese", { timeout: 7000 });
  await expect(page.getByTestId("member-aicha")).toContainText(/4\s300/);
  await expect(page.getByTestId("member-rodrigue")).toContainText(/5\s500/);
  expect(parseFloat(await bar.evaluate((el) => (el as HTMLElement).style.width))).toBeGreaterThan(parseFloat(w0));
  // Friend-activity toasts sit over the bottom CTA and hovering pauses them; let them expire first.
  await page.mouse.move(0, 0);
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0, { timeout: 10000 });
  await page.getByRole("link", { name: "Retour au panier" }).click();
  await expect(page).toHaveURL(/\/food\/burger-house/);
  await expect(page.getByTestId("cart-total")).toHaveText(fcfa(9000));
});

test("F09: checkout, success, tracking, side effects", async ({ page }) => {
  await fillCart(page);
  await patchState(page, "s.wallet.balance = 123500");
  await page.goto("/food/checkout");
  await expect(page.getByText("Maison (Abomey-Calavi)")).toBeVisible();
  await expect(page.getByText("Gozem Money")).toBeVisible();
  await expect(page.getByTestId("checkout-total")).toHaveText(fcfa(9000));
  const before = await state(page);
  const unreadBefore = before.notifications.items.filter((n: { read: boolean }) => !n.read).length;
  await page.getByRole("button", { name: /Payer/ }).click();
  await expect(page.getByText("Paiement en cours…")).toBeVisible();
  await expect(page.getByText("Paiement réussi ✓").first()).toBeVisible();
  await expect(page).toHaveURL(/\/food\/order\/.+/, { timeout: 5000 });
  const tl = page.getByTestId("order-timeline");
  for (const s of ["Restaurant confirme", "Préparation", "Coursier assigné", "En livraison", "Livré"]) await expect(tl).toContainText(s);
  await expect(page.getByTestId("step-Livré")).toHaveAttribute("data-state", "done", { timeout: 20000 });
  const after = await state(page);
  expect(after.wallet.balance).toBe(114500);
  expect(after.activity.entries[0].title).toBe("Burger House");
  expect(after.notifications.items.filter((n: { read: boolean }) => !n.read).length).toBeGreaterThan(unreadBefore);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByTestId("bell-badge")).toHaveText(String(after.notifications.items.filter((n: { read: boolean }) => !n.read).length));
});

test("F09 AC4: insufficient funds, nothing debited", async ({ page }) => {
  await fillCart(page);
  await patchState(page, "s.wallet.balance = 5000");
  await page.goto("/food/checkout");
  await page.getByRole("button", { name: /Payer/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Solde" })).toContainText("Solde insuffisant");
  const s = await state(page);
  expect(s.wallet.balance).toBe(5000);
  expect(s.food.cart.items.length).toBe(2);
});
