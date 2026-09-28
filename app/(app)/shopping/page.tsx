"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { Button } from "@/components/ui/button";
import { ErrandTracking } from "@/components/errands/ErrandTracking";
import { selectShoppingSubtotal, useApp } from "@/lib/store";
import { purchase } from "@/lib/store/actions";
import { PRODUCTS, SHOPPING_CATEGORIES, SHOPPING_DELIVERY_FEE, getProduct } from "@/lib/mock/products";
import type { ShoppingCategory } from "@/lib/types";
import { formatFCFA } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";

export default function ShoppingPage() {
  const [category, setCategory] = useState<ShoppingCategory | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const cart = useApp((s) => s.errands.shoppingCart);
  const subtotal = useApp(selectShoppingSubtotal);
  const setQty = useApp((s) => s.setShoppingQty);
  const clearCart = useApp((s) => s.clearShoppingCart);
  const addErrandOrder = useApp((s) => s.addErrandOrder);

  const qtyOf = (id: string) => cart.find((l) => l.productId === id)?.qty ?? 0;
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const total = subtotal + SHOPPING_DELIVERY_FEE;
  const products = category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;

  const checkout = () => {
    const lines = cart.map((l) => {
      const p = getProduct(l.productId)!;
      return { label: p.name, qty: l.qty, price: p.price };
    });
    const title = `Courses · ${count} article${count > 1 ? "s" : ""}`;
    const res = purchase(useApp, {
      amount: total,
      label: "Courses Gozem",
      category: "shopping",
      activity: { type: "order", title: "Courses Gozem", subtitle: lines.map((l) => `${l.qty}× ${l.label}`).join(", "), amount: total, meta: { service: "shopping" } },
      notification: { kind: "order", title: "Courses confirmées", body: `${title} · ${formatFCFA(total)}`, href: "/shopping" },
    });
    if (!res.ok) return toast.error(res.error);
    const o = addErrandOrder({ kind: "shopping", title, lines: [...lines, { label: "Livraison", qty: 1, price: SHOPPING_DELIVERY_FEE }], total });
    clearCart();
    setOrderId(o.id);
    toast.success("Commande confirmée");
  };

  if (orderId)
    return (
      <Page>
        <PageHeader title="Courses" back="/" />
        <ErrandTracking orderId={orderId} />
      </Page>
    );

  return (
    <Page className={count ? "pb-48" : undefined}>
      <PageHeader title="Courses" subtitle="Livré chez vous en 30-45 min" back="/" />
      <div className="-mx-gutter flex gap-sm overflow-x-auto px-gutter pb-sm" role="tablist" aria-label="Catégories">
        {[null, ...SHOPPING_CATEGORIES].map((c) => (
          <button key={c ?? "all"} type="button" role="tab" aria-selected={category === c} onClick={() => setCategory(c)} className={buttonClass(category === c ? "chip-selected" : "chip", false, "shrink-0")}>
            {c ?? "Tout"}
          </button>
        ))}
      </div>

      <ul className="mt-md grid grid-cols-2 gap-sm sm:grid-cols-3">
        {products.map((p) => {
          const qty = qtyOf(p.id);
          return (
            <li key={p.id} data-testid="product-card" className="flex flex-col rounded-lg bg-surface p-md shadow-card">
              <span className="grid h-20 place-items-center rounded-md bg-surface-sunken text-hero" aria-hidden>{p.emoji}</span>
              <p className="mt-sm text-label-md text-ink">{p.name}</p>
              <p className="text-caption text-muted">{p.unit}</p>
              <div className="mt-sm flex flex-1 items-end justify-between gap-sm">
                <Price amount={p.price} />
                {qty === 0 ? (
                  <button type="button" aria-label={`Ajouter ${p.name}`} onClick={() => setQty(p.id, 1)} className="grid size-touch-target shrink-0 place-items-center rounded-full bg-primary-dark text-on-primary">
                    <Plus className="size-5" />
                  </button>
                ) : null}
              </div>
              {qty > 0 && (
                <div className="mt-sm flex items-center justify-between rounded-full bg-surface-sunken">
                  <button type="button" aria-label={`Retirer ${p.name}`} onClick={() => setQty(p.id, qty - 1)} className="grid size-touch-target place-items-center rounded-full text-ink">
                    <Minus className="size-4" />
                  </button>
                  <span className="num text-label-md" aria-label={`Quantité ${p.name}`}>{qty}</span>
                  <button type="button" aria-label={`Ajouter ${p.name}`} onClick={() => setQty(p.id, qty + 1)} className="grid size-touch-target place-items-center rounded-full text-ink">
                    <Plus className="size-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-md z-30 px-gutter lg:left-60">
          <section className="mx-auto max-w-180 rounded-lg bg-surface p-md shadow-sheet" aria-label="Panier">
            <div className="flex items-center justify-between text-caption text-muted">
              <span>Sous-total · {count} article{count > 1 ? "s" : ""}</span>
              <Price amount={subtotal} className="text-caption" />
            </div>
            <div className="mt-xs flex items-center justify-between text-caption text-muted">
              <span>Livraison</span>
              <Price amount={SHOPPING_DELIVERY_FEE} className="text-caption" />
            </div>
            <Button full className="mt-sm" onClick={checkout}>
              Commander · {formatFCFA(total)}
            </Button>
          </section>
        </div>
      )}
    </Page>
  );
}
