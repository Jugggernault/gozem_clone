import { test, expect, type Page } from "@playwright/test";

const state = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("gozem-demo") ?? "{}").state);

test.describe("F02 home", () => {
  test("AC1 header, bell badge, avatar, CTA card", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Bonjour Abed 👋" })).toBeVisible();
    await expect(page.getByText("📍 Cotonou")).toBeVisible();
    await expect(page.locator("main").getByTestId("bell-badge")).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Mon compte" })).toBeVisible();
    await expect(page.getByText("Que voulez-vous faire ?")).toBeVisible();
    await expect(page.getByRole("link", { name: /Où allez-vous \?/ })).toBeVisible();
  });

  test("AC2 8 service tiles, coming-soon sheet", async ({ page }) => {
    await page.goto("/");
    const grid = page.getByRole("region", { name: "Services" });
    for (const name of ["Se déplacer", "Manger", "Courses", "Envoyer", "Gaz", "Gozem Money", "Billetterie", "Crédit"]) await expect(grid.getByText(name, { exact: true })).toBeVisible();
    await expect(grid.locator("[data-testid^=service-]")).toHaveCount(8);
    for (const id of ["tickets", "credit", "shopping", "gas"]) {
      await page.getByTestId(`service-${id}`).click();
      await expect(page.getByRole("heading", { name: "Bientôt disponible" })).toBeVisible();
      await page.getByRole("button", { name: "Compris" }).click();
      await expect(page.getByRole("heading", { name: "Bientôt disponible" })).toBeHidden();
    }
  });

  test("AC3 navigation to ride search and food", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Où allez-vous \?/ }).click();
    await expect(page).toHaveURL(/\/ride\/search$/);
    await page.goto("/");
    await page.getByTestId("service-ride").click();
    await expect(page).toHaveURL(/\/ride\/search$/);
    await page.goto("/");
    await page.getByTestId("service-food").click();
    await expect(page).toHaveURL(/\/food$/);
  });

  test("AC4 Maison quick action → ride options toward Maison", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Maison" }).click();
    await expect(page).toHaveURL(/\/ride\/options/);
    expect((await state(page)).ride.destinationId).toBe("maison");
  });

  test("AC5 promo carousel: 4 cards, horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const car = page.getByTestId("promo-carousel");
    await expect(car.getByTestId("promo-card")).toHaveCount(4);
    const scrolled = await car.evaluate((el) => {
      el.scrollLeft = 200;
      return el.scrollWidth > el.clientWidth && el.scrollLeft > 0;
    });
    expect(scrolled).toBe(true);
  });
});

test.describe("F13 AC4 Explorer search", () => {
  test("burger → Restaurants + Produits/Services; aero → Lieux → ride options", async ({ page }) => {
    await page.goto("/explore");
    const input = page.getByRole("searchbox", { name: "Rechercher sur Gozem" });
    await input.fill("burger");
    await expect(page.getByRole("heading", { name: "Restaurants" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Burger House/ }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Produits/Services" })).toBeVisible();
    await input.fill("aero");
    await expect(page.getByRole("heading", { name: "Lieux" })).toBeVisible();
    await page.getByRole("button", { name: /Aéroport International de Cotonou/ }).click();
    await expect(page).toHaveURL(/\/ride\/options/);
    expect((await state(page)).ride.destinationId).toBe("aeroport");
  });

  test("top bar query prefills Explorer", async ({ page }) => {
    await page.goto("/explore?q=pizza");
    await expect(page.getByRole("link", { name: /Pizza Napoli/ }).first()).toBeVisible();
  });
});

test.describe("F14 account + help + UX states", () => {
  test("AC1 profile name persists after reload", async ({ page }) => {
    await page.goto("/account");
    await page.getByRole("link", { name: "Informations personnelles" }).click();
    await page.getByLabel("Nom complet").fill("Abed-Négo Houngbo");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Profil mis à jour ✓")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Nom complet")).toHaveValue("Abed-Négo Houngbo");
  });

  test("AC1 addresses list + new address toast", async ({ page }) => {
    await page.goto("/account/addresses");
    for (const l of ["Maison", "Travail", "Université"]) await expect(page.getByText(l, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "+ Nouvelle adresse" }).click();
    await page.getByLabel("Nom de l'adresse").fill("Salle de sport");
    await page.getByLabel("Adresse", { exact: true }).fill("Haie Vive, Cotonou");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Adresse enregistrée ✓")).toBeVisible();
    await expect(page.getByText("Salle de sport")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Salle de sport")).toBeVisible();
  });

  test("AC1 payment method persists; security + language", async ({ page }) => {
    await page.goto("/account/payment");
    await expect(page.getByRole("radio", { name: /Gozem Money/ })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("radio", { name: /Espèces/ }).click();
    await page.reload();
    await expect(page.getByRole("radio", { name: /Espèces/ })).toHaveAttribute("aria-checked", "true");
    expect((await state(page)).profile.paymentMethod).toBe("cash");

    await page.goto("/account/security");
    await expect(page.getByRole("heading", { name: "Contacts de confiance" })).toBeVisible();
    await expect(page.getByText("Maman")).toBeVisible();

    await page.goto("/account/language");
    await expect(page.getByRole("radio", { name: /Français/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("Bientôt")).toHaveCount(3);
  });

  test("AC2 help center + support chat replies within 2 s", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByRole("heading", { name: "Comment pouvons-nous vous aider ?" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Rechercher dans l'aide" })).toBeVisible();
    for (const c of ["Trajet", "Commande", "Paiement", "Compte", "Sécurité"]) await expect(page.getByRole("button", { name: c, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Objet perdu" })).toBeVisible();
    await page.getByRole("button", { name: "Contacter le support" }).click();
    const chat = page.getByTestId("support-chat");
    await expect(chat).toContainText("Awa");
    await page.getByLabel("Message au support").fill("J'ai été débité deux fois");
    await page.getByRole("button", { name: "Envoyer", exact: true }).click();
    await expect(chat.locator("[data-from=agent]")).toHaveCount(2, { timeout: 2000 });
  });

  test("AC3 offline banner on all pages", async ({ page }) => {
    await page.goto("/account");
    await page.getByRole("switch", { name: "Simuler hors connexion" }).click();
    await expect(page.getByText("Vous êtes hors connexion.")).toBeVisible();
    await page.goto("/help");
    await expect(page.getByText("Vous êtes hors connexion.")).toBeVisible();
    await page.goto("/");
    await expect(page.getByText("Vous êtes hors connexion.")).toBeVisible();
  });

  test("AC5 manifest", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBe(true);
    const m = await res.json();
    expect(m.name).toBe("Gozem Next");
    expect(m.theme_color).toBe("#00A86B");
    expect(m.display).toBe("standalone");
    expect(m.icons.length).toBeGreaterThan(0);
    expect((await request.get(m.icons[0].src)).ok()).toBe(true);
  });
});

test.describe("F16 Gozem Assistant", () => {
  const ask = async (page: Page, text: string) => {
    const before = await page.getByTestId("assistant-reply").count();
    await page.getByLabel("Message à l'assistant").fill(text);
    await page.getByRole("button", { name: "Envoyer", exact: true }).click();
    await expect(page.getByTestId("assistant-typing")).toBeVisible();
    await expect(page.getByTestId("assistant-reply")).toHaveCount(before + 1);
    await expect(page.getByTestId("assistant-reply").last()).toHaveAttribute("data-done", "true");
  };

  test("AC1 reachable from home, suggestion chips", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "✨ Gozem Assistant" }).first().click();
    await expect(page).toHaveURL(/\/assistant$/);
    await expect(page.getByTestId("assistant-chips").first().getByRole("button")).toHaveCount(4);
  });

  test("AC2 airport booking card → scheduled ride prefilled", async ({ page }) => {
    await page.goto("/assistant");
    await ask(page, "Je veux aller à l'aéroport demain à 7h");
    const card = page.getByTestId("assistant-card-ride");
    await expect(card).toContainText("Maison → Aéroport");
    await expect(card).toContainText("Demain 07:00");
    await expect(card).toContainText("Zem");
    await expect(card).toContainText("1 500");
    await card.getByRole("button", { name: "Programmer ce trajet" }).click();
    await expect(page).toHaveURL(/\/ride\/schedule\?.*to=aeroport.*when=tomorrow.*time=07%3A00/);
    const s = await state(page);
    expect(s.ride.destinationId).toBe("aeroport");
    expect(s.ride.schedule).toEqual({ mode: "tomorrow", time: "07:00" });
  });

  test("AC3 parcel card → /delivery?to=Calavi", async ({ page }) => {
    await page.goto("/assistant");
    await ask(page, "Je veux envoyer un colis à Calavi");
    await page.getByTestId("assistant-card-parcel").getByRole("link").click();
    await expect(page).toHaveURL(/\/delivery\?to=Calavi$/);
  });

  test("AC4 restaurants near me → ≥3 cards linking to pages", async ({ page }) => {
    await page.goto("/assistant");
    await ask(page, "Quel restaurant livre près de moi ?");
    const links = page.getByTestId("assistant-restaurant");
    await expect(links).toHaveCount(3);
    await expect(links.first()).toHaveAttribute("href", /^\/food\/[a-z-]+$/);
  });

  test("AC5 spending computed from store, changes after a payment", async ({ page }) => {
    await page.goto("/assistant");
    // seed debits of the last 7 days: 1 200 + 4 500 + 12 300 = 18 000
    await ask(page, "Combien ai-je dépensé cette semaine ?");
    await expect(page.getByTestId("spending-total").last()).toContainText("18 000");
    await expect(page.getByTestId("assistant-card-spending").last()).toContainText("Trajets");
    await page.evaluate(() => {
      const k = "gozem-demo";
      const s = JSON.parse(localStorage.getItem(k)!);
      s.state.wallet.transactions.unshift({ id: "tx-e2e", label: "Paiement Test", category: "payment", amount: -2000, date: new Date().toISOString(), balanceAfter: 0 });
      localStorage.setItem(k, JSON.stringify(s));
    });
    await page.reload();
    await ask(page, "combien ai-je DEPENSE cette semaine");
    await expect(page.getByTestId("spending-total").last()).toContainText("20 000");
  });

  test("AC6 fallback with chips, accent-insensitive", async ({ page }) => {
    await page.goto("/assistant");
    await ask(page, "bonjour, il fait beau ?");
    await expect(page.getByTestId("assistant-reply").last()).toContainText("Je n'ai pas bien compris");
    await expect(page.getByTestId("assistant-reply").last().getByTestId("assistant-chips").getByRole("button")).toHaveCount(4);
    await ask(page, "JE VEUX ALLER A L'AEROPORT DEMAIN A 7H");
    await expect(page.getByTestId("assistant-card-ride").last()).toContainText("Demain 07:00");
  });
});
