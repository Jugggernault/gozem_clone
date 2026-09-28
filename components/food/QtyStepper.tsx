"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** + / qty / − stepper. Shows only "+" at 0. */
export function QtyStepper({ name, qty, onChange, className }: { name: string; qty: number; onChange: (qty: number) => void; className?: string }) {
  const btn = "grid size-touch-target place-items-center rounded-full transition-colors";
  return (
    <div className={cn("flex items-center gap-xs", className)}>
      {qty > 0 && (
        <>
          <button type="button" aria-label={`Retirer ${name}`} onClick={() => onChange(qty - 1)} className={cn(btn, "bg-surface-sunken text-ink hover:bg-border")}>
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="num w-6 text-center text-label-md text-ink" aria-label={`Quantité ${name}`}>{qty}</span>
        </>
      )}
      <button type="button" aria-label={`Ajouter ${name}`} onClick={() => onChange(qty + 1)} className={cn(btn, "bg-primary-dark text-on-primary hover:bg-ink")}>
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
