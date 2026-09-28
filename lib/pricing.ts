import type { VehicleId } from "@/lib/types";
import { getPlace } from "@/lib/mock/places";
import { getVehicle } from "@/lib/mock/vehicles";

export const REFERENCE_KM = 4.8; // airport trip: basePrice is exact there
export const STOP_EXTRA_KM = 1.5;
export const STOP_EXTRA_MIN = 4;
export const SERVICE_FEE = 200; // receipt: Course (price − 200) + Frais 200
export const MAX_STOPS = 2;
const round100 = (n: number) => Math.round(n / 100) * 100;

export type RideQuote = { price: number; originalPrice: number; distanceKm: number; durationMin: number; pickupEtaMin: number; course: number; fee: number };

/**
 * Deterministic upfront price. Airport: Zem 1 500 / Tricycle 2 000 / Taxi 3 000 / Comfort 4 500 · 12 min · 4.8 km.
 * Akpakpa (6.4 km): Zem 2 000 (= +500 vs airport). Promo 20%: Zem airport 1 200.
 */
export function quoteRide(opts: { destinationId: string; vehicleId: VehicleId; stops?: string[]; discountPct?: number }): RideQuote {
  const place = getPlace(opts.destinationId);
  const v = getVehicle(opts.vehicleId);
  const stops = opts.stops?.length ?? 0;
  const distanceKm = Math.round(((place?.distanceKm ?? REFERENCE_KM) + stops * STOP_EXTRA_KM) * 10) / 10;
  const durationMin = (place?.durationMin ?? 12) + stops * STOP_EXTRA_MIN;
  const originalPrice = Math.max(round100((v.basePrice * distanceKm) / REFERENCE_KM), 500);
  const price = opts.discountPct ? round100(originalPrice * (1 - opts.discountPct / 100)) : originalPrice;
  return { price, originalPrice, distanceKm, durationMin, pickupEtaMin: v.etaMin, course: price - SERVICE_FEE, fee: SERVICE_FEE };
}

/** "HH:MM" arrival time, n minutes from now. */
export const arrivalTime = (minutes: number, from = new Date()) =>
  new Date(from.getTime() + minutes * 60_000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
