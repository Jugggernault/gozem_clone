"use client";
import { toast } from "sonner";
import { Gift, Star } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { GOWIN_REWARDS, tierFor } from "@/lib/mock/user";
import { dateTimeLabel } from "@/lib/money";
import { cn } from "@/lib/utils";

const pts = (n: number) => n.toLocaleString("fr-FR");

export default function GoWinPage() {
  const { total, history } = useApp((s) => s.points);
  const redeemPoints = useApp((s) => s.redeemPoints);
  const addNotification = useApp((s) => s.addNotification);
  const t = tierFor(total);

  const redeem = (r: (typeof GOWIN_REWARDS)[number]) => {
    const res = redeemPoints(r.points, `${pts(r.points)} pts → ${r.title}`);
    if (!res.ok) return void toast.error(res.error);
    addNotification({ kind: "gowin", title: "Récompense activée 🎁", body: r.title, href: "/gowin" });
    toast.success("Récompense activée ✓", { description: `${r.title} · −${pts(r.points)} pts` });
  };

  return (
    <Page>
      <PageHeader title="GoWin" subtitle="Vos points de fidélité" back={true} />
      <section className="rounded-xl bg-ink p-lg text-on-ink">
        <p className="flex items-center gap-sm text-caption opacity-80">Niveau <span className="rounded-full bg-accent px-sm text-caption text-on-accent">{t.tier}</span></p>
        <p data-testid="points-total" className="mt-sm flex items-center gap-sm">
          <Star className="size-7 text-accent" fill="currentColor" aria-hidden />
          <span className="num text-price-hero">{pts(total)}</span>
          <span className="text-body-lg opacity-80">points</span>
        </p>
        <div className="mt-md h-2 overflow-hidden rounded-full bg-on-ink/15" role="progressbar" aria-label={`Progression vers ${t.next ?? t.tier}`} aria-valuenow={Math.round(t.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.round(t.progress * 100)}%` }} />
        </div>
        <p className="mt-sm text-caption opacity-80">
          {t.next ? <>Plus que <span className="num">{pts(t.toNext)}</span> points pour passer {t.next}</> : "Niveau maximum atteint"}
        </p>
      </section>

      <h2 className="mt-lg mb-sm text-h3 text-ink">Récompenses</h2>
      <ul className="flex flex-col gap-sm">
        {GOWIN_REWARDS.map((r) => (
          <li key={r.id} className="flex items-center gap-md rounded-lg bg-surface p-md shadow-card">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-on-accent"><Gift className="size-6" aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <p className="text-label-md text-ink"><span className="num">{pts(r.points)}</span> pts → {r.title}</p>
              <p className="text-caption text-muted">{r.description}</p>
            </div>
            <Button variant="secondary" disabled={total < r.points} onClick={() => redeem(r)} aria-label={`Échanger ${pts(r.points)} pts contre ${r.title}`}>Échanger</Button>
          </li>
        ))}
      </ul>

      <h2 className="mt-lg mb-sm text-h3 text-ink">Historique des points</h2>
      <ul data-testid="points-history" className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
        {history.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-md p-md">
            <div className="min-w-0">
              <p className="truncate text-label-md text-ink">{h.label}</p>
              <p className="text-caption text-muted">{dateTimeLabel(h.date)}</p>
            </div>
            <span className={cn("num text-price", h.points > 0 ? "text-success" : "text-ink")}>{h.points > 0 ? "+" : "−"}{pts(Math.abs(h.points))} pts</span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
