"use client";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { PROMOS } from "@/lib/mock/promos";
import { useApp } from "@/lib/store";

export default function PromotionsPage() {
  const activePromoId = useApp((s) => s.ride.activePromoId);
  const setRide = useApp((s) => s.setRide);

  return (
    <Page>
      <PageHeader title="Offres pour vous" subtitle={`${PROMOS.length} offres disponibles`} back />
      <ul className="flex flex-col gap-sm">
        {PROMOS.map((p) => {
          const active = p.appliesTo === "ride" && activePromoId === p.id;
          return (
            <li key={p.id} className="flex items-start gap-md rounded-lg bg-surface p-md shadow-card">
              <span className="grid size-12 shrink-0 place-items-center rounded-md bg-accent-soft text-h2" aria-hidden>
                {p.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-accent-soft px-1.5 text-caption text-on-accent">{p.badge}</span>
                <h2 className="mt-xs text-h3 text-ink">{p.title}</h2>
                <p className="text-caption text-muted">{p.description}</p>
                <p className="num mt-xs text-caption text-muted">Code {p.code}</p>
                <div className="mt-sm flex flex-wrap gap-sm">
                  {p.appliesTo === "ride" ? (
                    active ? (
                      <>
                        <span className="inline-flex h-9 items-center gap-xs rounded-full bg-primary-soft px-3 text-caption text-success">
                          <Check className="size-4" aria-hidden /> Activée
                        </span>
                        <ButtonLink variant="chip" href="/ride/search">Réserver une course</ButtonLink>
                      </>
                    ) : (
                      <Button
                        variant="chip-selected"
                        onClick={() => {
                          setRide({ activePromoId: p.id });
                          toast("Promo activée ✓ — appliquée à votre prochaine course");
                        }}
                      >
                        Activer
                      </Button>
                    )
                  ) : (
                    p.href && <ButtonLink variant="chip" href={p.href}>En profiter</ButtonLink>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
