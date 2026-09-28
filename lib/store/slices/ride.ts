import type { PaymentMethod, VehicleId } from "@/lib/types";
import { MAX_STOPS, quoteRide } from "@/lib/pricing";
import { getPromo } from "@/lib/mock/promos";
import { driverForVehicle } from "@/lib/mock/vehicles";
import { type AppState, type Slice, nowIso, uid } from "../types";

export type RidePhase = "idle" | "searching" | "matched" | "driver_arriving" | "arrived" | "in_progress" | "completed" | "cancelled";
export type RideSchedule = { mode: "now" | "today" | "tomorrow" | "custom"; date?: string; time?: string };
export type RideState = {
  rideId: string | null;
  phase: RidePhase;
  destinationId: string | null; // place id (lib/mock/places)
  vehicleId: VehicleId;
  stops: string[]; // place ids, max 2
  schedule: RideSchedule;
  passenger: { mode: "me" | "other"; name?: string; phone?: string };
  preferences: { ac: boolean; noCall: boolean; luggage: boolean };
  paymentMethod: PaymentMethod | null; // null → profile.paymentMethod
  activePromoId: string | null; // e.g. "ride20" (−20% on next ride), cleared by completeRide
  driverId: string | null;
  progress: number; // 0..1 along the current leg; persisted so reload keeps position
  phaseStartedAt: string | null;
  tip: number;
  rating: number;
  tags: string[];
};
export type RideSlice = {
  ride: RideState;
  setRide: (patch: Partial<RideState>) => void;
  /** New draft toward a destination (keeps vehicle/payment/promo). */
  startRide: (destinationId: string) => void;
  addStop: (placeId: string) => { ok: true } | { ok: false; error: string };
  removeStop: (index: number) => void;
  setPhase: (phase: RidePhase) => void; // also resets progress + phaseStartedAt; assigns driver on "matched"
  resetRide: () => void;
};

export const initialRide = (): RideState => ({
  rideId: null, phase: "idle", destinationId: null, vehicleId: "zem", stops: [], schedule: { mode: "now" },
  passenger: { mode: "me" }, preferences: { ac: false, noCall: false, luggage: false }, paymentMethod: null,
  activePromoId: null, driverId: null, progress: 0, phaseStartedAt: null, tip: 0, rating: 0, tags: [],
});

/** Current quote for the ride draft (applies active promo). */
export const selectRideQuote = (s: AppState) =>
  s.ride.destinationId
    ? quoteRide({ destinationId: s.ride.destinationId, vehicleId: s.ride.vehicleId, stops: s.ride.stops, discountPct: getPromo(s.ride.activePromoId)?.discountPct })
    : null;
export const selectRidePayment = (s: AppState) => s.ride.paymentMethod ?? s.profile.paymentMethod;
export const selectRideDriver = (s: AppState) => driverForVehicle(s.ride.vehicleId);

export const createRideSlice: Slice<RideSlice> = (set, get) => ({
  ride: initialRide(),
  setRide: (patch) => set((s) => ({ ride: { ...s.ride, ...patch } })),
  startRide: (destinationId) =>
    set((s) => ({ ride: { ...initialRide(), vehicleId: s.ride.vehicleId, paymentMethod: s.ride.paymentMethod, activePromoId: s.ride.activePromoId, destinationId, rideId: uid("ride") } })),
  addStop: (placeId) => {
    if (get().ride.stops.length >= MAX_STOPS) return { ok: false, error: `Maximum ${MAX_STOPS} arrêts` };
    set((s) => ({ ride: { ...s.ride, stops: [...s.ride.stops, placeId] } }));
    return { ok: true };
  },
  removeStop: (index) => set((s) => ({ ride: { ...s.ride, stops: s.ride.stops.filter((_, i) => i !== index) } })),
  setPhase: (phase) =>
    set((s) => ({
      ride: {
        ...s.ride, phase, progress: 0, phaseStartedAt: nowIso(),
        driverId: phase === "matched" ? driverForVehicle(s.ride.vehicleId).id : s.ride.driverId,
      },
    })),
  resetRide: () => set((s) => ({ ride: { ...initialRide(), paymentMethod: s.ride.paymentMethod } })),
});
