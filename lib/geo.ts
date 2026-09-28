import type { LngLat } from "@/lib/types";

const R = 6371; // km
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(a: LngLat, b: LngLat) {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const pathLengthKm = (path: LngLat[]) => path.slice(1).reduce((s, p, i) => s + distanceKm(path[i], p), 0);

/** Compass bearing in degrees (0 = north, clockwise). */
export function bearing(a: LngLat, b: LngLat) {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1])) - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Position + heading at fraction t (0..1) of the path's length. */
export function pointAlong(path: LngLat[], t: number): { position: LngLat; heading: number } {
  if (path.length === 0) return { position: [0, 0], heading: 0 };
  if (path.length === 1) return { position: path[0], heading: 0 };
  const total = pathLengthKm(path);
  let target = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 1; i < path.length; i++) {
    const seg = distanceKm(path[i - 1], path[i]);
    if (target <= seg || i === path.length - 1) {
      const f = seg === 0 ? 0 : Math.min(target / seg, 1);
      const [a, b] = [path[i - 1], path[i]];
      return { position: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], heading: bearing(a, b) };
    }
    target -= seg;
  }
  return { position: path[path.length - 1], heading: 0 };
}

/** [[minLng,minLat],[maxLng,maxLat]] */
export function bounds(points: LngLat[]): [LngLat, LngLat] {
  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}
