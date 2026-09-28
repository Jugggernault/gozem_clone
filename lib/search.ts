import type { Place, Product, Restaurant } from "@/lib/types";
import { normalize, searchPlaces } from "@/lib/mock/places";
import { RESTAURANTS } from "@/lib/mock/restaurants";
import { PRODUCTS } from "@/lib/mock/products";
import { SERVICES, type Service } from "@/lib/services-catalog";

export type ProductHit =
  | { kind: "menu"; id: string; name: string; subtitle: string; price: number; emoji: string; href: string }
  | { kind: "product"; id: string; name: string; subtitle: string; price: number; emoji: string; href: string };

export type SearchResults = { places: Place[]; restaurants: Restaurant[]; products: ProductHit[]; services: Service[] };

const has = (hay: string, n: string) => normalize(hay).includes(n);

/** Explorer global search: accent/case-insensitive over places, restaurants, menu items, products and services. */
export function globalSearch(q: string): SearchResults {
  const n = normalize(q);
  if (n.length < 2) return { places: [], restaurants: [], products: [], services: [] };
  const restaurants = RESTAURANTS.filter((r) => has(`${r.name} ${r.cuisine} ${r.categories.join(" ")}`, n) || r.menu.some((m) => has(m.name, n)));
  const menu: ProductHit[] = RESTAURANTS.flatMap((r) =>
    r.menu.filter((m) => has(`${m.name} ${m.section}`, n)).map((m) => ({ kind: "menu" as const, id: `${r.slug}-${m.id}`, name: m.name, subtitle: r.name, price: m.price, emoji: m.emoji, href: `/food/${r.slug}` })),
  );
  const products: ProductHit[] = PRODUCTS.filter((p: Product) => has(`${p.name} ${p.category}`, n)).map((p) => ({ kind: "product" as const, id: p.id, name: p.name, subtitle: `Courses · ${p.unit}`, price: p.price, emoji: p.emoji, href: "/shopping" }));
  const services = SERVICES.filter((s) => has(`${s.name} ${s.keywords}`, n));
  return { places: searchPlaces(q).slice(0, 5), restaurants, products: [...menu, ...products].slice(0, 8), services };
}
