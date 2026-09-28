"use client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleCheck, CalendarClock, CircleX, Loader } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { Button, ButtonLink } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { ACTIVITY_EMOJI, ACTIVITY_TYPE_LABEL, dateTimeLabel } from "@/lib/money";
import type { ActivityStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS: Record<ActivityStatus, { label: string; cls: string; Icon: typeof CircleCheck }> = {
  completed: { label: "Terminé", cls: "bg-primary-soft text-success", Icon: CircleCheck },
  scheduled: { label: "À venir", cls: "bg-accent-soft text-warning", Icon: CalendarClock },
  cancelled: { label: "Annulé", cls: "bg-surface-sunken text-error", Icon: CircleX },
  in_progress: { label: "En cours", cls: "bg-accent-soft text-warning", Icon: Loader },
};

const META_LABEL: Record<string, string> = {
  from: "Départ", to: "Destination", vehicle: "Véhicule", payment: "Paiement", driver: "Chauffeur",
  course: "Course", fee: "Frais de service", tip: "Pourboire", subtotal: "Sous-total", deliveryFee: "Livraison", distance: "Distance", duration: "Durée",
};
const MONEY_META = new Set(["course", "fee", "tip", "subtotal", "deliveryFee"]);
const HIDDEN_META = new Set(["restaurant", "rideId", "orderId", "deliveryId", "href", "placeId", "destinationId", "vehicleId", "driverId", "scheduled"]);

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const entry = useApp((s) => s.activity.entries.find((e) => e.id === id));
  const removeActivity = useApp((s) => s.removeActivity);

  if (!entry)
    return (
      <Page>
        <PageHeader title="Détail de l'activité" back="/activity" />
        <p className="mt-lg text-center text-body-md text-muted">Cette activité n&apos;existe plus.</p>
      </Page>
    );

  const st = STATUS[entry.status];
  // Other tracks store meta with short english keys; show known ones in French, skip ids/slugs.
  const meta = Object.entries(entry.meta ?? {})
    .filter(([k]) => !HIDDEN_META.has(k) && !k.startsWith("_"))
    .map(([k, v]) => [k, META_LABEL[k] ?? k, v] as const);

  return (
    <Page>
      <PageHeader title="Reçu" subtitle={ACTIVITY_TYPE_LABEL[entry.type]} back="/activity" />
      <article data-testid="receipt" className="rounded-lg bg-surface p-lg shadow-card">
        <div className="flex flex-col items-center gap-sm border-b border-dashed border-border pb-md text-center">
          <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-h2" aria-hidden>{ACTIVITY_EMOJI[entry.type]}</span>
          <h2 className="text-h2 text-ink">{entry.title}</h2>
          <p className="text-caption text-muted">{entry.subtitle}</p>
          <span className={cn("inline-flex items-center gap-xs rounded-full px-3 py-xs text-caption", st.cls)}>
            <st.Icon className="size-4" aria-hidden /> {st.label}
          </span>
        </div>
        <dl className="flex flex-col gap-sm py-md text-body-md">
          <div className="flex justify-between gap-md"><dt className="text-muted">Date</dt><dd>{dateTimeLabel(entry.date)}</dd></div>
          {meta.map(([key, k, v]) => (
            <div key={k} className="flex justify-between gap-md">
              <dt className="text-muted first-letter:uppercase">{k}</dt>
              <dd className="text-right">{typeof v === "number" && MONEY_META.has(key) ? <Price amount={v} /> : v}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-md"><dt className="text-muted">Référence</dt><dd className="num">{entry.id.toUpperCase()}</dd></div>
        </dl>
        <div className="flex items-center justify-between border-t border-dashed border-border pt-md">
          <span className="text-label-md text-ink">Total</span>
          <Price amount={entry.amount} hero />
        </div>
      </article>

      <div className="mt-lg flex flex-col gap-sm">
        {entry.status === "scheduled" ? (
          <Button full variant="danger" onClick={() => { removeActivity(entry.id); toast.success("Trajet annulé ✓"); router.push("/activity"); }}>
            Annuler le trajet
          </Button>
        ) : (
          <Button full variant="secondary" onClick={() => toast.success("Reçu téléchargé ✓")}>Télécharger le reçu</Button>
        )}
        <ButtonLink href="/help" full variant="ghost">Signaler un problème</ButtonLink>
      </div>
    </Page>
  );
}
