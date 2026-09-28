import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Vertical step timeline: ✓ done, ● current, ○ upcoming. The last step shows ✓ once reached. */
export function Timeline({ steps, current }: { steps: readonly string[]; current: number }) {
  const last = steps.length - 1;
  return (
    <ol className="flex flex-col gap-md" aria-label="Suivi">
      {steps.map((label, i) => {
        const state = i < current || (i === current && current === last) ? "done" : i === current ? "current" : "todo";
        return (
          <li key={label} data-testid="timeline-step" data-state={state} aria-current={state === "current" ? "step" : undefined} className="flex items-center gap-md">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full",
                state === "done" && "bg-primary-dark text-on-primary",
                state === "current" && "bg-primary-soft ring-2 ring-primary-dark",
                state === "todo" && "border-2 border-border bg-surface",
              )}
              aria-hidden
            >
              {state === "done" ? <Check className="size-4" /> : state === "current" ? <span className="size-2.5 animate-pulse rounded-full bg-primary-dark" /> : null}
            </span>
            <span className={cn("text-body-md", state === "todo" ? "text-muted" : "text-ink", state === "current" && "font-semibold")}>
              {label}
              {state === "done" && <span className="sr-only"> (terminé)</span>}
              {state === "current" && <span className="sr-only"> (en cours)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
