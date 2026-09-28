"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Star } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { StubPage } from "@/components/StubPage";
import { ButtonLink } from "@/components/ui/button";
import { ORDER_STEPS, getRestaurant } from "@/lib/mock/restaurants";
import { COURIER } from "@/lib/mock/vehicles";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEP_MS = 3000; // each timeline step advances on its own
const LAST = ORDER_STEPS.length - 1;
const ETA_MIN = [25, 20, 15, 8, 0];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const order = useApp((s) => s.food.orders.find((o) => o.id === id));
  const [now, setNow] = useState(() => Date.now());

  const step = order ? Math.max(order.step, Math.min(LAST, Math.floor((now - Date.parse(order.createdAt)) / STEP_MS))) : 0;
  const delivered = step >= LAST;

  useEffect(() => {
    if (delivered) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [delivered]);

  // Persist progress; on delivery close the activity entry and notify.
  useEffect(() => {
    if (!order || step <= order.step) return;
    const s = useApp.getState();
    s.updateOrder(order.id, { step });
    if (step === LAST) {
      s.updateActivity(order.id, { status: "completed" });
      s.addNotification({ kind: "order", title: "Commande livrée", body: `Votre commande ${getRestaurant(order.restaurantSlug)?.name ?? ""} a été livrée. Bon appétit !`, href: `/food/order/${order.id}` });
      toast.success("Commande livrée ✓");
    }
  }, [order, step]);

  if (!order) return <StubPage title="Commande introuvable" back="/food" />;
  const restaurant = getRestaurant(order.restaurantSlug);

  return (
    <Page>
      <PageHeader title={delivered ? "Commande livrée 🎉" : "Suivi de commande"} subtitle={`${restaurant?.name ?? ""} · ${order.address}`} back="/" />

      <section className="rounded-lg bg-ink p-md text-on-ink">
        <p className="text-caption opacity-80">{delivered ? "Livré" : "Arrivée estimée"}</p>
        <p className={delivered ? "text-h1" : "num text-price-hero"}>{delivered ? "Bon appétit !" : `${ETA_MIN[step]} min`}</p>
      </section>

      <ol data-testid="order-timeline" className="mt-md rounded-lg bg-surface p-md shadow-card">
        {ORDER_STEPS.map((label, i) => {
          const state = i < step || delivered ? "done" : i === step ? "current" : "pending";
          return (
            <li key={label} data-testid={`step-${label}`} data-state={state} className="relative flex gap-md pb-md last:pb-0">
              {i < LAST && <span className={cn("absolute left-3 top-7 h-[calc(100%-1.5rem)] w-0.5 -translate-x-1/2", i < step ? "bg-primary" : "bg-border")} aria-hidden />}
              <span className={cn("relative grid size-6 shrink-0 place-items-center rounded-full", state === "done" ? "bg-primary text-on-primary" : state === "current" ? "bg-primary-soft" : "border-2 border-border bg-surface")}>
                {state === "done" && <Check className="size-4" aria-hidden />}
                {state === "current" && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-primary animate-halo" aria-hidden />
                    <span className="size-2.5 rounded-full bg-primary" aria-hidden />
                  </>
                )}
              </span>
              <div>
                <p className={cn("text-label-md", state === "pending" ? "text-muted" : "text-ink")}>{label}</p>
                {state === "current" && <p className="text-caption text-muted">En cours…</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {step >= 2 && (
        <section className="mt-md flex items-center gap-md rounded-lg bg-surface p-md shadow-card">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-label-md text-primary-dark">{COURIER.avatar}</span>
          <div className="min-w-0 flex-1">
            <p className="text-label-md text-ink">{COURIER.firstName}, votre coursier</p>
            <p className="flex items-center gap-xs text-caption text-muted">
              <Star className="size-4 text-accent" fill="currentColor" aria-hidden /> <span className="num">{COURIER.rating}</span> · {COURIER.vehicle} · <span className="num">{COURIER.plate}</span>
            </p>
          </div>
        </section>
      )}

      <section className="mt-md flex items-center justify-between rounded-lg bg-surface p-md shadow-card">
        <p className="text-body-md text-muted">Payé avec Gozem Money</p>
        <Price amount={order.total} className="text-ink" />
      </section>

      <ButtonLink href="/" variant={delivered ? "primary" : "secondary"} full className="mt-lg">
        Retour à l&apos;accueil
      </ButtonLink>
    </Page>
  );
}
