"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Title row for non-map pages. back: a path, or true for router.back() (falls back to "/").
 */
export function PageHeader({ title, subtitle, back, right, className }: { title: ReactNode; subtitle?: ReactNode; back?: string | true; right?: ReactNode; className?: string }) {
  const router = useRouter();
  const btn = "grid size-touch-target shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card hover:bg-surface-sunken";
  return (
    <header className={cn("flex items-center gap-md py-md", className)}>
      {back === true ? (
        <button type="button" aria-label="Retour" className={btn} onClick={() => (history.length > 1 ? router.back() : router.push("/"))}>
          <ArrowLeft className="size-5" />
        </button>
      ) : back ? (
        <Link href={back} aria-label="Retour" className={btn}>
          <ArrowLeft className="size-5" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-h1 text-ink">{title}</h1>
        {subtitle && <p className="text-caption text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
