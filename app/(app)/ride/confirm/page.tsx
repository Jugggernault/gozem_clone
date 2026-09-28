"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { ArrowLeft, CreditCard } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { FloatingButton, MapScreen } from "@/components/MapScreen";
import { MapView } from "@/components/MapView";
import { Price } from "@/components/Price";
import { Button } from "@/components/ui/button";
import { USER_POSITION, USER_POSITION_LABEL, getPlace, placeLngLat } from "@/lib/mock/places";
import { getPromo } from "@/lib/mock/promos";
import { routeTo } from "@/lib/mock/routes";
import { PAYMENT_METHODS } from "@/lib/mock/user";
import { getVehicle } from "@/lib/mock/vehicles";
import { selectRidePayment, selectRideQuote, useApp } from "@/lib/store";

const SCHEDULE_LABEL = { now: "Maintenant", today: "Aujourd'hui", tomorrow: "Demain", custom: "Date choisie" } as const;

export default function RideConfirmPage() {
  const router = useRouter();
  const ride = useApp((s) => s.ride);
  const quote = useApp(useShallow(selectRideQuote)); // fresh object per call → shallow-compare
  const payment = useApp(selectRidePayment);
  const setPhase = useApp((s) => s.setPhase);
  const dest = ride.destinationId ? getPlace(ride.destinationId) : undefined;

  useEffect(() => {
    if (!dest) router.replace("/ride/search");
  }, [dest, router]);
  if (!dest || !quote) return null;

  const vehicle = getVehicle(ride.vehicleId);
  const promo = getPromo(ride.activePromoId);
  const route = routeTo(dest.id, ride.stops);
  const stops = ride.stops.map((id) => getPlace(id)?.shortName).filter(Boolean);

  return (
    <MapScreen>
      <MapView
        route={route}
        fit={route}
        markers={[
          { id: "me", position: USER_POSITION, kind: "user" },
          ...ride.stops.map((id, i) => ({ id: `stop-${i}`, position: placeLngLat(getPlace(id)!), kind: "stop" as const })),
          { id: "dest", position: placeLngLat(dest), kind: "destination" },
        ]}
      />
      <FloatingButton aria-label="Retour" className="absolute left-md top-md z-10 lg:hidden" onClick={() => router.push("/ride/options")}>
        <ArrowLeft className="size-5" />
      </FloatingButton>
      <BottomSheet
        title="Confirmer votre trajet"
        footer={
          <Button
            full
            onClick={() => {
              setPhase("searching");
              router.push("/ride/matching");
            }}
          >
            Confirmer le trajet
          </Button>
        }
      >
        <ol className="relative flex flex-col gap-md border-l-2 border-border pl-md" aria-label="Itinéraire">
          <li>
            <p className="text-caption text-muted">Départ</p>
            <p className="text-label-md text-on-surface">{USER_POSITION_LABEL}</p>
          </li>
          {stops.map((s, i) => (
            <li key={i}>
              <p className="text-caption text-muted">Arrêt {i + 1}</p>
              <p className="text-label-md text-on-surface">{s}</p>
            </li>
          ))}
          <li>
            <p className="text-caption text-muted">Arrivée</p>
            <p className="text-label-md text-on-surface">{dest.shortName}</p>
          </li>
        </ol>

        <div className="mt-lg flex items-center gap-md rounded-lg bg-surface-sunken p-md">
          <span className="text-h2" aria-hidden>{vehicle.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-label-md text-on-surface">{vehicle.name}</p>
            <p className="num text-caption text-muted">
              {quote.durationMin} min · {quote.distanceKm} km · {SCHEDULE_LABEL[ride.schedule.mode]}
              {ride.schedule.date ? ` ${ride.schedule.date}` : ""}
              {ride.schedule.time ? ` ${ride.schedule.time}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Price amount={quote.price} className="text-ink" />
            {promo && <span className="rounded-full bg-accent-soft px-1.5 text-caption text-on-accent">Promo {promo.badge}</span>}
          </div>
        </div>

        <div className="mt-sm flex min-h-14 items-center gap-md rounded-lg border border-border px-md">
          <CreditCard className="size-5 text-muted" aria-hidden />
          <div className="flex-1">
            <p className="text-caption text-muted">Paiement</p>
            <p className="text-label-md text-on-surface">{PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? "Gozem Money"}</p>
          </div>
        </div>
      </BottomSheet>
    </MapScreen>
  );
}
