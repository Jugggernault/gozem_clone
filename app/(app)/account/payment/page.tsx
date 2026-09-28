"use client";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { PAYMENT_METHODS } from "@/lib/mock/user";
import { formatFCFA } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const EMOJI = { gozem_money: "💚", cash: "💵", mobile_money: "📱" } as const;

export default function PaymentPage() {
  const method = useApp((s) => s.profile.paymentMethod);
  const balance = useApp((s) => s.wallet.balance);
  const setPaymentMethod = useApp((s) => s.setPaymentMethod);

  return (
    <Page>
      <PageHeader title="Moyens de paiement" subtitle="Moyen utilisé par défaut pour vos trajets et commandes" back="/account" />
      <div role="radiogroup" aria-label="Moyen de paiement par défaut" className="space-y-sm">
        {PAYMENT_METHODS.map((m) => {
          const selected = m.id === method;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setPaymentMethod(m.id);
                toast.success(`${m.label} par défaut ✓`);
              }}
              className={cn("flex w-full items-center gap-md rounded-lg p-3.5 text-left shadow-card", selected ? "bg-primary-soft ring-2 ring-primary-dark" : "bg-surface hover:bg-surface-sunken")}
            >
              <span className="grid size-12 place-items-center rounded-md bg-surface-sunken text-h2" aria-hidden>{EMOJI[m.id]}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-label-md text-ink">{m.label}</span>
                <span className="block text-caption text-muted">{m.id === "gozem_money" ? `${m.description} · ${formatFCFA(balance)}` : m.description}</span>
              </span>
              <span className={cn("grid size-6 place-items-center rounded-full border-2", selected ? "border-primary-dark" : "border-border")} aria-hidden>
                {selected && <span className="size-3 rounded-full bg-primary-dark" />}
              </span>
            </button>
          );
        })}
      </div>
    </Page>
  );
}
