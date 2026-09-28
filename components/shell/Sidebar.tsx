"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Star, Tag, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { TABS, isTabActive } from "./nav";
import { Logo } from "./Logo";

const MORE = [
  { href: "/food", label: "Manger", icon: UtensilsCrossed },
  { href: "/gowin", label: "GoWin", icon: Star },
  { href: "/promotions", label: "Offres", icon: Tag },
  { href: "/help", label: "Aide", icon: CircleHelp },
];

export function Sidebar() {
  const pathname = usePathname();
  const item = (href: string, label: string, Icon: (typeof TABS)[number]["icon"], active: boolean) => (
    <li key={href}>
      <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex h-12 items-center gap-md rounded-full px-md transition-colors", active ? "bg-primary-soft text-primary-dark" : "text-on-surface hover:bg-surface-sunken")}>
        <Icon className="size-5" fill={active ? "currentColor" : "none"} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
        <span className={cn("text-body-md", active ? "font-bold" : "font-medium")}>{label}</span>
      </Link>
    </li>
  );
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center px-lg">
        <Link href="/" aria-label="Gozem, accueil"><Logo /></Link>
      </div>
      <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-md py-sm">
        <ul className="flex flex-col gap-xs">{TABS.map((t) => item(t.href, t.label, t.icon, isTabActive(t.href, pathname)))}</ul>
        <p className="mt-lg mb-sm px-md text-caption text-muted">Services</p>
        <ul className="flex flex-col gap-xs">{MORE.map((t) => item(t.href, t.label, t.icon, pathname.startsWith(t.href)))}</ul>
      </nav>
    </aside>
  );
}
