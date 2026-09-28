"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, X } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { FloatingButton, MapScreen } from "@/components/MapScreen";
import { MapView, type MapMarker } from "@/components/MapView";
import { Price } from "@/components/Price";
import { Button } from "@/components/ui/button";
import { MAX_STOPS, quoteRide } from "@/lib/pricing";
import { PLACES, USER_POSITION, getPlace, placeLngLat } from "@/lib/mock/places";
import { getPromo } from "@/lib/mock/promos";
import { IDLE_VEHICLES, routeTo } from "@/lib/mock/routes";
import { VEHICLES } from "@/lib/mock/vehicles";
import { useApp } from "@/lib/store";
import type { RideState } from "@/lib/store";
import { cn } from "@/lib/utils";

const SCHEDULES: { mode: RideState["schedule"]["mode"]; label: string }[] = [
  { mode: "now", label: "Maintenant" },
  { mode: "today", label: "Aujourd'hui" },
  { mode: "tomorrow", label: "Demain" },
  { mode: "custom", label: "Choisir une date" },
];

export function RideOptions({ to }: { to?: string }) {
  const router = useRouter();
  const ride = useApp((s) => s.ride);
  const setRide = useApp((s) => s.setRide);
  const startRide = useApp((s) => s.startRide);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [stopPicker, setStopPicker] = useState(false);

  // ?to=<placeId> starts a fresh draft, unless we're already heading there.
  useEffect(() => {
    if (to && getPlace(to) && ride.destinationId !== to) startRide(to);
    else if (!to && !ride.destinationId) router.replace("/ride/search");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  const destId = to && getPlace(to) ? to : ride.destinationId;
  const dest = destId ? getPlace(destId) : undefined;
  const promo = getPromo(ride.activePromoId);
  const route = useMemo(() => (destId ? routeTo(destId, ride.stops) : []), [destId, ride.stops]);
  if (!dest || !destId) return null;

  const quotes = VEHICLES.map((v) => ({ v, q: quoteRide({ destinationId: destId, vehicleId: v.id, stops: ride.stops, discountPct: promo?.discountPct }) }));
  const selected = quotes.find((x) => x.v.id === ride.vehicleId) ?? quotes[0];

  const markers: MapMarker[] = [
    { id: "me", position: USER_POSITION, kind: "user" },
    ...ride.stops.map((id, i) => ({ id: `stop-${i}`, position: placeLngLat(getPlace(id)!), kind: "stop" as const })),
    { id: "dest", position: placeLngLat(dest), kind: "destination" },
    ...IDLE_VEHICLES.map((v) => ({ ...v, kind: "vehicle" as const })),
  ];

  const stopsEditor = (
    <StopsEditor
      stops={ride.stops}
      onAdd={() => (ride.stops.length >= MAX_STOPS ? toast(`Maximum ${MAX_STOPS} arrêts`) : setStopPicker(true))}
    />
  );

  return (
    <MapScreen>
      <MapView route={route} markers={markers} fit={route} />
      <FloatingButton aria-label="Retour" className="absolute left-md top-md z-10 lg:hidden" onClick={() => router.push("/ride/search")}>
        <ArrowLeft className="size-5" />
      </FloatingButton>
      <BottomSheet
        footer={
          <div className="flex flex-col gap-md">
            <div className="flex items-end justify-between gap-md">
              <div>
                <p className="text-caption text-muted">Prix estimé</p>
                <p className="text-caption text-muted">Prix garanti*</p>
              </div>
              <Price amount={selected.q.price} hero className="text-ink" />
            </div>
            <Button full onClick={() => router.push("/ride/confirm")}>
              Choisir {selected.v.name}
            </Button>
          </div>
        }
      >
        <div className="flex items-start justify-between gap-md">
          <h2 className="text-h3 text-ink">
            Vers {dest.shortName} · <span className="num whitespace-nowrap">{selected.q.durationMin} min</span> · <span className="num whitespace-nowrap">{selected.q.distanceKm} km</span>
          </h2>
          <Button variant="chip" onClick={() => setOptionsOpen(true)} className="shrink-0">
            ⚙ Options
          </Button>
        </div>
        {ride.schedule.mode !== "now" && (
          <p className="mt-xs text-caption text-muted">
            Programmé : {SCHEDULES.find((s) => s.mode === ride.schedule.mode)?.label}
            {ride.schedule.date ? ` · ${ride.schedule.date}` : ""}
            {ride.schedule.time ? ` · ${ride.schedule.time}` : ""}
          </p>
        )}
        <div className="mt-sm">{stopsEditor}</div>

        <ul className="mt-md flex flex-col gap-sm" aria-label="Véhicules">
          {quotes.map(({ v, q }) => {
            const on = v.id === selected.v.id;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  data-testid={`vehicle-${v.id}`}
                  onClick={() => setRide({ vehicleId: v.id })}
                  className={cn(
                    "flex w-full items-center gap-md rounded-lg p-3.5 text-left transition-colors",
                    on ? "bg-primary-soft text-ink ring-2 ring-primary-dark" : "bg-surface hover:bg-surface-sunken",
                  )}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-md bg-surface-sunken text-h2" aria-hidden>
                    {v.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-sm">
                      <span className="text-label-md text-on-surface">{v.name}</span>
                      {promo && <span className="rounded-full bg-accent-soft px-1.5 text-caption text-on-accent">Promo {promo.badge}</span>}
                    </span>
                    <span className="block truncate text-caption text-muted">
                      {v.description} · {v.capacity} place{v.capacity > 1 ? "s" : ""}
                    </span>
                    <span className="num block text-caption text-muted">{v.etaMin} min</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <Price amount={q.price} className="text-ink" />
                    {q.price !== q.originalPrice && <Price amount={q.originalPrice} className="text-caption text-muted line-through" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-md text-caption text-muted">* Le prix affiché est garanti, sans surprise à l&apos;arrivée.</p>
      </BottomSheet>

      <BottomSheet open={optionsOpen} onClose={() => setOptionsOpen(false)} title="Options" footer={<Button full onClick={() => setOptionsOpen(false)}>Valider</Button>}>
        <p className="mb-sm text-label-md text-on-surface">Quand ?</p>
        <div className="flex flex-wrap gap-sm" role="radiogroup" aria-label="Quand ?">
          {SCHEDULES.map(({ mode, label }) => {
            const on = ride.schedule.mode === mode;
            return (
              <Button key={mode} role="radio" aria-checked={on} variant={on ? "chip-selected" : "chip"} onClick={() => setRide({ schedule: { ...ride.schedule, mode } })}>
                {label}
              </Button>
            );
          })}
        </div>
        {ride.schedule.mode !== "now" && (
          <div className="mt-md grid grid-cols-2 gap-sm">
            {ride.schedule.mode === "custom" && (
              <label className="col-span-2 flex flex-col gap-xs text-caption text-muted">
                Date
                <input type="date" value={ride.schedule.date ?? ""} onChange={(e) => setRide({ schedule: { ...ride.schedule, date: e.target.value } })} className="h-13 rounded-md bg-surface-sunken px-3.5 text-body-lg text-on-surface" />
              </label>
            )}
            <label className="col-span-2 flex flex-col gap-xs text-caption text-muted">
              Heure
              <input type="time" value={ride.schedule.time ?? ""} onChange={(e) => setRide({ schedule: { ...ride.schedule, time: e.target.value } })} className="h-13 rounded-md bg-surface-sunken px-3.5 text-body-lg text-on-surface" />
            </label>
          </div>
        )}
        <p className="mt-lg mb-sm text-label-md text-on-surface">Arrêts</p>
        {stopsEditor}
      </BottomSheet>

      <StopPicker
        open={stopPicker}
        exclude={[destId, ...ride.stops]}
        onClose={() => setStopPicker(false)}
        onPick={(id) => {
          const r = useApp.getState().addStop(id);
          if (!r.ok) toast(r.error);
          setStopPicker(false);
        }}
      />
    </MapScreen>
  );
}

function StopsEditor({ stops, onAdd }: { stops: string[]; onAdd: () => void }) {
  const removeStop = useApp((s) => s.removeStop);
  return (
    <div className="flex flex-wrap items-center gap-sm">
      {stops.map((id, i) => (
        <span key={`${id}-${i}`} className="inline-flex h-9 items-center gap-xs rounded-full bg-surface-sunken pl-3 text-caption text-on-surface">
          Arrêt {i + 1} : {getPlace(id)?.shortName}
          <button type="button" aria-label={`Retirer l'arrêt ${i + 1}`} onClick={() => removeStop(i)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-border">
            <X className="size-4" />
          </button>
        </span>
      ))}
      <Button variant="chip" onClick={onAdd} disabled={stops.length >= MAX_STOPS} aria-label="+ Ajouter un arrêt">
        <Plus className="size-4" aria-hidden /> Ajouter un arrêt
      </Button>
      {stops.length >= MAX_STOPS && <span className="text-caption text-muted">Maximum {MAX_STOPS} arrêts</span>}
    </div>
  );
}

function StopPicker({ open, exclude, onClose, onPick }: { open: boolean; exclude: string[]; onClose: () => void; onPick: (id: string) => void }) {
  const places = PLACES.filter((p) => !exclude.includes(p.id) && p.id !== "maison" && p.id !== "travail");
  return (
    <BottomSheet open={open} onClose={onClose} title="Ajouter un arrêt">
      <ul className="divide-y divide-border" aria-label="Lieux d'arrêt">
        {places.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onPick(p.id)} className="flex min-h-14 w-full flex-col justify-center py-sm text-left hover:bg-surface-sunken">
              <span className="text-label-md text-on-surface">{p.name}</span>
              <span className="text-caption text-muted">{p.subtitle}</span>
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
