"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { MapScreen, FloatingButton } from "@/components/MapScreen";
import { MapView } from "@/components/MapView";
import { BottomSheet } from "@/components/BottomSheet";
import { Timeline } from "@/components/errands/Timeline";
import { Price } from "@/components/Price";
import { ButtonLink } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { PARCEL_ID, PARCEL_STEPS } from "@/lib/mock/delivery";
import { COURIER } from "@/lib/mock/vehicles";
import { PLACES, USER_POSITION, getPlace, normalize, placeLngLat } from "@/lib/mock/places";
import { routeBetween } from "@/lib/mock/routes";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";

const EN_ROUTE = PARCEL_STEPS.indexOf("En livraison");
const LAST = PARCEL_STEPS.length - 1;
const STEP_MS = 1200; // pre-transit steps
const TICK_MS = 500; // marker progress tick
const TICKS = 20; // ~10 s en route

export default function DeliveryTrackingPage() {
  const router = useRouter();
  const delivery = useApp((s) => s.errands.deliveries.find((d) => d.id === PARCEL_ID));
  const updateDelivery = useApp((s) => s.updateDelivery);
  const updateActivity = useApp((s) => s.updateActivity);
  const addNotification = useApp((s) => s.addNotification);
  const step = delivery?.step ?? 0;
  const [tick, setTick] = useState(0);

  const path = useMemo(() => {
    const q = normalize(delivery?.address ?? "");
    const place = PLACES.find((p) => q && (normalize(p.name) === q || normalize(p.shortName) === q)) ?? getPlace("ganhi")!;
    return routeBetween(USER_POSITION, placeLngLat(place), 12);
  }, [delivery?.address]);

  useEffect(() => {
    if (!delivery || step >= LAST) return;
    if (step < EN_ROUTE) {
      const t = setTimeout(() => updateDelivery(PARCEL_ID, { step: step + 1 }), STEP_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (tick + 1 < TICKS) return setTick(tick + 1);
      setTick(TICKS);
      updateDelivery(PARCEL_ID, { step: LAST });
      updateActivity(`act-${PARCEL_ID}`, { status: "completed" });
      addNotification({ kind: "delivery", title: "Colis livré ✓", body: `Colis #${PARCEL_ID} livré à ${delivery.recipientName}`, href: "/delivery/tracking" });
    }, TICK_MS);
    return () => clearTimeout(t);
  }, [delivery, step, tick, updateDelivery, updateActivity, addNotification]);

  if (!delivery)
    return (
      <Page>
        <PageHeader title="Suivi du colis" back="/delivery" />
        <p className="text-body-md text-muted">Aucun colis en cours.</p>
        <ButtonLink href="/delivery" full className="mt-lg">Envoyer un colis</ButtonLink>
      </Page>
    );

  const done = step >= LAST;
  const progress = done ? 1 : step < EN_ROUTE ? 0 : tick / TICKS;
  const minutesLeft = Math.max(1, Math.ceil((1 - progress) * 14));

  return (
    <MapScreen>
      <MapView
        route={path}
        markers={[
          { id: "pickup", position: path[0], kind: "user" },
          { id: "dropoff", position: path[path.length - 1], kind: "destination" },
        ]}
        moving={{ path, progress, stepMs: TICK_MS, emoji: delivery.vehicle === "voiture" ? "🚗" : "🛵" }}
      />
      <FloatingButton aria-label="Retour" className="absolute left-md top-md z-10 lg:left-auto lg:right-md" onClick={() => router.push("/")}>
        <ArrowLeft className="size-5" />
      </FloatingButton>
      <BottomSheet
        footer={
          done ? (
            <ButtonLink href="/activity" full>
              Voir dans Activité
            </ButtonLink>
          ) : undefined
        }
      >
        <div className="flex items-start justify-between gap-md">
          <div className="min-w-0">
            <p className="text-caption text-muted">Colis #{PARCEL_ID}</p>
            <h2 className="text-h2 text-ink">{done ? "Colis livré ✓" : step < EN_ROUTE ? "Préparation de la course" : "En livraison"}</h2>
            <p className="text-caption text-muted">
              Vers {delivery.address}
              {!done && step >= EN_ROUTE && <> · <span className="num">{minutesLeft} min</span></>}
            </p>
          </div>
          <Price amount={delivery.price} />
        </div>

        <div className="mt-md flex items-center gap-md rounded-lg bg-surface-sunken p-md">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-label-md text-primary-dark" aria-hidden>{COURIER.avatar}</span>
          <div className="min-w-0 flex-1">
            <p className="text-label-md text-ink">Coursier {COURIER.firstName}</p>
            <p className="text-caption text-muted">⭐ {COURIER.rating} · {COURIER.vehicle} · <span className="num">{COURIER.plate}</span></p>
          </div>
          <a href={`tel:${COURIER.phone.replace(/\s/g, "")}`} aria-label={`Appeler ${COURIER.firstName}`} className="grid size-touch-target place-items-center rounded-full bg-surface text-ink shadow-card">
            <Phone className="size-5" />
          </a>
        </div>

        <div className="mt-lg">
          <Timeline steps={PARCEL_STEPS} current={step} />
        </div>
      </BottomSheet>
    </MapScreen>
  );
}
