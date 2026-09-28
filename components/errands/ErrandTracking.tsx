"use client";
import { useEffect } from "react";
import { Clock } from "lucide-react";
import { Timeline } from "./Timeline";
import { Price } from "@/components/Price";
import { ButtonLink } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { ERRAND_STEPS, GAS_ETA } from "@/lib/mock/products";

const STEP_MS = 2500;

/** Order card + timeline that auto-advances to "Livré" (gas & shopping). */
export function ErrandTracking({ orderId }: { orderId: string }) {
  const order = useApp((s) => s.errands.orders.find((o) => o.id === orderId));
  const updateErrandOrder = useApp((s) => s.updateErrandOrder);
  const addNotification = useApp((s) => s.addNotification);
  const step = order?.step ?? 0;
  const last = ERRAND_STEPS.length - 1;

  useEffect(() => {
    if (!order || step >= last) return;
    const t = setTimeout(() => {
      updateErrandOrder(order.id, { step: step + 1 });
      if (step + 1 === last) addNotification({ kind: "order", title: "Commande livrée", body: `${order.title} · livrée ✓` });
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [order, step, last, updateErrandOrder, addNotification]);

  if (!order) return null;
  const done = step >= last;
  return (
    <section className="rounded-lg bg-surface p-md shadow-card" aria-live="polite">
      <div className="mb-md flex items-start justify-between gap-md">
        <div className="min-w-0">
          <h2 className="text-h3 text-ink">{done ? "Commande livrée ✓" : "Commande en cours"}</h2>
          <p className="text-caption text-muted">{order.title}</p>
        </div>
        <Price amount={order.total} />
      </div>
      {!done && (
        <p className="mb-md flex items-center gap-xs text-caption text-muted">
          <Clock className="size-4" aria-hidden /> Arrivée estimée <span className="num">{GAS_ETA}</span>
        </p>
      )}
      <Timeline steps={ERRAND_STEPS} current={step} />
      {done && (
        <ButtonLink href="/activity" variant="secondary" full className="mt-lg">
          Voir dans Activité
        </ButtonLink>
      )}
    </section>
  );
}
