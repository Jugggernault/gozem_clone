"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { Button } from "@/components/ui/button";
import { ErrandTracking } from "@/components/errands/ErrandTracking";
import { useApp } from "@/lib/store";
import { purchase } from "@/lib/store/actions";
import { GAS_DELIVERY_FEE, GAS_ETA, GAS_SIZES } from "@/lib/mock/products";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";

type Kind = "refill" | "new";
const KINDS: { id: Kind; label: string; hint: string }[] = [
  { id: "refill", label: "Recharge", hint: "On échange votre bouteille vide" },
  { id: "new", label: "Bouteille neuve", hint: "Bouteille + gaz" },
];

export default function GasPage() {
  const [sizeId, setSizeId] = useState(GAS_SIZES[0].id);
  const [kind, setKind] = useState<Kind>("refill");
  const [orderId, setOrderId] = useState<string | null>(null);
  const addErrandOrder = useApp((s) => s.addErrandOrder);

  const size = GAS_SIZES.find((s) => s.id === sizeId)!;
  const price = kind === "refill" ? size.refillPrice : size.newPrice;
  const total = price + GAS_DELIVERY_FEE;
  const kindLabel = KINDS.find((k) => k.id === kind)!.label;

  const order = () => {
    const title = `Gaz ${size.label} · ${kindLabel}`;
    const res = purchase(useApp, {
      amount: total,
      label: title,
      category: "gas",
      activity: { type: "order", title, subtitle: `Livraison ${GAS_ETA}`, amount: total, meta: { service: "gas" } },
      notification: { kind: "order", title: "Commande de gaz confirmée", body: `${title} · ${formatFCFA(total)}`, href: "/gas" },
    });
    if (!res.ok) return toast.error(res.error);
    const o = addErrandOrder({ kind: "gas", title, lines: [{ label: title, qty: 1, price }, { label: "Livraison", qty: 1, price: GAS_DELIVERY_FEE }], total });
    setOrderId(o.id);
    toast.success("Commande confirmée");
  };

  return (
    <Page>
      <PageHeader title="Gaz" back="/" />
      {orderId ? (
        <ErrandTracking orderId={orderId} />
      ) : (
        <>
          <section className="rounded-lg bg-primary-soft p-md">
            <p className="text-hero" aria-hidden>🛢️</p>
            <h2 className="mt-sm text-h2 text-ink">Votre bouteille est vide ?</h2>
            <p className="text-body-md text-on-surface">Recevez une bouteille pleine chez vous.</p>
          </section>

          <h3 className="mt-lg mb-sm text-h3 text-ink">Taille</h3>
          <div className="grid grid-cols-3 gap-sm" role="radiogroup" aria-label="Taille de bouteille">
            {GAS_SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={s.id === sizeId}
                onClick={() => setSizeId(s.id)}
                className={cn("min-h-touch-target rounded-lg bg-surface p-md text-label-md text-ink shadow-card", s.id === sizeId && "bg-primary-soft ring-2 ring-primary-dark")}
              >
                {s.label}
              </button>
            ))}
          </div>

          <h3 className="mt-lg mb-sm text-h3 text-ink">Type</h3>
          <div className="flex flex-col gap-sm" role="radiogroup" aria-label="Type de commande">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                role="radio"
                aria-checked={k.id === kind}
                onClick={() => setKind(k.id)}
                className={cn("flex items-center justify-between gap-md rounded-lg bg-surface p-md text-left shadow-card", k.id === kind && "bg-primary-soft ring-2 ring-primary-dark")}
              >
                <span>
                  <span className="block text-label-md text-ink">{k.label}</span>
                  <span className="block text-caption text-muted">{k.hint}</span>
                </span>
                <Price amount={k.id === "refill" ? size.refillPrice : size.newPrice} />
              </button>
            ))}
          </div>

          <dl className="mt-lg divide-y divide-border rounded-lg bg-surface px-md shadow-card">
            <div className="flex items-center justify-between py-md">
              <dt className="text-body-md">Livraison</dt>
              <dd><Price amount={GAS_DELIVERY_FEE} /></dd>
            </div>
            <div className="flex items-center justify-between py-md">
              <dt className="flex items-center gap-xs text-body-md"><Clock className="size-4 text-muted" aria-hidden /> Délai</dt>
              <dd className="num text-label-md">{GAS_ETA}</dd>
            </div>
            <div className="flex items-center justify-between py-md">
              <dt className="text-label-md text-ink">Total</dt>
              <dd data-testid="gas-total"><Price amount={total} /></dd>
            </div>
          </dl>

          <Button full className="mt-lg" onClick={order}>
            Commander · {formatFCFA(total)}
          </Button>
        </>
      )}
    </Page>
  );
}
