"use client";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, ChevronRight, CircleHelp, CreditCard, Globe, MapPin, RotateCcw, ShieldCheck, Star, UserRound } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/shell/Avatar";
import { useApp } from "@/lib/store";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account/profile", label: "Informations personnelles", icon: UserRound },
  { href: "/account/addresses", label: "Adresses", icon: MapPin },
  { href: "/account/payment", label: "Moyens de paiement", icon: CreditCard },
  { href: "/account/security", label: "Sécurité", icon: ShieldCheck },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/language", label: "Langue", icon: Globe },
  { href: "/help", label: "Aide", icon: CircleHelp },
];

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-touch-target cursor-pointer items-center justify-between gap-md px-md">
      <span className="text-body-md">{label}</span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative h-7 w-12 rounded-full transition-colors", checked ? "bg-primary-dark" : "bg-border")}>
        <span className={cn("absolute top-1 size-5 rounded-full bg-surface shadow-card transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
      </button>
    </label>
  );
}

export default function AccountPage() {
  const user = useApp((s) => s.profile.user);
  const balance = useApp((s) => s.wallet.balance);
  const points = useApp((s) => s.points.total);
  const demo = useApp((s) => s.demo);
  const setDemoFlag = useApp((s) => s.setDemoFlag);
  const resetDemo = useApp((s) => s.resetDemo);

  return (
    <Page>
      <PageHeader title="Compte" />
      <section className="flex items-center gap-md rounded-lg bg-surface p-md shadow-card">
        <Avatar link={false} className="size-14 text-h3" />
        <div className="min-w-0">
          <p className="text-h3 text-ink">{user.name}</p>
          <p className="flex items-center gap-xs text-caption text-on-surface"><Star className="size-4 text-accent" fill="currentColor" aria-hidden /> Utilisateur {user.tier}</p>
          <p className="num text-caption text-muted">{user.phone}</p>
        </div>
      </section>
      <div className="mt-md grid grid-cols-2 gap-sm">
        <Link href="/wallet" className="rounded-lg bg-surface p-md shadow-card">
          <p className="text-caption text-muted">Gozem Money</p>
          <p className="num text-price text-ink">{formatFCFA(balance)}</p>
        </Link>
        <Link href="/gowin" className="rounded-lg bg-surface p-md shadow-card">
          <p className="text-caption text-muted">GoWin</p>
          <p className="num text-price text-ink">⭐ {points.toLocaleString("fr-FR")} pts</p>
        </Link>
      </div>

      <ul className="mt-lg divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex min-h-14 items-center gap-md px-md hover:bg-surface-sunken">
              <Icon className="size-5 text-muted" aria-hidden />
              <span className="flex-1 text-body-md">{label}</span>
              <ChevronRight className="size-5 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-lg mb-sm text-h3 text-ink">Mode démo</h2>
      <div className="divide-y divide-border rounded-lg bg-surface py-xs shadow-card">
        <Toggle label="Simuler hors connexion" checked={demo.offline} onChange={(v) => setDemoFlag("offline", v)} />
        <Toggle label="Simuler une erreur" checked={demo.simulateError} onChange={(v) => setDemoFlag("simulateError", v)} />
      </div>
      <button
        type="button"
        onClick={() => {
          resetDemo();
          toast.success("Démo réinitialisée ✓", { description: "Solde 125 500 FCFA · 2 450 pts" });
        }}
        className="mt-md flex h-12 w-full items-center justify-center gap-sm rounded-full border border-error text-label-md text-error hover:bg-surface-sunken"
      >
        <RotateCcw className="size-5" aria-hidden /> Réinitialiser la démo
      </button>
    </Page>
  );
}
