"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Remote Unsplash photo; falls back to the emoji on a sunken tile if it fails to load. */
export function RestaurantImage({ src, emoji, alt, className }: { src: string; emoji: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative grid place-items-center overflow-hidden bg-surface-sunken", className)}>
      <span className="text-hero" aria-hidden>{emoji}</span>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element -- remote mock photo with emoji fallback
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 size-full object-cover" />
      )}
    </div>
  );
}
