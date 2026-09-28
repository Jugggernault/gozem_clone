import { Price } from "@/components/Price";

/** Subtotal / Livraison / Total rows. testIds prefix-subtotal|delivery|total. */
export function CartSummary({ subtotal, deliveryFee, total, testIdPrefix = "cart" }: { subtotal: number; deliveryFee: number; total: number; testIdPrefix?: string }) {
  return (
    <dl className="flex flex-col gap-sm">
      <div className="flex items-center justify-between text-body-md">
        <dt className="text-muted">Sous-total</dt>
        <dd data-testid={`${testIdPrefix}-subtotal`}><Price amount={subtotal} className="text-body-md" /></dd>
      </div>
      <div className="flex items-center justify-between text-body-md">
        <dt className="text-muted">Livraison</dt>
        <dd data-testid={`${testIdPrefix}-delivery`}><Price amount={deliveryFee} className="text-body-md" /></dd>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-sm">
        <dt className="text-label-md text-ink">Total</dt>
        <dd data-testid={`${testIdPrefix}-total`}><Price amount={total} className="text-ink" /></dd>
      </div>
    </dl>
  );
}
