"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, ChevronRight, Inbox } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/States";
import { useMockService } from "@/lib/hooks/useMockService";
import { useApp } from "@/lib/store";
import { ACTIVITY_EMOJI, DATE_GROUPS, dateGroup, dateTimeLabel, formatTime } from "@/lib/money";
import type { ActivityEntry, ActivityType } from "@/lib/types";

const TABS: { id: "all" | ActivityType; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "ride", label: "Trajets" },
  { id: "order", label: "Commandes" },
  { id: "delivery", label: "Livraisons" },
  { id: "payment", label: "Paiements" },
];

export default function ActivityPage() {
  const entries = useApp((s) => s.activity.entries);
  const removeActivity = useApp((s) => s.removeActivity);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const svc = useMockService(() => true, [300, 600]);

  const visible = entries.filter((e) => tab === "all" || e.type === tab);
  const groups = DATE_GROUPS.map((g) => ({
    label: g,
    items: visible
      .filter((e) => dateGroup(e.date, e.status === "scheduled") === g)
      .sort((a, b) => (g === "À venir" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))),
  })).filter((g) => g.items.length);

  const cancel = (e: ActivityEntry) => {
    removeActivity(e.id);
    toast.success("Trajet annulé ✓", { description: e.title });
  };

  return (
    <Page>
      <PageHeader title="Activité" />
      <div role="tablist" aria-label="Filtrer l'activité" className="-mx-gutter flex gap-sm overflow-x-auto px-gutter pb-sm">
        {TABS.map((t) => (
          <Button key={t.id} role="tab" aria-selected={tab === t.id} variant={tab === t.id ? "chip-selected" : "chip"} onClick={() => setTab(t.id)} className="shrink-0">
            {t.label}
          </Button>
        ))}
      </div>

      {svc.status === "loading" ? (
        <div data-testid="activity-skeleton" aria-busy="true" aria-label="Chargement de l'activité" className="mt-md flex flex-col gap-sm">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : svc.status === "error" ? (
        <ErrorState onRetry={svc.retry} />
      ) : groups.length === 0 ? (
        <div data-testid="activity-empty" className="mt-lg flex flex-col items-center gap-sm rounded-lg bg-surface p-xl text-center shadow-card">
          <Inbox className="size-8 text-muted" aria-hidden />
          <p className="text-h3 text-ink">Rien pour le moment</p>
          <p className="text-body-md text-muted">Vos {TABS.find((t) => t.id === tab)!.label.toLowerCase()} apparaîtront ici.</p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.label} className="mt-md" aria-label={g.label}>
            <h2 className="mb-sm text-label-md text-muted">{g.label}</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
              {g.items.map((e) => (
                <li key={e.id} data-testid="activity-row" data-type={e.type} className="flex items-center">
                  <Link href={`/activity/${e.id}`} className="flex min-w-0 flex-1 items-center gap-md p-md hover:bg-surface-sunken">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-body-lg" aria-hidden>
                      {e.status === "scheduled" ? <CalendarClock className="size-5 text-primary-dark" /> : ACTIVITY_EMOJI[e.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-label-md text-ink">{e.title}</p>
                      <p className="truncate text-caption text-muted">
                        {e.status === "scheduled" ? dateTimeLabel(e.date) : `${formatTime(e.date)} · ${e.subtitle}`}
                      </p>
                    </div>
                    {e.amount > 0 && <Price amount={e.amount} className="text-ink" />}
                    {e.status !== "scheduled" && <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />}
                  </Link>
                  {e.status === "scheduled" && (
                    <Button variant="chip" className="mr-md shrink-0" onClick={() => cancel(e)} aria-label={`Annuler ${e.title}`}>Annuler</Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </Page>
  );
}
