import type { LngLat } from "@/lib/types";
import { USER_POSITION, getPlace, placeLngLat } from "./places";

// Hand-drawn polylines roughly following Cotonou roads. Everything else uses routeBetween's gentle curve.
const HARDCODED: Record<string, LngLat[]> = {
  aeroport: [USER_POSITION, [2.4195, 6.3748], [2.4130, 6.3740], [2.4065, 6.3712], [2.4002, 6.3688], [2.3955, 6.3660], [2.3920, 6.3628], [2.3890, 6.3605], [2.3862, 6.3588], [2.3844, 6.3573]],
  akpakpa: [USER_POSITION, [2.4262, 6.3742], [2.4310, 6.3712], [2.4368, 6.3690], [2.4430, 6.3688], [2.4500, 6.3695], [2.4560, 6.37]],
  maison: [USER_POSITION, [2.4130, 6.3740], [2.4010, 6.3850], [2.3900, 6.3960], [2.3760, 6.4100], [2.3620, 6.4250], [2.3520, 6.4380], [2.3440, 6.4485]],
};

/** Curved fallback path with n points (deterministic). */
export function routeBetween(a: LngLat, b: LngLat, n = 10): LngLat[] {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const bend = Math.sin(Math.PI * t) * 0.12; // perpendicular offset
    return [a[0] + dx * t - dy * bend, a[1] + dy * t + dx * bend] as LngLat;
  });
}

/** Route from "Ma position" to a place, optionally through stops (place ids). */
export function routeTo(placeId: string, stopIds: string[] = []): LngLat[] {
  const dest = getPlace(placeId);
  if (!dest) return [];
  if (!stopIds.length && HARDCODED[placeId]) return HARDCODED[placeId];
  const pts = [USER_POSITION, ...stopIds.map((id) => getPlace(id)).filter(Boolean).map((p) => placeLngLat(p!)), placeLngLat(dest)];
  return pts.slice(1).flatMap((p, i) => routeBetween(pts[i], p, 8).slice(i === 0 ? 0 : 1));
}

/** Driver's approach path to the user (starts ~1.2 km away). */
export const DRIVER_APPROACH: LngLat[] = [[2.4330, 6.3665], [2.4312, 6.3682], [2.4295, 6.3700], [2.4280, 6.3715], [2.4262, 6.3730], [2.4248, 6.3742], [2.4236, 6.3752], USER_POSITION];

/** Idle vehicles scattered around the user on /ride/options. */
export const IDLE_VEHICLES: { id: string; position: LngLat; heading: number }[] = [
  { id: "idle-1", position: [2.4262, 6.3782], heading: 40 },
  { id: "idle-2", position: [2.4180, 6.3739], heading: 120 },
  { id: "idle-3", position: [2.4205, 6.3801], heading: 260 },
  { id: "idle-4", position: [2.4290, 6.3745], heading: 300 },
];
