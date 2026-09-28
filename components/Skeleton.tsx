import { cn } from "@/lib/utils";

/** Shimmering surface-sunken block. Size it with className to match the final layout. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-md", className)} />;
}
