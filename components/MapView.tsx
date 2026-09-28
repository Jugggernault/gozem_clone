"use client";
import dynamic from "next/dynamic";
import type { LngLat } from "@/lib/types";

export type MapMarker = {
  id: string;
  position: LngLat;
  kind: "user" | "destination" | "stop" | "vehicle";
  heading?: number; // degrees, vehicle only
  label?: string;
};
/** A marker that glides along `path`. Drive it by changing `progress` (0..1); each change tweens over stepMs and rotates to heading. */
export type MovingMarker = { path: LngLat[]; progress: number; stepMs?: number; emoji?: string };
export type MapViewProps = {
  center?: LngLat;
  zoom?: number;
  route?: LngLat[];
  markers?: MapMarker[];
  moving?: MovingMarker;
  /** Points to fit in view; defaults to route + markers. Refits when their count/ends change. */
  fit?: LngLat[];
  /** Extra padding (px) so the sheet doesn't cover the route. Defaults suit a bottom sheet / left panel. */
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
  followMoving?: boolean;
  interactive?: boolean;
  className?: string;
};

const MapViewInner = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => <div className="size-full bg-surface-sunken" aria-hidden />,
});

/**
 * MapLibre map (OpenFreeMap keyless style). Client-only. Falls back to a tinted
 * background (keeping route + markers) if tiles fail, and to an SVG render without WebGL.
 * Markers expose data-testid="map-marker-<kind>" and the moving one data-testid="moving-marker".
 */
export function MapView(props: MapViewProps) {
  return (
    <div className={props.className ?? "absolute inset-0"}>
      <MapViewInner {...props} />
    </div>
  );
}
