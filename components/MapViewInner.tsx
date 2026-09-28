"use client";
import { Component, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";
import { setWorkerUrl, type StyleSpecification } from "maplibre-gl";
import { Navigation2 } from "lucide-react";
import type { LngLat } from "@/lib/types";
import { bounds, pointAlong } from "@/lib/geo";
import { COTONOU_CENTER } from "@/lib/mock/places";
import { cn } from "@/lib/utils";
import type { MapMarker, MapViewProps, MovingMarker } from "./MapView";

// Bundlers break maplibre's import.meta.url worker lookup; serve it from public/ (copied by `postinstall`).
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const cssVar = (name: string) => (typeof window === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue(name).trim());
const fallbackStyle = (): StyleSpecification => ({
  version: 8,
  sources: {},
  layers: [{ id: "bg", type: "background", paint: { "background-color": cssVar("--color-surface-sunken") || "white" } }],
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Tween progress toward target over stepMs; returns the displayed position + heading. */
function useGlide(m?: MovingMarker) {
  const [shown, setShown] = useState(m?.progress ?? 0);
  const shownRef = useRef(shown);
  useEffect(() => {
    if (!m) return;
    const from = shownRef.current;
    const to = m.progress;
    const dur = m.stepMs ?? 1500;
    if (Math.abs(to - from) < 1e-6) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min((t - t0) / dur, 1);
      const v = from + (to - from) * k;
      shownRef.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m?.progress, m?.stepMs]);
  return m && m.path.length ? pointAlong(m.path, shown) : null;
}

function MarkerIcon({ kind, heading = 0, moving, emoji }: { kind: MapMarker["kind"]; heading?: number; moving?: boolean; emoji?: string }) {
  if (kind === "user")
    return (
      <span className="relative grid size-6 place-items-center" data-testid="map-marker-user">
        <span className="absolute inset-0 rounded-full bg-primary animate-halo" />
        <span className="relative size-4 rounded-full border-2 border-surface bg-primary shadow-float" />
      </span>
    );
  if (kind === "destination")
    return <span data-testid="map-marker-destination" className="block size-5 rounded-sm border-2 border-surface bg-ink shadow-float" />;
  if (kind === "stop")
    return <span data-testid="map-marker-stop" className="block size-4 rounded-full border-2 border-surface bg-ink shadow-float" />;
  return (
    <span
      data-testid={moving ? "moving-marker" : "map-marker-vehicle"}
      className={cn("relative grid place-items-center rounded-full bg-surface shadow-float", moving ? "size-11" : "size-8")}
    >
      <Navigation2 className={cn(moving ? "size-5 text-primary-dark" : "size-4 text-muted")} fill="currentColor" style={{ transform: `rotate(${heading}deg)` }} aria-hidden />
      {emoji && <span className="absolute -right-1 -top-1 text-caption" aria-hidden>{emoji}</span>}
    </span>
  );
}

export default function MapViewInner(props: MapViewProps) {
  const [webgl] = useState(hasWebGL);
  if (!webgl) return <SvgMap {...props} />;
  return (
    <MapBoundary fallback={<SvgMap {...props} />}>
      <GLMap {...props} />
    </MapBoundary>
  );
}

class MapBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function usePadding(p: MapViewProps["padding"]) {
  const [desktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);
  return {
    top: p?.top ?? 80,
    right: p?.right ?? 48,
    bottom: p?.bottom ?? (desktop ? 48 : 340),
    left: p?.left ?? (desktop ? 470 : 48),
  };
}

function GLMap({ center, zoom = 13, route, markers = [], moving, fit, padding, followMoving, interactive = true }: MapViewProps) {
  const ref = useRef<MapRef>(null);
  const [style, setStyle] = useState<string | StyleSpecification>(STYLE_URL);
  const [loaded, setLoaded] = useState(false);
  const pad = usePadding(padding);
  const glide = useGlide(moving);
  const routeColor = useMemo(() => cssVar("--color-map-route") || "black", []);
  const fitPts = useMemo(() => fit ?? [...(route ?? []), ...markers.map((m) => m.position)], [fit, route, markers]);
  const fitKey = fitPts.length ? `${fitPts.length}:${fitPts[0]}:${fitPts[fitPts.length - 1]}` : "";

  // Tiles never loaded (offline / blocked) → tinted fallback style; route & markers still render.
  useEffect(() => {
    const t = setTimeout(() => !loaded && setStyle(fallbackStyle()), 8000);
    return () => clearTimeout(t);
  }, [loaded]);

  useEffect(() => {
    const map = ref.current;
    if (!map || !loaded || fitPts.length < 2) return;
    map.fitBounds(bounds(fitPts), { padding: pad, duration: 600, maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, loaded]);

  useEffect(() => {
    if (followMoving && glide && loaded) ref.current?.easeTo({ center: glide.position, duration: 900 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followMoving, loaded, glide && Math.round(glide.position[0] * 5000), glide && Math.round(glide.position[1] * 5000)]);

  const initialViewState =
    fitPts.length >= 2
      ? { bounds: bounds(fitPts), fitBoundsOptions: { padding: pad, maxZoom: 16 } }
      : { longitude: (center ?? fitPts[0] ?? COTONOU_CENTER)[0], latitude: (center ?? fitPts[0] ?? COTONOU_CENTER)[1], zoom };

  return (
    <MapGL
      ref={ref}
      initialViewState={initialViewState}
      mapStyle={style}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
      interactive={interactive}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        if (!loaded && typeof style === "string") setStyle(fallbackStyle());
        console.warn("[MapView]", e.error?.message);
      }}
    >
      {route && route.length > 1 && (
        <Source id="route" type="geojson" data={{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route } }}>
          <Layer id="route-line" type="line" layout={{ "line-cap": "round", "line-join": "round" }} paint={{ "line-color": routeColor, "line-width": 5 }} />
        </Source>
      )}
      {markers.map((m) => (
        <Marker key={m.id} longitude={m.position[0]} latitude={m.position[1]} anchor="center">
          <MarkerIcon kind={m.kind} heading={m.heading} />
        </Marker>
      ))}
      {glide && (
        <Marker longitude={glide.position[0]} latitude={glide.position[1]} anchor="center">
          <MarkerIcon kind="vehicle" moving heading={glide.heading} emoji={moving?.emoji} />
        </Marker>
      )}
    </MapGL>
  );
}

/** No-WebGL fallback: tinted background with an SVG route and absolutely-positioned markers. */
function SvgMap({ route, markers = [], moving, fit, center }: MapViewProps) {
  const glide = useGlide(moving);
  const pts: LngLat[] = [...(fit ?? []), ...(route ?? []), ...markers.map((m) => m.position), ...(moving?.path ?? [])];
  if (!pts.length) pts.push(center ?? COTONOU_CENTER);
  const [[x0, y0], [x1, y1]] = bounds(pts);
  const w = Math.max(x1 - x0, 0.01);
  const h = Math.max(y1 - y0, 0.01);
  // Keep points in the upper-middle area (sheet covers the bottom on mobile).
  const proj = ([x, y]: LngLat) => [15 + ((x - x0) / w) * 70, 12 + ((y1 - y) / h) * 40] as const;
  return (
    <div className="relative size-full overflow-hidden bg-surface-sunken" data-testid="map-fallback">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
        {route && route.length > 1 && (
          <polyline points={route.map((p) => proj(p).join(",")).join(" ")} fill="none" strokeWidth="5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" className="stroke-map-route" />
        )}
      </svg>
      {markers.map((m) => {
        const [l, t] = proj(m.position);
        return (
          <div key={m.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${l}%`, top: `${t}%` }}>
            <MarkerIcon kind={m.kind} heading={m.heading} />
          </div>
        );
      })}
      {glide && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${proj(glide.position)[0]}%`, top: `${proj(glide.position)[1]}%` }}>
          <MarkerIcon kind="vehicle" moving heading={glide.heading} emoji={moving?.emoji} />
        </div>
      )}
    </div>
  );
}
