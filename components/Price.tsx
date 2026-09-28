import { cn } from "@/lib/utils";

/** "1 500 FCFA" in mono tabular digits; "FCFA" at ~0.7× in muted (DESIGN.md Typography). */
export function Price({ amount, className, hero }: { amount: number; className?: string; hero?: boolean }) {
  const n = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (
    <span className={cn("num whitespace-nowrap", hero ? "text-price-hero" : "text-price", className)}>
      {n}
      <span className="ml-1 text-[0.7em] font-medium opacity-70">FCFA</span>
    </span>
  );
}
