"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { BellButton } from "./BellButton";
import { Avatar } from "./Avatar";

/** Desktop (≥1024px) top bar: global search (→ /explore?q=), assistant, bell, avatar. */
export function TopBar() {
  const router = useRouter();
  return (
    <header className="fixed inset-x-0 top-0 z-30 hidden h-16 items-center gap-md border-b border-border bg-surface pl-64 pr-lg lg:flex">
      <form
        role="search"
        className="flex h-11 max-w-120 flex-1 items-center gap-sm rounded-md bg-surface-sunken px-md"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q")?.toString() ?? "";
          router.push(`/explore${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        }}
      >
        <Search className="size-5 text-muted" aria-hidden />
        <input name="q" type="search" placeholder="Rechercher un lieu, un restaurant, un produit…" aria-label="Recherche globale" className="h-full flex-1 bg-transparent text-body-md outline-none placeholder:text-muted" />
      </form>
      <div className="ml-auto flex items-center gap-sm">
        <Link href="/assistant" className="flex h-10 items-center gap-xs rounded-full bg-primary-soft px-md text-label-md text-primary-dark hover:bg-surface-sunken">
          ✨ Gozem Assistant
        </Link>
        <BellButton />
        <Avatar />
      </div>
    </header>
  );
}
