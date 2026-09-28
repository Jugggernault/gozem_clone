import { useApp, type RidePhase } from "@/lib/store";

/** Demo timeline (ticks are 1 s): driver approach, pause at pickup, then the trip. */
export const TICK_MS = 1000;
export const APPROACH_TICKS = 8;
export const ARRIVED_MS = 3000;
export const TRIP_TICKS = 12;
export const APPROACH_MIN = 3;
export const APPROACH_KM = 1.2;
export const SHARE_CODE = "8K92X";
export const SHARE_URL = `https://gozem.app/t/${SHARE_CODE}`;
export const DEFAULT_DESTINATION = "aeroport";

export const LIVE_PHASES: RidePhase[] = ["matched", "driver_arriving", "arrived", "in_progress"];

const newId = () => `ride-${Date.now().toString(36)}`;

/** Make sure a ride draft exists (standalone demo: default airport ride). */
export function ensureDraft() {
  const s = useApp.getState();
  if (!s.ride.destinationId) s.startRide(DEFAULT_DESTINATION);
  if (!useApp.getState().ride.rideId) s.setRide({ rideId: newId() });
}

/** Tracking needs a live ride: seed a matched airport ride when there is none. */
export function ensureLiveRide() {
  const s = useApp.getState();
  if (!s.ride.destinationId || !LIVE_PHASES.includes(s.ride.phase)) {
    s.startRide(s.ride.destinationId && s.ride.phase === "idle" ? s.ride.destinationId : DEFAULT_DESTINATION);
    s.setPhase("matched");
  }
  if (useApp.getState().ride.phase === "matched") s.setPhase("driver_arriving");
}

/** "1,2" style km with one decimal. */
export const formatKm = (km: number) => Math.max(km, 0).toFixed(1).replace(".", ",");
/** 1284 → "1 284" (narrow no-break space, like prices). */
export const formatInt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
