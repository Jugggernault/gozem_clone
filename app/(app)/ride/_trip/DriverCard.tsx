import type { Driver } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatInt } from "./trip";

/** DESIGN.md driver card: 56px avatar, h3 name, amber rating + trips, mono plate chip. */
export function DriverCard({ driver, className, children }: { driver: Driver; className?: string; children?: React.ReactNode }) {
  return (
    <div data-testid="driver-card" className={cn("flex items-center gap-md", className)}>
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-soft text-h3 text-primary-dark" aria-hidden>
        {driver.avatar}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-h3 text-ink">{driver.name}</p>
        <p className="text-caption text-muted">
          <span className="text-on-surface">⭐ {driver.rating.toFixed(1)}</span> · {formatInt(driver.trips)} trajets · {driver.vehicle}
        </p>
      </div>
      <span className="num shrink-0 rounded-sm border-2 border-ink bg-surface-sunken px-sm py-xs text-caption text-ink">{driver.plate}</span>
      {children}
    </div>
  );
}
