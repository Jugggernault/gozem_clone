"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapScreen } from "@/components/MapScreen";
import { MapView } from "@/components/MapView";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/ui/button";
import { selectRideDriver, useApp } from "@/lib/store";
import { USER_POSITION } from "@/lib/mock/places";
import { DriverCard } from "../_trip/DriverCard";
import { ensureDraft } from "../_trip/trip";

const STEPS = ["Recherche d'un chauffeur...", "Recherche de chauffeurs à proximité", "Chauffeur trouvé ✓"];

export default function MatchingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const driver = useApp(selectRideDriver);

  useEffect(() => {
    ensureDraft();
    useApp.getState().setPhase("searching");
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => {
        useApp.getState().setPhase("matched");
        setStep(2);
      }, 3000),
      setTimeout(() => router.replace("/ride/tracking"), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  const found = step === 2;
  const cancel = () => {
    useApp.getState().setPhase("idle");
    router.push("/ride/options");
  };

  return (
    <MapScreen>
      <MapView center={USER_POSITION} zoom={15} markers={[{ id: "me", position: USER_POSITION, kind: "user" }]} interactive={false} />
      {!found && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" data-testid="radar" aria-hidden>
          <span className="absolute size-40 rounded-full bg-primary/30 animate-halo" />
          <span className="absolute size-40 rounded-full bg-primary/20 animate-halo [animation-delay:600ms]" />
          <span className="absolute size-40 rounded-full bg-primary/10 animate-halo [animation-delay:1200ms]" />
          <span className="relative size-5 rounded-full border-2 border-surface bg-primary shadow-float" />
        </div>
      )}
      <BottomSheet
        footer={
          !found ? (
            <Button variant="secondary" full onClick={cancel}>
              Annuler
            </Button>
          ) : undefined
        }
      >
        <p className="text-h2 text-ink" aria-live="polite">
          {STEPS[step]}
        </p>
        {found ? (
          <DriverCard driver={driver} className="mt-md rounded-lg bg-primary-soft p-md" />
        ) : (
          <div className="mt-md space-y-sm" aria-hidden>
            <div className="h-1 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${(step + 1) * 45}%` }} />
            </div>
            <p className="text-caption text-muted">Nous contactons les chauffeurs les plus proches de vous.</p>
          </div>
        )}
      </BottomSheet>
    </MapScreen>
  );
}
