import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// DESIGN.md: button-primary / button-secondary / button-danger / chip / chip-selected
const VARIANTS = {
  primary: "h-13 px-sheet-padding bg-primary-dark text-on-primary hover:bg-ink hover:text-on-ink",
  secondary: "h-12 px-md bg-surface-sunken text-on-surface hover:bg-border",
  danger: "h-13 px-sheet-padding bg-error text-on-error",
  ghost: "h-touch-target px-md text-on-surface hover:bg-surface-sunken",
  chip: "h-9 px-3 bg-surface-sunken text-on-surface text-caption",
  "chip-selected": "h-9 px-3 bg-ink text-on-ink text-caption",
} as const;
export type ButtonVariant = keyof typeof VARIANTS;

export const buttonClass = (variant: ButtonVariant = "primary", full = false, className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-sm rounded-full text-label-md transition-colors disabled:opacity-50 disabled:pointer-events-none select-none",
    VARIANTS[variant],
    full && "w-full",
    className,
  );

export function Button({ variant = "primary", full, className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant; full?: boolean }) {
  return <button type="button" className={buttonClass(variant, full, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", full, className, ...props }: ComponentProps<typeof Link> & { variant?: ButtonVariant; full?: boolean }) {
  return <Link className={buttonClass(variant, full, className)} {...props} />;
}
