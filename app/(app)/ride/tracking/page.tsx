"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Phone, X } from "lucide-react";
import { MapScreen, FloatingButton } from "@/components/MapScreen";
import { MapView, type MapMarker } from "@/components/MapView";
import { BottomSheet } from "@/components/BottomSheet";
import { Price } from "@/components/Price";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { MAX_STOPS, arrivalTime, quoteRide } from "@/lib/pricing";
import { getPromo } from "@/lib/mock/promos";
import { USER_POSITION, getPlace, placeLngLat } from "@/lib/mock/places";
import { DRIVER_APPROACH, routeTo } from "@/lib/mock/routes";
import { driverForVehicle, getDriver, getVehicle } from "@/lib/mock/vehicles";
import { DriverCard } from "../_trip/DriverCard";
import { ChatSheet, CallSheet, ContactsSheet, DestinationSheet, SafetySheet, ShareSheet, SosSheet, StopSheet } from "../_trip/sheets";
import { APPROACH_KM, APPROACH_MIN, APPROACH_TICKS, ARRIVED_MS, SHARE_URL, TICK_MS, TRIP_TICKS, ensureLiveRide, formatKm } from "../_trip/trip";

type Modal = null | "chat" | "call" | "safety" | "share" | "contacts" | "sos" | "stop" | "dest";

export default function TrackingPage() {
  const phase = useApp((s) => s.ride.phase);
  const destinationId = useApp((s) => s.ride.destinationId);
  useEffect(() => ensureLiveRide(), []);
  const ready = !!destinationId && ["driver_arriving", "arrived", "in_progress", "completed"].includes(phase);
  if (!ready) return <MapScreen>{null}</MapScreen>;
  return <Tracking />;
}

function Tracking() {
  const router = useRouter();
  const ride = useApp((s) => s.ride);
  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);
  const { phase, progress, stops } = ride;
  const dest = getPlace(ride.destinationId!)!;
  const driver = ride.driverId ? getDriver(ride.driverId) : driverForVehicle(ride.vehicleId);
  const vehicle = getVehicle(ride.vehicleId);
  const quote = useMemo(
    () => quoteRide({ destinationId: dest.id, vehicleId: ride.vehicleId, stops, discountPct: getPromo(ride.activePromoId)?.discountPct }),
    [dest.id, ride.vehicleId, stops, ride.activePromoId],
  );
  const trip = useMemo(() => routeTo(dest.id, stops), [dest.id, stops]);

  // Demo timeline: 1 s ticks, persisted progress (reload resumes). Paused while a sheet is open.
  const paused = modal !== null;
  useEffect(() => {
    if (paused) return;
    if (phase === "arrived") {
      const t = setTimeout(() => useApp.getState().setPhase("in_progress"), ARRIVED_MS);
      return () => clearTimeout(t);
    }
    if (phase !== "driver_arriving" && phase !== "in_progress") return;
    const ticks = phase === "driver_arriving" ? APPROACH_TICKS : TRIP_TICKS;
    const id = setInterval(() => {
      const s = useApp.getState();
      const p = s.ride.progress + 1 / ticks;
      if (p < 1 - 1e-6) return s.setRide({ progress: p });
      if (phase === "driver_arriving") return s.setPhase("arrived");
      s.setPhase("completed");
      router.push("/ride/complete");
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase, paused, router]);

  const arriving = phase === "driver_arriving" || phase === "arrived";
  const shownProgress = phase === "arrived" || phase === "completed" ? 1 : progress;
  const moving = {
    path: arriving ? DRIVER_APPROACH : trip,
    progress: shownProgress,
    stepMs: shownProgress === 0 ? 1 : TICK_MS,
    emoji: vehicle.emoji,
  };
  const markers: MapMarker[] = [
    ...(arriving ? [{ id: "me", position: USER_POSITION, kind: "user" as const }] : []),
    ...stops.map((id, i) => ({ id: `stop-${i}`, position: placeLngLat(getPlace(id)!), kind: "stop" as const })),
    { id: "dest", position: placeLngLat(dest), kind: "destination" },
  ];

  const left = 1 - shownProgress;
  const etaMin = arriving ? Math.max(1, Math.ceil(APPROACH_MIN * left - 1e-6)) : Math.max(1, Math.ceil(quote.durationMin * left - 1e-6));
  const etaKm = arriving ? APPROACH_KM * left : quote.distanceKm * left;

  const shareMessage = `Je suis en route vers ${dest.shortName} avec Gozem (${driver.name}, ${driver.vehicle} ${driver.plate}). Suivez mon trajet en direct : ${SHARE_URL}`;

  const complete = () => {
    useApp.getState().setPhase("completed");
    router.push("/ride/complete");
  };

  return (
    <MapScreen>
      <MapView route={arriving ? DRIVER_APPROACH : trip} markers={markers} moving={moving} fit={arriving ? [...DRIVER_APPROACH, ...trip] : trip} />
      <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between p-md lg:left-auto">
        <Link href="/" aria-label="Retour à l'accueil" className="grid size-12 place-items-center rounded-full bg-surface text-ink shadow-float lg:hidden">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <FloatingButton onClick={() => setModal("safety")} className="px-md text-label-md">
          🛡 Sécurité
        </FloatingButton>
      </div>

      <BottomSheet
        footer={
          <Button variant="secondary" full onClick={complete}>
            Simuler l&apos;arrivée
          </Button>
        }
      >
        <div aria-live="polite">
          {phase === "driver_arriving" && (
            <p className="text-h2 text-ink">
              {driver.firstName} arrive dans <span className="num" data-testid="eta-min">{etaMin}</span> min
            </p>
          )}
          {phase === "arrived" && <p className="text-h2 text-ink">Votre chauffeur est arrivé</p>}
          {(phase === "in_progress" || phase === "completed") && (
            <p className="text-h3 text-ink">
              En route vers {dest.shortName} · arrivée <span className="num">{arrivalTime(etaMin)}</span>
            </p>
          )}
          <p className="mt-xs text-caption text-muted">
            {phase === "arrived" ? (
              `${driver.vehicle} · ${driver.plate} · Retrouvez ${driver.firstName} au point de prise en charge`
            ) : (
              <>
                <span className="num" data-testid="eta-km">{formatKm(etaKm)}</span> km · <span className="num">{etaMin}</span> min restantes
              </>
            )}
          </p>
          <div className="mt-sm h-1 overflow-hidden rounded-full bg-surface-sunken" aria-hidden>
            <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${Math.round(shownProgress * 100)}%` }} />
          </div>
        </div>

        <DriverCard driver={driver} className="mt-md" />
        <div className="mt-md grid grid-cols-2 gap-sm">
          <Button variant="secondary" onClick={() => setModal("chat")}>
            <MessageCircle className="size-5" aria-hidden /> Message
          </Button>
          <Button variant="secondary" onClick={() => setModal("call")}>
            <Phone className="size-5" aria-hidden /> Appeler
          </Button>
        </div>

        <div className="mt-md rounded-lg border border-border p-md">
          <div className="flex items-start justify-between gap-md">
            <div className="min-w-0">
              <p className="text-caption text-muted">Vers</p>
              <p className="text-label-md text-ink" data-testid="destination-label">
                {dest.shortName}
              </p>
            </div>
            <div className="text-right">
              <span data-testid="trip-price">
                <Price amount={quote.price} className="text-ink" />
              </span>
              <p className="text-caption text-muted" data-testid="trip-duration">
                <span className="num">{formatKm(quote.distanceKm)}</span> km · <span className="num">{quote.durationMin}</span> min
              </p>
            </div>
          </div>
          {stops.length > 0 && (
            <ul className="mt-sm flex flex-col gap-xs" data-testid="stops">
              {stops.map((id, i) => (
                <li key={`${id}-${i}`} className="flex items-center gap-sm rounded-sm bg-surface-sunken px-sm py-xs">
                  <span className="size-2 rounded-full bg-ink" aria-hidden />
                  <span className="flex-1 text-caption text-on-surface">
                    Arrêt {i + 1} · {getPlace(id)?.shortName}
                  </span>
                  <button type="button" aria-label={`Retirer l'arrêt ${getPlace(id)?.shortName}`} className="grid size-touch-target place-items-center text-muted" onClick={() => useApp.getState().removeStop(i)}>
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-sm flex flex-wrap gap-sm">
            <Button
              variant="chip"
              onClick={() => (stops.length >= MAX_STOPS ? toast.error(`Maximum ${MAX_STOPS} arrêts`) : setModal("stop"))}
            >
              + Ajouter un arrêt
            </Button>
            <Button variant="chip" onClick={() => setModal("dest")}>
              Modifier destination
            </Button>
          </div>
        </div>
      </BottomSheet>

      <ChatSheet open={modal === "chat"} onClose={close} driver={driver} />
      <CallSheet open={modal === "call"} onClose={close} driver={driver} />
      <SafetySheet open={modal === "safety"} onClose={close} onShare={() => setModal("share")} onContacts={() => setModal("contacts")} onSos={() => setModal("sos")} />
      <ShareSheet open={modal === "share"} onClose={close} message={shareMessage} />
      <ContactsSheet open={modal === "contacts"} onClose={close} />
      <SosSheet open={modal === "sos"} onClose={close} />
      <StopSheet open={modal === "stop"} onClose={close} />
      <DestinationSheet open={modal === "dest"} onClose={close} />
    </MapScreen>
  );
}
