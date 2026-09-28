"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Star } from "lucide-react";
import { Page } from "@/components/Page";
import { Price } from "@/components/Price";
import { SuccessCheck } from "@/components/SuccessCheck";
import { Button, buttonClass } from "@/components/ui/button";
import { purchase, selectRidePayment, useApp } from "@/lib/store";
import { formatFCFA } from "@/lib/format";
import { quoteRide } from "@/lib/pricing";
import { getPromo } from "@/lib/mock/promos";
import { getPlace } from "@/lib/mock/places";
import { POINTS_PER_RIDE, PAYMENT_METHODS } from "@/lib/mock/user";
import { driverForVehicle, getDriver, getVehicle } from "@/lib/mock/vehicles";
import { cn } from "@/lib/utils";
import { DEFAULT_DESTINATION } from "../_trip/trip";

const TAGS = ["Ponctuel", "Sympathique", "Conduite sûre", "Véhicule propre"];
const TIPS = [200, 500, 1000];

export default function CompletePage() {
  const destinationId = useApp((s) => s.ride.destinationId);
  useEffect(() => {
    const s = useApp.getState();
    if (s.ride.destinationId) return;
    s.startRide(DEFAULT_DESTINATION);
    s.setPhase("matched");
    s.setPhase("completed");
  }, []);
  if (!destinationId) return null;
  return <Complete />;
}

function Complete() {
  const router = useRouter();
  const ride = useApp((s) => s.ride);
  const payment = useApp(selectRidePayment);
  const [done, setDone] = useState(false);
  const dest = getPlace(ride.destinationId!)!;
  const driver = ride.driverId ? getDriver(ride.driverId) : driverForVehicle(ride.vehicleId);
  const vehicle = getVehicle(ride.vehicleId);
  const quote = useMemo(
    () => quoteRide({ destinationId: dest.id, vehicleId: ride.vehicleId, stops: ride.stops, discountPct: getPromo(ride.activePromoId)?.discountPct }),
    [dest.id, ride.vehicleId, ride.stops, ride.activePromoId],
  );
  const payLabel = PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? "Gozem Money";
  const [at] = useState(() => new Date(ride.phaseStartedAt ?? Date.now()));
  const when = `${at.toLocaleDateString("fr-FR")} · ${at.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  const set = useApp.getState().setRide;

  const finish = () => {
    if (done) return;
    const s = useApp.getState();
    const cash = payment === "cash";
    const id = ride.rideId ?? `ride-${Date.now().toString(36)}`;
    const res = purchase(useApp, {
      amount: quote.price,
      label: `Course ${vehicle.name} · ${dest.shortName}`,
      category: "ride",
      skipDebit: cash,
      activity: {
        id,
        type: "ride",
        title: `Trajet vers ${dest.shortName}`,
        subtitle: `${vehicle.name} · ${driver.name}`,
        amount: quote.price + ride.tip,
        meta: { from: "Ma position", to: dest.name, vehicle: vehicle.name, payment: payLabel, driver: driver.name, course: quote.course, fee: quote.fee, tip: ride.tip, rating: ride.rating },
      },
      points: { n: POINTS_PER_RIDE, label: `Course ${vehicle.name} · ${dest.shortName}` },
      notification: { kind: "ride", title: "Trajet terminé", body: `Merci d'avoir voyagé avec ${driver.name} · ${formatFCFA(quote.price)}`, href: `/activity/${id}` },
    });
    if (!res.ok) return toast.error(res.error, { description: `Il manque ${formatFCFA(res.missing)}` });
    if (ride.tip > 0 && !cash) {
      const t = s.debit(ride.tip, { label: `Pourboire ${driver.name}`, category: "tip" });
      if (!t.ok) toast.error("Pourboire non envoyé", { description: t.error });
    }
    setDone(true);
    toast.success(ride.rating ? "Merci pour votre avis ✓" : "Trajet terminé ✓", { description: `+${POINTS_PER_RIDE} points GoWin` });
    s.resetRide();
    router.push("/");
  };

  return (
    <Page className="pt-lg">
      <div className="flex flex-col items-center gap-sm text-center">
        <SuccessCheck size={72} />
        <h1 className="mt-sm text-h1 text-ink">Vous êtes arrivé 🎉</h1>
        <p className="text-caption text-muted">{dest.name}</p>
        <span data-testid="complete-price" className="mt-sm">
          <Price amount={quote.price} hero className="text-ink" />
        </span>
        <p className="rounded-full bg-primary-soft px-md py-xs text-caption text-success">Payé avec {payLabel}</p>
      </div>

      <section className="mt-lg rounded-lg bg-surface p-md shadow-card">
        <p className="text-h3 text-ink">Notez {driver.firstName}</p>
        <div className="mt-sm flex gap-xs" role="group" aria-label="Note">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} étoile${n > 1 ? "s" : ""}`} aria-pressed={n <= ride.rating} onClick={() => set({ rating: n })} className="grid size-touch-target place-items-center rounded-full hover:bg-surface-sunken">
              <Star className={cn("size-8", n <= ride.rating ? "fill-accent text-accent" : "text-border")} aria-hidden />
            </button>
          ))}
        </div>
        <div className="mt-md flex flex-wrap gap-sm">
          {TAGS.map((t) => {
            const on = ride.tags.includes(t);
            return (
              <button key={t} type="button" aria-pressed={on} onClick={() => set({ tags: on ? ride.tags.filter((x) => x !== t) : [...ride.tags, t] })} className={buttonClass(on ? "chip-selected" : "chip")}>
                {t}
              </button>
            );
          })}
        </div>
        <p className="mt-lg text-label-md text-ink">Ajouter un pourboire</p>
        <div className="mt-sm flex flex-wrap gap-sm">
          {TIPS.map((t) => {
            const on = ride.tip === t;
            return (
              <button key={t} type="button" aria-pressed={on} onClick={() => set({ tip: on ? 0 : t })} className={buttonClass(on ? "chip-selected" : "chip", false, "num")}>
                {formatFCFA(t)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-md rounded-lg bg-surface p-md shadow-card" data-testid="receipt">
        <div className="flex items-center justify-between">
          <p className="text-h3 text-ink">Reçu</p>
          <p className="num text-caption text-muted">{when}</p>
        </div>
        <dl className="mt-sm flex flex-col gap-xs text-body-md">
          <div className="flex justify-between">
            <dt className="text-muted">Course</dt>
            <dd className="num">{formatFCFA(quote.course)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Frais</dt>
            <dd className="num">{formatFCFA(quote.fee)}</dd>
          </div>
          <div className="mt-xs flex justify-between border-t border-border pt-sm text-label-md text-ink">
            <dt>Total</dt>
            <dd className="num">{formatFCFA(quote.price)}</dd>
          </div>
        </dl>
        <p className="mt-sm text-caption text-muted">
          {vehicle.name} · {driver.name} · {driver.plate}
        </p>
        <Button variant="secondary" full className="mt-md" onClick={() => toast.success("Reçu téléchargé ✓")}>
          <Download className="size-5" aria-hidden /> Télécharger
        </Button>
      </section>

      <Button full className="mt-lg" onClick={finish} disabled={done}>
        Terminer
      </Button>
    </Page>
  );
}
