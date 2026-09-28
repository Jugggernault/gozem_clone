"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TABS, isTabActive } from "./nav";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex max-w-120 justify-around px-sm">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isTabActive(href, pathname);
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} className="flex h-16 flex-col items-center justify-center gap-xs">
                <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors", active ? "bg-primary-soft text-primary-dark" : "text-muted")}>
                  <Icon className="size-5" fill={active ? "currentColor" : "none"} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                </span>
                <span className={cn("text-caption", active ? "font-bold text-primary-dark" : "font-medium text-muted")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
