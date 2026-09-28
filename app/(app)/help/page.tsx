"use client";
import { useMemo, useState } from "react";
import { ChevronDown, CreditCard, Headset, PackageSearch, Search, ShieldAlert, Undo2 } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/States";
import { buttonClass } from "@/components/ui/button";
import { normalize } from "@/lib/mock/places";
import { cn } from "@/lib/utils";
import { SupportChat } from "./SupportChat";

const CATEGORIES = ["Trajet", "Commande", "Paiement", "Compte", "Sécurité"] as const;
type Category = (typeof CATEGORIES)[number];

const FAQ: { cat: Category; q: string; a: string }[] = [
  { cat: "Trajet", q: "Mon chauffeur n'arrive pas, que faire ?", a: "Appelez-le depuis l'écran de suivi. Après 5 minutes d'attente, vous pouvez annuler gratuitement." },
  { cat: "Trajet", q: "J'ai oublié un objet dans le véhicule", a: "Ouvrez le trajet dans Activité puis « Objet perdu » : nous contactons le chauffeur pour vous." },
  { cat: "Commande", q: "Ma commande est en retard", a: "Suivez le coursier en direct. Au-delà de 20 minutes de retard, les frais de livraison vous sont remboursés." },
  { cat: "Commande", q: "Un article manque dans ma commande", a: "Signalez-le depuis le détail de la commande : le montant est recrédité sur Gozem Money." },
  { cat: "Paiement", q: "Comment recharger Gozem Money ?", a: "Wallet → Recharger, puis choisissez MTN MoMo ou Moov Money. Le crédit est immédiat." },
  { cat: "Paiement", q: "J'ai été débité deux fois", a: "Le second débit est annulé automatiquement sous 24 h. Sinon, contactez le support." },
  { cat: "Compte", q: "Comment modifier mon numéro ?", a: "Compte → Informations personnelles. Un code de vérification vous sera envoyé par SMS." },
  { cat: "Sécurité", q: "Comment partager mon trajet ?", a: "Pendant la course, touchez 🛡 Sécurité puis « Partager mon trajet » avec vos contacts de confiance." },
  { cat: "Sécurité", q: "Signaler un incident", a: "Touchez 🛡 Sécurité pendant le trajet ou contactez le support : une équipe répond 24 h/24." },
];

const QUICK = [
  { label: "Signaler un problème", icon: ShieldAlert },
  { label: "Objet perdu", icon: PackageSearch },
  { label: "Remboursement", icon: Undo2 },
  { label: "Problème de paiement", icon: CreditCard },
];

export default function HelpPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [chat, setChat] = useState<string | null>(null);

  const results = useMemo(() => {
    const n = normalize(q);
    return FAQ.map((f, i) => ({ ...f, i })).filter((f) => (!cat || f.cat === cat) && (!n || normalize(`${f.q} ${f.a}`).includes(n)));
  }, [q, cat]);

  return (
    <Page>
      <PageHeader title="Aide" back={true} />
      <h2 className="text-h2 text-ink">Comment pouvons-nous vous aider ?</h2>
      <label className="mt-md flex h-13 items-center gap-sm rounded-md bg-surface-sunken px-md">
        <Search className="size-5 text-muted" aria-hidden />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher dans l'aide" aria-label="Rechercher dans l'aide" className="h-full flex-1 bg-transparent text-body-lg outline-none placeholder:text-muted" />
      </label>

      <div className="mt-md flex gap-sm overflow-x-auto pb-xs" role="group" aria-label="Catégories">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)} className={buttonClass(cat === c ? "chip-selected" : "chip", false, "shrink-0")}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-lg grid grid-cols-2 gap-sm">
        {QUICK.map(({ label, icon: Icon }) => (
          <button key={label} type="button" onClick={() => setChat(label)} className="flex min-h-touch-target items-center gap-sm rounded-lg bg-surface p-md text-left text-label-md text-ink shadow-card hover:bg-surface-sunken">
            <Icon className="size-5 shrink-0 text-primary-dark" aria-hidden /> {label}
          </button>
        ))}
      </div>

      <h2 className="mt-lg mb-sm text-h3 text-ink">Questions fréquentes</h2>
      {results.length === 0 ? (
        <EmptyState icon={<Search className="size-6" aria-hidden />} title="Aucun article trouvé" body="Notre équipe peut vous répondre directement." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
          {results.map((f) => (
            <li key={f.i}>
              <button type="button" aria-expanded={open === f.i} onClick={() => setOpen(open === f.i ? null : f.i)} className="flex min-h-14 w-full items-center gap-md px-md py-sm text-left hover:bg-surface-sunken">
                <span className="min-w-0 flex-1">
                  <span className="block text-caption text-muted">{f.cat}</span>
                  <span className="block text-label-md text-ink">{f.q}</span>
                </span>
                <ChevronDown className={cn("size-5 text-muted transition-transform", open === f.i && "rotate-180")} aria-hidden />
              </button>
              {open === f.i && <p className="px-md pb-md text-body-md text-muted">{f.a}</p>}
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={() => setChat("")} className={buttonClass("primary", true, "mt-lg")}>
        <Headset className="size-5" aria-hidden /> Contacter le support
      </button>

      {chat !== null && <SupportChat topic={chat} onClose={() => setChat(null)} />}
    </Page>
  );
}
