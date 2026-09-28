import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Non-map page column: 16px gutter, 720px max (DESIGN.md Layout). */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-180 px-gutter pb-xl", className)}>{children}</div>;
}
