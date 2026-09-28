"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { AlertCircle, Loader2, MapPin, Wallet } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { SuccessCheck } from "@/components/SuccessCheck";
import { Button, ButtonLink } from "@/components/ui/button";
import { CartSummary } from "@/components/food/CartSummary";
import { formatFCFA } from "@/lib/format";
import { findMenuItem, getRestaurant } from "@/lib/mock/restaurants";
import { sleep } from "@/lib/services/mock";
import { purchase, selectCartTotals, useApp } from "@/lib/store";
import { uid } from "@/lib/store/types";

const DELIVERY_ADDRESS = "Maison (Abomey-Calavi)";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useApp((s) => s.food.cart);
  const balance = useApp((s) => s.wallet.balance);
  const totals = useApp(useShallow(selectCartTotals));
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const slug = cart.restaurantSlug;
  const restaurant = slug ? getRestaurant(slug) : undefined;

  if (status === "success")
    return (
      <Page className="grid min-h-[70dvh] place-items-center">
        <div className="flex flex-col items-center gap-sm">
          <SuccessCheck label="Paiement réussi" />
          <p className="text-body-md text-muted">Redirection vers le suivi de commande…</p>
        </div>
      </Page>
    );

  if (!slug || !restaurant || cart.items.length === 0)
    return (
      <Page>
        <PageHeader title="Paiement" back="/food" />
        <div className="mt-lg flex flex-col items-center gap-md rounded-lg border border-border bg-surface p-xl text-center">
          <p className="text-body-lg text-muted">Votre panier est vide.</p>
          <ButtonLink href="/food">Voir les restaurants</ButtonLink>
        </div>
      </Page>
    );

  const pay = async () => {
    setError(null);
    const { total, subtotal, deliveryFee } = totals;
    if (!useApp.getState().canAfford(total)) {
      setError(`Solde insuffisant : il vous manque ${formatFCFA(total - useApp.getState().wallet.balance)}. Rechargez votre Gozem Money.`);
      return;
    }
    setStatus("processing");
    await sleep(1200);
    if (useApp.getState().demo.simulateError) {
      setStatus("idle");
      setError("Une erreur est survenue. Réessayez.");
      return;
    }
    const id = uid("cmd");
    const count = cart.items.reduce((n, l) => n + l.qty, 0);
    const res = purchase(useApp, {
      amount: total,
      label: `Commande ${restaurant.name}`,
      category: "food",
      activity: {
        id,
        type: "order",
        title: restaurant.name,
        subtitle: `${count} articles · Livraison ${DELIVERY_ADDRESS}`,
        amount: total,
        status: "in_progress",
        meta: { orderId: id, "Sous-total": subtotal, Livraison: deliveryFee, Total: total },
      },
      notification: { kind: "order", title: "Commande confirmée", body: `${restaurant.name} prépare votre commande (${formatFCFA(total)}).`, href: `/food/order/${id}` },
    });
    if (!res.ok) {
      setStatus("idle");
      setError(res.error);
      return;
    }
    const s = useApp.getState();
    s.addOrder({ id, restaurantSlug: slug, items: cart.items, subtotal, deliveryFee, total, address: DELIVERY_ADDRESS });
    setStatus("success");
    toast.success("Paiement réussi ✓");
    s.clearCart();
    setTimeout(() => router.push(`/food/order/${id}`), 1200);
  };

  const processing = status === "processing";
  return (
    <Page>
      <PageHeader title="Paiement" subtitle={restaurant.name} back={`/food/${slug}`} />

      <section className="rounded-lg bg-surface p-md shadow-card">
        <p className="text-caption text-muted">Adresse de livraison</p>
        <p className="mt-xs flex items-center gap-sm text-label-md text-ink"><MapPin className="size-5 text-primary" aria-hidden /> {DELIVERY_ADDRESS}</p>
      </section>

      <section className="mt-sm rounded-lg bg-surface p-md shadow-card">
        <p className="text-caption text-muted">Paiement</p>
        <div className="mt-xs flex items-center justify-between gap-sm">
          <p className="flex items-center gap-sm text-label-md text-ink"><Wallet className="size-5 text-primary" aria-hidden /> Gozem Money</p>
          <p className="text-caption text-muted">Solde <Price amount={balance} className="text-caption" /></p>
        </div>
      </section>

      <section className="mt-sm rounded-lg bg-surface p-md shadow-card">
        <ul className="mb-md flex flex-col gap-xs">
          {cart.items.map((l) => {
            const item = findMenuItem(slug, l.itemId);
            return item ? (
              <li key={l.itemId} className="flex justify-between text-body-md text-on-surface">
                <span><span className="num text-muted">{l.qty}×</span> {item.name}</span>
                <Price amount={item.price * l.qty} className="text-body-md" />
              </li>
            ) : null;
          })}
        </ul>
        <CartSummary {...totals} testIdPrefix="checkout" />
      </section>

      {error && (
        <p role="alert" className="mt-md flex items-start gap-sm rounded-lg border border-error bg-surface p-md text-body-md text-error">
          <AlertCircle className="mt-xs size-5 shrink-0" aria-hidden /> {error}
        </p>
      )}

      <Button full className="mt-lg" onClick={pay} disabled={processing} aria-busy={processing}>
        {processing ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden /> Paiement en cours…
          </>
        ) : (
          <>Payer · {formatFCFA(totals.total)}</>
        )}
      </Button>
    </Page>
  );
}
