"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Search, Star } from "lucide-react";
import { Page } from "@/components/Page";
import { RestaurantImage } from "@/components/food/RestaurantImage";
import { buttonClass } from "@/components/ui/button";
import { formatFCFA } from "@/lib/format";
import { FOOD_CATEGORIES, RESTAURANTS } from "@/lib/mock/restaurants";
import { normalize } from "@/lib/mock/places";
import type { FoodCategory } from "@/lib/types";

export default function FoodPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FoodCategory | null>(null);
  const nq = normalize(q);
  const list = RESTAURANTS.filter(
    (r) => (!cat || r.categories.includes(cat)) && (!nq || normalize(`${r.name} ${r.cuisine} ${r.menu.map((m) => m.name).join(" ")}`).includes(nq)),
  );

  return (
    <Page>
      <Link href="/" aria-label="Retour" className="my-md grid size-touch-target place-items-center rounded-full bg-surface text-ink shadow-card hover:bg-surface-sunken">
        <ArrowLeft className="size-5" aria-hidden />
      </Link>
      <h1 className="text-h1 text-ink">Que voulez-vous manger ?</h1>
      <p className="mb-md text-caption text-muted">Livraison à Maison (Abomey-Calavi)</p>
      <label className="flex h-13 items-center gap-sm rounded-md bg-surface-sunken px-md">
        <Search className="size-5 text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Restaurant, plat, cuisine…"
          aria-label="Rechercher un restaurant"
          className="h-full flex-1 bg-transparent text-body-lg outline-none placeholder:text-muted"
        />
      </label>

      <div className="-mx-gutter mt-md flex gap-sm overflow-x-auto px-gutter pb-xs" role="group" aria-label="Catégories">
        {FOOD_CATEGORIES.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)} className={buttonClass(cat === c ? "chip-selected" : "chip", false, "shrink-0")}>
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-lg grid gap-md sm:grid-cols-2">
        {list.map((r) => (
          <li key={r.slug}>
            <Link href={`/food/${r.slug}`} data-testid="restaurant-card" className="block overflow-hidden rounded-lg bg-surface shadow-card transition-transform hover:-translate-y-0.5">
              <div className="relative">
                <RestaurantImage src={r.image} emoji={r.emoji} alt={r.name} className="aspect-video w-full" />
                {r.promo && <span className="absolute left-sm top-sm rounded-full bg-accent-soft px-sm py-xs text-caption text-on-accent">{r.promo}</span>}
              </div>
              <div className="p-md">
                <div className="flex items-center justify-between gap-sm">
                  <h2 className="truncate text-h3 text-ink">{r.name}</h2>
                  <span className="flex shrink-0 items-center gap-xs text-caption text-on-surface">
                    <Star className="size-4 text-accent" fill="currentColor" aria-hidden />
                    <span className="num">{r.rating.toFixed(1)}</span>
                  </span>
                </div>
                <p className="mt-xs text-caption text-muted">
                  <span className="num">{r.timeMin}</span> · Livraison <span className="num">{formatFCFA(r.deliveryFee)}</span> · <span className="num">{r.distanceKm.toLocaleString("fr-FR")} km</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && (
        <div className="mt-lg rounded-lg border border-border bg-surface p-xl text-center">
          <p className="text-body-lg text-muted">Aucun restaurant ne correspond à votre recherche.</p>
        </div>
      )}
    </Page>
  );
}
