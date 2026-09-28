"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { SuccessCheck } from "@/components/SuccessCheck";
import { Button, ButtonLink } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { quoteRide } from "@/lib/pricing";
import { getPlace } from "@/lib/mock/places";
import { VEHICLES } from "@/lib/mock/vehicles";
import { dateTimeLabel } from "@/lib/money";
import type { VehicleId } from "@/lib/types";
import { cn } from "@/lib/utils";

type When = "today" | "tomorrow" | "custom";
const WHEN: { id: When; label: string }[] = [
  { id: "today", label: "Aujourd'hui" },
  { id: "tomorrow", label: "Demain" },
  { id: "custom", label: "Choisir une date" },
];
const TIMES = ["07:00", "08:30", "12:00", "18:00"];
const PICKUPS = ["position", "maison", "travail", "universite"];
const DESTINATIONS = ["aeroport", "maison", "travail", "universite", "erevan", "fidjrosse", "akpakpa", "dantokpa"];
const placeName = (id: string) => (id === "position" ? "Ma position" : (getPlace(id)?.shortName ?? id));

const isoDay = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleForm />
    </Suspense>
  );
}

function ScheduleForm() {
  const params = useSearchParams(); // optional prefill: ?to=aeroport&from=maison&when=tomorrow&time=07:00
  const addActivity = useApp((s) => s.addActivity);
  const addNotification = useApp((s) => s.addNotification);
  const [when, setWhen] = useState<When>((params.get("when") as When) ?? "tomorrow");
  const [customDate, setCustomDate] = useState(isoDay(2));
  const [time, setTime] = useState(params.get("time") ?? "07:00");
  const [from, setFrom] = useState(params.get("from") ?? "maison");
  const [to, setTo] = useState(params.get("to") ?? "aeroport");
  const [vehicleId, setVehicleId] = useState<VehicleId>("zem");
  const [done, setDone] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const day = when === "today" ? isoDay(0) : when === "tomorrow" ? isoDay(1) : customDate;
  const at = new Date(`${day}T${time}:00`);
  const valid = !Number.isNaN(at.getTime()) && at.getTime() > now && from !== to;
  const quote = quoteRide({ destinationId: to, vehicleId });
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!;

  const confirm = () => {
    const iso = at.toISOString();
    addActivity({
      type: "ride",
      status: "scheduled",
      date: iso,
      title: `Trajet vers ${placeName(to)}`,
      subtitle: `${placeName(from)} → ${placeName(to)} · ${vehicle.name}`,
      amount: quote.price,
      meta: { from: placeName(from), to: placeName(to), vehicle: vehicle.name, payment: "Gozem Money", course: quote.course, fee: quote.fee, scheduled: 1 },
    });
    addNotification({ kind: "ride", title: "Trajet programmé ✓", body: `${dateTimeLabel(iso)} · ${placeName(from)} → ${placeName(to)}`, href: "/activity" });
    toast.success("Trajet réservé ✓");
    setDone(iso);
  };

  if (done)
    return (
      <Page>
        <div className="mt-2xl flex flex-col items-center gap-md text-center">
          <SuccessCheck label="Trajet programmé ✓" />
          <p className="text-h3 text-ink">{dateTimeLabel(done)}</p>
          <p className="text-body-md text-muted">{placeName(from)} → {placeName(to)} · {vehicle.name} · <Price amount={quote.price} /></p>
          <p className="flex items-center gap-sm rounded-full bg-primary-soft px-md py-sm text-label-md text-success">
            ✓ Chauffeur assigné avant votre départ
          </p>
          <div className="mt-md flex w-full flex-col gap-sm">
            <ButtonLink href="/activity" full>Voir dans Activité</ButtonLink>
            <ButtonLink href="/" full variant="secondary">Retour à l&apos;accueil</ButtonLink>
          </div>
        </div>
      </Page>
    );

  const chips = (ids: string[], value: string, set: (v: string) => void, label: string, disabled?: string) => (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-sm">
      {ids.map((id) => (
        <Button key={id} role="radio" aria-checked={value === id} disabled={id === disabled} variant={value === id ? "chip-selected" : "chip"} onClick={() => set(id)}>
          {placeName(id)}
        </Button>
      ))}
    </div>
  );

  return (
    <Page>
      <PageHeader title="Réserver un trajet" subtitle="Programmez votre course à l'avance" back={true} />
      <div className="flex flex-col gap-lg">
        <section>
          <h2 className="mb-sm text-label-md text-ink">Quand ?</h2>
          <div role="radiogroup" aria-label="Jour" className="flex flex-wrap gap-sm">
            {WHEN.map((w) => (
              <Button key={w.id} role="radio" aria-checked={when === w.id} variant={when === w.id ? "chip-selected" : "chip"} onClick={() => setWhen(w.id)}>{w.label}</Button>
            ))}
          </div>
          {when === "custom" && (
            <input type="date" aria-label="Date" min={isoDay(0)} value={customDate} onChange={(e) => setCustomDate(e.target.value)}
              className="mt-sm h-13 w-full rounded-md bg-surface-sunken px-3.5 text-body-lg outline-none focus:ring-2 focus:ring-primary-dark" />
          )}
          <h2 className="mt-md mb-sm text-label-md text-ink">Heure</h2>
          <div role="radiogroup" aria-label="Heure" className="flex flex-wrap items-center gap-sm">
            {TIMES.map((t) => (
              <Button key={t} role="radio" aria-checked={time === t} variant={time === t ? "chip-selected" : "chip"} className="num" onClick={() => setTime(t)}>{t}</Button>
            ))}
            <input type="time" aria-label="Autre heure" value={time} onChange={(e) => setTime(e.target.value)}
              className="num h-9 rounded-full bg-surface-sunken px-3 text-caption outline-none focus:ring-2 focus:ring-primary-dark" />
          </div>
        </section>

        <section>
          <h2 className="mb-sm text-label-md text-ink">Départ</h2>
          {chips(PICKUPS, from, setFrom, "Départ")}
          <h2 className="mt-md mb-sm text-label-md text-ink">Destination</h2>
          {chips(DESTINATIONS, to, setTo, "Destination", from)}
        </section>

        <section>
          <h2 className="mb-sm text-label-md text-ink">Véhicule</h2>
          <ul className="flex flex-col gap-sm">
            {VEHICLES.map((v) => (
              <li key={v.id}>
                <button type="button" onClick={() => setVehicleId(v.id)} aria-pressed={v.id === vehicleId}
                  className={cn("flex w-full items-center gap-md rounded-lg bg-surface p-3.5 text-left shadow-card", v.id === vehicleId && "bg-primary-soft ring-2 ring-primary-dark")}>
                  <span className="grid size-12 place-items-center rounded-md bg-surface-sunken text-h2" aria-hidden>{v.emoji}</span>
                  <span className="flex-1">
                    <span className="block text-label-md text-ink">{v.name}</span>
                    <span className="block text-caption text-muted">{v.description} · {v.capacity} place{v.capacity > 1 ? "s" : ""}</span>
                  </span>
                  <Price amount={quoteRide({ destinationId: to, vehicleId: v.id }).price} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg bg-surface p-md shadow-card">
          <p className="flex items-center gap-sm text-label-md text-ink"><CalendarClock className="size-5 text-primary-dark" aria-hidden /> {valid ? dateTimeLabel(at.toISOString()) : "Choisissez une date à venir"}</p>
          <p className="mt-xs text-caption text-muted">{placeName(from)} → {placeName(to)} · {quote.distanceKm} km · {quote.durationMin} min</p>
          <div className="mt-sm flex items-center justify-between">
            <span className="text-caption text-muted">Prix estimé · payé avec Gozem Money</span>
            <Price amount={quote.price} />
          </div>
        </section>

        <Button full disabled={!valid} onClick={confirm}>Programmer le trajet</Button>
      </div>
    </Page>
  );
}
