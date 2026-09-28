"use client";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Page } from "@/components/Page";
import { BellButton } from "@/components/shell/BellButton";
import { Avatar } from "@/components/shell/Avatar";
import { useApp } from "@/lib/store";

// F01 placeholder home — F02 replaces this with the full home (services grid, quick actions, promos).
export default function Home() {
  const firstName = useApp((s) => s.profile.user.firstName);
  return (
    <Page>
      <header className="flex items-center justify-between py-md">
        <div>
          <h1 className="text-h1 text-ink">Bonjour {firstName} 👋</h1>
          <p className="text-caption text-muted">📍 Cotonou</p>
        </div>
        <div className="flex items-center gap-sm lg:hidden">
          <BellButton />
          <Avatar />
        </div>
      </header>
      <h2 className="mt-md text-h2 text-ink">Que voulez-vous faire ?</h2>
      <Link href="/ride/search" className="mt-md flex items-center gap-md rounded-lg bg-surface p-md shadow-card">
        <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary-dark"><MapPin className="size-6" aria-hidden /></span>
        <span className="flex-1 text-h3 text-ink">Où allez-vous ?</span>
        <ArrowRight className="size-5 text-muted" aria-hidden />
      </Link>
    </Page>
  );
}
