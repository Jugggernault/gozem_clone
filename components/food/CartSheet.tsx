"use client";
import { useShallow } from "zustand/react/shallow";
import { BottomSheet } from "@/components/BottomSheet";
import { Price } from "@/components/Price";
import { ButtonLink } from "@/components/ui/button";
import { formatFCFA } from "@/lib/format";
import { selectCartTotals, useApp } from "@/lib/store";
import { findMenuItem, getRestaurant } from "@/lib/mock/restaurants";
import { CartSummary } from "./CartSummary";
import { QtyStepper } from "./QtyStepper";

export function CartSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useApp((s) => s.food.cart);
  const setCartQty = useApp((s) => s.setCartQty);
  const totals = useApp(useShallow(selectCartTotals));
  const slug = cart.restaurantSlug;
  const restaurant = slug ? getRestaurant(slug) : undefined;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Votre panier"
      footer={
        cart.items.length > 0 && (
          <ButtonLink href="/food/checkout" full>
            Commander · {formatFCFA(totals.total)}
          </ButtonLink>
        )
      }
    >
      {!slug || cart.items.length === 0 ? (
        <p className="py-lg text-center text-body-md text-muted">Votre panier est vide.</p>
      ) : (
        <>
          <p className="mb-md text-caption text-muted">{restaurant?.name}</p>
          <ul className="mb-md divide-y divide-border">
            {cart.items.map((l) => {
              const item = findMenuItem(slug, l.itemId);
              if (!item) return null;
              return (
                <li key={l.itemId} className="flex items-center gap-md py-sm">
                  <span className="text-h3" aria-hidden>{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-md text-ink">{item.name}</p>
                    <Price amount={item.price * l.qty} className="text-caption text-muted" />
                  </div>
                  <QtyStepper name={item.name} qty={l.qty} onChange={(q) => setCartQty(slug, l.itemId, q)} />
                </li>
              );
            })}
          </ul>
          <CartSummary {...totals} />
        </>
      )}
    </BottomSheet>
  );
}
