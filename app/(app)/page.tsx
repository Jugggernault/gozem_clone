"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Briefcase, CircleHelp, House, Plane, Search } from "lucide-react";
import { Page } from "@/components/Page";
import { ComingSoon } from "@/components/ComingSoon";
import { BellButton } from "@/components/shell/BellButton";
import { Avatar } from "@/components/shell/Avatar";
import { HOME_PROMOS } from "@/lib/mock/promos";
import { SERVICES } from "@/lib/services-catalog";
import { useApp } from "@/lib/store";

const QUICK = [
  { placeId: "maison", label: "Maison", icon: House },
  { placeId: "travail", label: "Travail", icon: Briefcase },
  { placeId: "aeroport", label: "Aéroport", icon: Plane },
];

export default function Home() {
  const router = useRouter();
  const firstName = useApp((s) => s.profile.user.firstName);
  const startRide = useApp((s) => s.startRide);
  const [soon, setSoon] = useState<string | null>(null);

  const goTo = (placeId: string) => {
    startRide(placeId);
    router.push(`/ride/options?to=${placeId}`);
  };

  return (
    <Page>
      <header className="flex items-center justify-between gap-md py-md">
        <div className="min-w-0">
          <h1 className="text-h1 text-ink">Bonjour {firstName} 👋</h1>
          <p className="text-caption text-muted">📍 Cotonou</p>
        </div>
        <div className="flex items-center gap-sm lg:hidden">
          <BellButton />
          <Avatar />
        </div>
      </header>

      <Link href="/assistant" className="flex h-11 w-fit items-center gap-xs rounded-full bg-primary-soft px-md text-label-md text-primary-dark hover:bg-surface-sunken lg:hidden">
        ✨ Gozem Assistant
      </Link>

      <h2 className="mt-lg text-h2 text-ink">Que voulez-vous faire ?</h2>
      <Link href="/ride/search" className="mt-md flex items-center gap-md rounded-lg bg-surface p-md shadow-card hover:bg-surface-sunken">
        <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary-dark">
          <Search className="size-6" aria-hidden />
        </span>
        <span className="flex-1 text-h3 text-ink">Où allez-vous ?</span>
        <ArrowRight className="size-5 text-muted" aria-hidden />
      </Link>

      <div className="mt-sm flex gap-sm overflow-x-auto pb-xs">
        {QUICK.map(({ placeId, label, icon: Icon }) => (
          <button
            key={placeId}
            type="button"
            onClick={() => goTo(placeId)}
            className="flex h-touch-target shrink-0 items-center gap-sm rounded-full bg-surface px-md text-label-md text-ink shadow-card hover:bg-surface-sunken"
          >
            <Icon className="size-4 text-primary-dark" aria-hidden /> {label}
          </button>
        ))}
      </div>

      <section aria-label="Services" className="mt-lg grid grid-cols-4 gap-sm">
        {SERVICES.map((s) => {
          const inner = (
            <>
              <span className="grid size-12 place-items-center rounded-md bg-surface-sunken text-h2" aria-hidden>{s.emoji}</span>
              <span className="text-caption text-ink">{s.name}</span>
              <span className="text-caption text-muted">{s.description}</span>
            </>
          );
          const cls = "flex flex-col items-center gap-xs rounded-lg bg-surface p-sm text-center shadow-card hover:bg-surface-sunken";
          return s.href ? (
            <Link key={s.id} href={s.href} className={cls} data-testid={`service-${s.id}`}>{inner}</Link>
          ) : (
            <button key={s.id} type="button" onClick={() => setSoon(s.name)} className={cls} data-testid={`service-${s.id}`}>{inner}</button>
          );
        })}
      </section>

      <div className="mt-lg flex items-center justify-between">
        <h2 className="text-h3 text-ink">Offres du moment</h2>
        <Link href="/promotions" className="text-label-md text-primary-dark">Tout voir</Link>
      </div>
      <div data-testid="promo-carousel" className="-mx-gutter mt-sm flex snap-x snap-mandatory gap-sm overflow-x-auto px-gutter pb-sm">
        {HOME_PROMOS.map((p) => (
          <Link key={p.id} href={p.href} data-testid="promo-card" className="flex w-64 shrink-0 snap-start flex-col gap-sm rounded-lg bg-surface p-md shadow-card hover:bg-surface-sunken">
            <div className="flex items-center justify-between">
              <span className="text-h2" aria-hidden>{p.emoji}</span>
              <span className="rounded-full bg-accent-soft px-sm py-xs text-caption text-on-accent">{p.badge}</span>
            </div>
            <p className="text-label-md text-ink">{p.title}</p>
            <p className="text-caption text-muted">{p.description}</p>
          </Link>
        ))}
      </div>

      <Link href="/help" className="mt-md flex items-center gap-sm text-caption text-muted">
        <CircleHelp className="size-4" aria-hidden /> Besoin d&apos;aide ? Centre d&apos;aide Gozem
      </Link>

      <ComingSoon open={soon !== null} onClose={() => setSoon(null)} service={soon ?? undefined} />
    </Page>
  );
}
