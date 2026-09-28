"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Banknote, Eye, EyeOff, Plus, QrCode, ScanLine, Send } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { formatFCFA } from "@/lib/format";
import { dateTimeLabel } from "@/lib/money";
import type { TxCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const TX_EMOJI: Record<TxCategory, string> = {
  ride: "🏍️", food: "🍔", delivery: "📦", transfer: "💸", payment: "🧾", topup: "➕", withdraw: "🏧", gas: "🔥", shopping: "🛒", tip: "🙏", refund: "↩️",
};
const AMOUNTS = [5000, 10000, 25000];
const OPERATORS = ["MTN MoMo", "Moov Money"];

type SheetKind = "receive" | "topup" | "withdraw" | null;

export default function WalletPage() {
  const { balance, transactions, hidden } = useApp((s) => s.wallet);
  const toggle = useApp((s) => s.toggleBalanceHidden);
  const phone = useApp((s) => s.profile.user.phone);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const close = () => setSheet(null);

  const actionCls = "flex flex-col items-center gap-xs text-caption text-on-primary";
  const circle = "grid size-12 place-items-center rounded-full bg-on-primary/15 hover:bg-on-primary/25";

  return (
    <Page>
      <PageHeader title="Gozem Money" />
      <section className="rounded-xl bg-primary-dark p-lg text-on-primary" aria-label="Solde">
        <div className="flex items-center justify-between">
          <p className="text-caption opacity-80">Solde disponible</p>
          <button type="button" onClick={toggle} aria-label={hidden ? "Afficher le solde" : "Masquer le solde"} className="grid size-touch-target place-items-center rounded-full hover:bg-on-primary/15">
            {hidden ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
        </div>
        <p data-testid="wallet-balance" className="mt-xs">
          {hidden ? <span className="num text-price-hero">••••••</span> : <Price amount={balance} hero />}
        </p>
        <div className="mt-lg grid grid-cols-5 gap-xs">
          <Link href="/wallet/send" className={actionCls}><span className={circle}><Send className="size-5" aria-hidden /></span>Envoyer</Link>
          <button type="button" onClick={() => setSheet("receive")} className={actionCls}><span className={circle}><ArrowDownLeft className="size-5" aria-hidden /></span>Recevoir</button>
          <Link href="/wallet/pay" className={actionCls}><span className={circle}><ScanLine className="size-5" aria-hidden /></span>Payer</Link>
          <button type="button" onClick={() => setSheet("topup")} className={actionCls}><span className={circle}><Plus className="size-5" aria-hidden /></span>Recharger</button>
          <button type="button" onClick={() => setSheet("withdraw")} className={actionCls}><span className={circle}><Banknote className="size-5" aria-hidden /></span>Retirer</button>
        </div>
      </section>

      <h2 className="mt-lg mb-sm text-h3 text-ink">Transactions</h2>
      <ul data-testid="tx-list" className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
        {transactions.map((t) => (
          <li key={t.id} className="flex items-center gap-md p-md">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-body-lg" aria-hidden>{TX_EMOJI[t.category]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-md text-ink">{t.label}</p>
              <p className="text-caption text-muted">{dateTimeLabel(t.date)}</p>
            </div>
            <span className={cn("num text-price", t.amount > 0 ? "text-success" : "text-ink")}>
              {t.amount > 0 ? "+" : "−"}{formatFCFA(Math.abs(t.amount))}
            </span>
          </li>
        ))}
      </ul>

      <BottomSheet open={sheet === "receive"} onClose={close} title="Recevoir de l'argent">
        <div className="flex flex-col items-center gap-md py-md">
          <div className="grid size-48 place-items-center rounded-lg border border-border bg-surface" data-testid="receive-qr">
            <QrCode className="size-40 text-ink" strokeWidth={1.2} aria-label="QR code de paiement" />
          </div>
          <p className="text-caption text-muted">Votre numéro Gozem Money</p>
          <p className="num text-h2 text-ink">{phone}</p>
          <Button full variant="secondary" onClick={() => { void navigator.clipboard?.writeText(phone).catch(() => {}); toast.success("Numéro copié ✓"); }}>
            Copier le numéro
          </Button>
        </div>
      </BottomSheet>

      <MoveMoneySheet kind="topup" open={sheet === "topup"} onClose={close} />
      <MoveMoneySheet kind="withdraw" open={sheet === "withdraw"} onClose={close} />
    </Page>
  );
}

function MoveMoneySheet({ kind, open, onClose }: { kind: "topup" | "withdraw"; open: boolean; onClose: () => void }) {
  const credit = useApp((s) => s.credit);
  const debit = useApp((s) => s.debit);
  const [amount, setAmount] = useState(AMOUNTS[1]);
  const [op, setOp] = useState(OPERATORS[0]);
  const topup = kind === "topup";

  const submit = () => {
    if (topup) {
      credit(amount, { label: `Recharge ${op}`, category: "topup" });
      toast.success("Recharge réussie ✓", { description: `+${formatFCFA(amount)} via ${op}` });
    } else {
      const r = debit(amount, { label: `Retrait ${op}`, category: "withdraw" });
      if (!r.ok) return void toast.error(r.error);
      toast.success("Retrait effectué ✓", { description: `${formatFCFA(amount)} vers ${op}` });
    }
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={topup ? "Recharger" : "Retirer"}
      footer={<Button full onClick={submit}>{topup ? "Recharger" : "Retirer"} {formatFCFA(amount)}</Button>}>
      <p className="mb-sm text-caption text-muted">Montant</p>
      <div className="flex flex-wrap gap-sm">
        {AMOUNTS.map((a) => (
          <Button key={a} variant={a === amount ? "chip-selected" : "chip"} onClick={() => setAmount(a)} className="num">{formatFCFA(a)}</Button>
        ))}
      </div>
      <p className="mt-md mb-sm text-caption text-muted">{topup ? "Depuis" : "Vers"}</p>
      <div className="flex flex-wrap gap-sm">
        {OPERATORS.map((o) => (
          <Button key={o} variant={o === op ? "chip-selected" : "chip"} onClick={() => setOp(o)}>
            {topup ? <ArrowDownLeft className="size-4" aria-hidden /> : <ArrowUpRight className="size-4" aria-hidden />}{o}
          </Button>
        ))}
      </div>
    </BottomSheet>
  );
}
