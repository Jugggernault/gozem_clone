import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Labelled input (DESIGN.md input: sunken, md radius, 52px). */
export function Field({ label, className, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-xs block text-caption text-muted">{label}</span>
      <input className={cn("h-13 w-full rounded-md bg-surface-sunken px-3.5 text-body-lg text-on-surface outline-none placeholder:text-muted focus:ring-2 focus:ring-primary-dark", className)} {...props} />
    </label>
  );
}
