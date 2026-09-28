import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Full-bleed map layout: fills the viewport on mobile, and the area right of the
 * sidebar / below the top bar on desktop. Put <MapView/>, floating buttons and a persistent <BottomSheet> inside.
 */
export function MapScreen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("fixed inset-0 overflow-hidden bg-surface-sunken lg:left-60 lg:top-16", className)}>{children}</div>;
}

/** Round white floating map button (back, 🛡 Sécurité…). */
export function FloatingButton({ children, className, ...props }: React.ComponentProps<"button">) {
  return (
    <button type="button" className={cn("grid min-h-12 min-w-12 place-items-center rounded-full bg-surface px-sm text-ink shadow-float", className)} {...props}>
      {children}
    </button>
  );
}
