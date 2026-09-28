"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Briefcase, Clock, House, MapPin, SearchX } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { FloatingButton, MapScreen } from "@/components/MapScreen";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { COTONOU_CENTER, PLACES, RECENT_PLACE_IDS, USER_POSITION, getPlace, searchPlaces } from "@/lib/mock/places";
import { useApp } from "@/lib/store";

const CHIPS = [
  { label: "Maison", placeId: "maison", icon: House },
  { label: "Travail", placeId: "travail", icon: Briefcase },
  { label: "Lieu récent", placeId: RECENT_PLACE_IDS[0], icon: Clock },
];

export default function RideSearchPage() {
  const router = useRouter();
  const startRide = useApp((s) => s.startRide);
  const [q, setQ] = useState("");
  const results = q.trim() ? searchPlaces(q) : RECENT_PLACE_IDS.map((id) => getPlace(id)!).filter(Boolean);

  const pick = (placeId: string) => {
    startRide(placeId);
    router.push("/ride/options");
  };

  return (
    <MapScreen>
      <MapView center={COTONOU_CENTER} zoom={13} markers={[{ id: "me", position: USER_POSITION, kind: "user" }]} fit={[]} />
      <FloatingButton aria-label="Retour" className="absolute left-md top-md z-10 lg:hidden" onClick={() => router.back()}>
        <ArrowLeft className="size-5" />
      </FloatingButton>
      <BottomSheet title="Où allez-vous ?">
        <label className="flex h-13 items-center gap-sm rounded-md bg-surface-sunken px-3.5 focus-within:ring-2 focus-within:ring-primary-dark">
          <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
          <input
            autoFocus
            aria-label="Destination"
            placeholder="Destination"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-body-lg text-on-surface outline-none placeholder:text-muted"
          />
        </label>
        <div className="mt-md flex flex-wrap gap-sm">
          {CHIPS.map(({ label, placeId, icon: Icon }) => (
            <Button key={label} variant="chip" onClick={() => pick(placeId)}>
              <Icon className="size-4" aria-hidden /> {label}
            </Button>
          ))}
        </div>
        {!q.trim() && <p className="mt-lg text-caption text-muted">Récents</p>}
        {results.length ? (
          <ul className="mt-sm divide-y divide-border" aria-label="Résultats">
            {results.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => pick(p.id)} className="flex min-h-14 w-full items-center gap-md py-sm text-left hover:bg-surface-sunken">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-muted">
                    <MapPin className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label-md text-on-surface">{p.name}</span>
                    <span className="block truncate text-caption text-muted">{p.subtitle}</span>
                  </span>
                  <span className="num text-caption text-muted">{p.distanceKm} km</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-lg flex flex-col items-center gap-sm py-lg text-center">
            <SearchX className="size-8 text-muted" aria-hidden />
            <p className="text-label-md text-on-surface">Aucun lieu trouvé pour « {q.trim()} »</p>
            <p className="text-caption text-muted">Essayez un quartier, un marché ou un monument ({PLACES.length} lieux à Cotonou).</p>
          </div>
        )}
      </BottomSheet>
    </MapScreen>
  );
}
