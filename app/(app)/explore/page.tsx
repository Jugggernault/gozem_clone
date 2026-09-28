"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ChevronRight, MapPin, Search, Star } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/States";
import { formatFCFA } from "@/lib/format";
import { globalSearch } from "@/lib/search";
import { RESTAURANTS } from "@/lib/mock/restaurants";
import { useApp } from "@/lib/store";

const SUGGESTIONS = ["burger", "aéroport", "pizza", "riz", "colis"];
const row = "flex min-h-14 items-center gap-md px-md py-sm hover:bg-surface-sunken";
const list = "divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-lg">
      <h2 className="mb-sm text-h3 text-ink">{title}</h2>
      <ul className={list}>{children}</ul>
    </section>
  );
}

function Explorer() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const startRide = useApp((s) => s.startRide);
  const r = useMemo(() => globalSearch(q), [q]);
  const any = r.places.length + r.restaurants.length + r.products.length + r.services.length > 0;

  return (
    <Page>
      <PageHeader title="Explorer" />
      <label className="flex h-13 items-center gap-sm rounded-md bg-surface-sunken px-md">
        <Search className="size-5 text-muted" aria-hidden />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Lieux, restaurants, produits…"
          aria-label="Rechercher sur Gozem"
          className="h-full flex-1 bg-transparent text-body-lg outline-none placeholder:text-muted"
        />
      </label>

      {q.trim().length < 2 ? (
        <>
          <div className="mt-md flex flex-wrap gap-sm">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => setQ(s)} className="h-9 rounded-full bg-surface-sunken px-3 text-caption text-on-surface hover:bg-border">
                {s}
              </button>
            ))}
          </div>
          <Section title="Restaurants populaires">
            {RESTAURANTS.slice(0, 4).map((x) => (
              <li key={x.slug}>
                <Link href={`/food/${x.slug}`} className={row}>
                  <span className="text-h2" aria-hidden>{x.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-label-md text-ink">{x.name}</span>
                    <span className="block text-caption text-muted">{x.cuisine} · {x.timeMin}</span>
                  </span>
                  <ChevronRight className="size-5 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </Section>
        </>
      ) : !any ? (
        <EmptyState icon={<Search className="size-6" aria-hidden />} title={`Aucun résultat pour « ${q} »`} body="Essayez un lieu, un restaurant ou un produit." />
      ) : (
        <>
          {r.places.length > 0 && (
            <Section title="Lieux">
              {r.places.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      startRide(p.id);
                      router.push(`/ride/options?to=${p.id}`);
                    }}
                    className={`${row} w-full text-left`}
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-surface-sunken text-primary-dark"><MapPin className="size-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-label-md text-ink">{p.name}</span>
                      <span className="block text-caption text-muted">{p.subtitle}</span>
                    </span>
                    <span className="num text-caption text-muted">{p.distanceKm.toLocaleString("fr-FR")} km</span>
                  </button>
                </li>
              ))}
            </Section>
          )}
          {r.restaurants.length > 0 && (
            <Section title="Restaurants">
              {r.restaurants.map((x) => (
                <li key={x.slug}>
                  <Link href={`/food/${x.slug}`} className={row}>
                    <span className="text-h2" aria-hidden>{x.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-label-md text-ink">{x.name}</span>
                      <span className="flex items-center gap-xs text-caption text-muted">
                        <Star className="size-3 text-accent" fill="currentColor" aria-hidden /> {x.rating.toLocaleString("fr-FR")} · {x.cuisine} · {x.timeMin}
                      </span>
                    </span>
                    <ChevronRight className="size-5 text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </Section>
          )}
          {(r.products.length > 0 || r.services.length > 0) && (
            <Section title="Produits/Services">
              {r.services.map((s) => (
                <li key={s.id}>
                  <Link href={s.href ?? "/"} className={row}>
                    <span className="text-h2" aria-hidden>{s.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-label-md text-ink">{s.name}</span>
                      <span className="block text-caption text-muted">Service · {s.description}</span>
                    </span>
                    <ChevronRight className="size-5 text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
              {r.products.map((p) => (
                <li key={p.id}>
                  <Link href={p.href} className={row}>
                    <span className="text-h2" aria-hidden>{p.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-label-md text-ink">{p.name}</span>
                      <span className="block text-caption text-muted">{p.subtitle}</span>
                    </span>
                    <span className="num text-caption text-ink">{formatFCFA(p.price)}</span>
                  </Link>
                </li>
              ))}
            </Section>
          )}
        </>
      )}
    </Page>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <Explorer />
    </Suspense>
  );
}
