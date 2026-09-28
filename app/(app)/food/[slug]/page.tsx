"use client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag, Star } from "lucide-react";
import { Page } from "@/components/Page";
import { Price } from "@/components/Price";
import { StubPage } from "@/components/StubPage";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/food/CartSheet";
import { GroupOrderSheet } from "@/components/food/GroupOrderSheet";
import { QtyStepper } from "@/components/food/QtyStepper";
import { RestaurantImage } from "@/components/food/RestaurantImage";
import { formatFCFA } from "@/lib/format";
import { normalize } from "@/lib/mock/places";
import { getRestaurant } from "@/lib/mock/restaurants";
import { selectCartCount, selectCartTotals, useApp } from "@/lib/store";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const sectionId = (s: string) => `section-${normalize(s).replace(/[^a-z0-9]+/g, "-")}`;

export default function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>();
  const r = getRestaurant(slug);
  const openCart = useSearchParams().get("panier") === "1";
  const cart = useApp((s) => s.food.cart);
  const setCartQty = useApp((s) => s.setCartQty);
  const count = useApp(selectCartCount);
  const total = useApp((s) => selectCartTotals(s).total);
  // "?panier=1" (from the group order "Retour au panier") opens the cart directly.
  const [cartOpen, setCartOpen] = useState(openCart);
  const [groupOpen, setGroupOpen] = useState(false);
  const [active, setActive] = useState(r?.sections[0] ?? "");

  const sections = (r?.sections ?? [])
    .map((name) => ({ name, items: r!.menu.filter((m) => (name === "Populaire" ? m.popular : m.section === name)) }))
    .filter((s) => s.items.length > 0);

  // Highlight the tab of the section currently under the sticky bar.
  useEffect(() => {
    const onScroll = () => {
      const offset = window.innerWidth >= 1024 ? 140 : 80;
      let current = sections[0]?.name;
      for (const s of sections) {
        const el = document.getElementById(sectionId(s.name));
        if (el && el.getBoundingClientRect().top - offset <= 1) current = s.name;
      }
      if (current) setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  if (!r) return <StubPage title="Restaurant introuvable" back="/food" />;

  const qtyOf = (id: string) => (cart.restaurantSlug === r.slug ? cart.items.find((l) => l.itemId === id)?.qty ?? 0 : 0);
  const change = (item: MenuItem, qty: number) => {
    const prev = qtyOf(item.id);
    setCartQty(r.slug, item.id, qty);
    if (qty > prev) toast.success("Ajouté au panier ✓", { id: "cart-add", description: `${item.name} × ${qty}` });
  };
  const goTo = (name: string) => {
    setActive(name);
    document.getElementById(sectionId(name))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="relative">
        <RestaurantImage src={r.image} emoji={r.emoji} alt={r.name} className="h-48 w-full sm:h-64" />
        <Link href="/food" aria-label="Retour" className="absolute left-gutter top-md grid size-touch-target place-items-center rounded-full bg-surface text-ink shadow-float">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
      </div>
      <Page className={cn(count > 0 && "pb-32")}>
        <section className="relative -mt-lg rounded-lg bg-surface p-md shadow-card">
          <h1 className="text-h1 text-ink">{r.name}</h1>
          <p className="mt-xs text-caption text-muted">{r.cuisine} · {r.address}</p>
          <p className="mt-sm flex flex-wrap items-center gap-x-md gap-y-xs text-caption text-on-surface">
            <span className="flex items-center gap-xs">
              <Star className="size-4 text-accent" fill="currentColor" aria-hidden />
              <span className="num">{r.rating.toFixed(1)}</span>
              <span className="text-muted">({r.reviews.toLocaleString("fr-FR")})</span>
            </span>
            <span className="num">{r.timeMin}</span>
            <span>Livraison <span className="num">{formatFCFA(r.deliveryFee)}</span></span>
            <span className="num">{r.distanceKm.toLocaleString("fr-FR")} km</span>
          </p>
          {r.promo && <span className="mt-sm inline-block rounded-full bg-accent-soft px-sm py-xs text-caption text-on-accent">{r.promo}</span>}
          <Button variant="secondary" full className="mt-md" onClick={() => setGroupOpen(true)}>
            👥 Commander ensemble
          </Button>
        </section>

        <nav aria-label="Sections du menu" className="sticky top-0 z-10 -mx-gutter mt-md flex gap-sm overflow-x-auto bg-neutral px-gutter py-sm lg:top-16">
          {sections.map((s) => (
            <button key={s.name} type="button" onClick={() => goTo(s.name)} aria-current={active === s.name ? "true" : undefined} className={cn("h-9 shrink-0 rounded-full px-3 text-caption transition-colors", active === s.name ? "bg-ink text-on-ink" : "bg-surface-sunken text-on-surface hover:bg-border")}>
              {s.name}
            </button>
          ))}
        </nav>

        {sections.map((s) => (
          <section key={s.name} id={sectionId(s.name)} className="scroll-mt-16 pt-md lg:scroll-mt-32">
            <h2 className="mb-sm text-h2 text-ink">{s.name}</h2>
            <ul className="divide-y divide-border rounded-lg bg-surface shadow-card">
              {s.items.map((item) => (
                <li key={item.id} className="flex items-center gap-md p-md">
                  <span className="grid size-14 shrink-0 place-items-center rounded-sm bg-surface-sunken text-h2" aria-hidden>{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-label-md text-ink">{item.name}</p>
                    <p className="mt-xs line-clamp-2 text-caption text-muted">{item.description}</p>
                    <Price amount={item.price} className="mt-xs block text-ink" />
                  </div>
                  <QtyStepper name={item.name} qty={qtyOf(item.id)} onChange={(q) => change(item, q)} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Page>

      {count > 0 && cart.restaurantSlug === r.slug && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-gutter pb-[max(1rem,env(safe-area-inset-bottom))] lg:left-60">
          <button type="button" onClick={() => setCartOpen(true)} className="mx-auto flex h-13 w-full max-w-180 items-center justify-between gap-md rounded-full bg-primary-dark px-sheet-padding text-label-md text-on-primary shadow-float hover:bg-ink">
            <span className="flex items-center gap-sm">
              <ShoppingBag className="size-5" aria-hidden />
              Voir le panier · <span className="num">{count}</span> article{count > 1 ? "s" : ""}
            </span>
            <span className="num">{formatFCFA(total)}</span>
          </button>
        </div>
      )}

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
      <GroupOrderSheet open={groupOpen} onClose={() => setGroupOpen(false)} restaurantSlug={r.slug} />
    </>
  );
}
