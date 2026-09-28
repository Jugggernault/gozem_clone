"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Headset, MapPin, MessageCircle, PhoneOff, Search, Send, Share2, Siren, Users } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { Price } from "@/components/Price";
import { Button, buttonClass } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { formatFCFA } from "@/lib/format";
import { quoteRide } from "@/lib/pricing";
import { getPromo } from "@/lib/mock/promos";
import { PLACES, getPlace, searchPlaces } from "@/lib/mock/places";
import { DRIVER_REPLIES } from "@/lib/mock/vehicles";
import type { Driver, Place } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SHARE_URL } from "./trip";

type SheetProps = { open: boolean; onClose: () => void };

/* ---------------- Chat ---------------- */
const QUICK = ["Où êtes-vous ?", "Je suis devant", "J'arrive dans 2 min"];
type Msg = { from: "me" | "driver"; text: string };

export function ChatSheet({ open, onClose, driver }: SheetProps & { driver: Driver }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={driver.name}>
      <Chat driver={driver} />
    </BottomSheet>
  );
}

function Chat({ driver }: { driver: Driver }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "driver", text: `Bonjour, c'est ${driver.firstName}. Je suis en route 🏍️` }]);
  const [draft, setDraft] = useState("");
  const [replies, setReplies] = useState(0);
  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setDraft("");
    const reply = DRIVER_REPLIES[replies % DRIVER_REPLIES.length];
    setReplies((n) => n + 1);
    setTimeout(() => setMsgs((m) => [...m, { from: "driver", text: reply }]), 1000);
  };
  return (
    <div className="flex flex-col gap-md">
      <ul className="flex max-h-72 flex-col gap-sm overflow-y-auto" aria-live="polite">
        {msgs.map((m, i) => (
          <li key={i} className={cn("max-w-[80%] rounded-lg px-md py-sm text-body-md", m.from === "me" ? "self-end bg-ink text-on-ink" : "self-start bg-surface-sunken text-on-surface")}>
            {m.text}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-sm">
        {QUICK.map((q) => (
          <button key={q} type="button" className={buttonClass("chip")} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>
      <form
        className="flex items-center gap-sm"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Écrire un message…" aria-label="Message au chauffeur" className="h-13 flex-1 rounded-md bg-surface-sunken px-md text-body-lg outline-none placeholder:text-muted" />
        <button type="submit" aria-label="Envoyer" className="grid size-13 place-items-center rounded-full bg-primary-dark text-on-primary">
          <Send className="size-5" aria-hidden />
        </button>
      </form>
    </div>
  );
}

/* ---------------- Call ---------------- */
export function CallSheet({ open, onClose, driver }: SheetProps & { driver: Driver }) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <Call driver={driver} onHangUp={onClose} />
    </BottomSheet>
  );
}

function Call({ driver, onHangUp }: { driver: Driver; onHangUp: () => void }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mmss = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  return (
    <div className="flex flex-col items-center gap-md py-md text-center">
      <span className="relative grid size-20 place-items-center">
        <span className="absolute inset-0 rounded-full bg-primary animate-halo" aria-hidden />
        <span className="relative grid size-20 place-items-center rounded-full bg-primary-soft text-h2 text-primary-dark">{driver.avatar}</span>
      </span>
      <div>
        <p className="text-h2 text-ink">{driver.name}</p>
        <p className="text-caption text-muted">Appel en cours · {driver.phone}</p>
      </div>
      <p className="num text-price-hero text-ink" data-testid="call-timer">
        {mmss}
      </p>
      <Button variant="danger" full onClick={onHangUp}>
        <PhoneOff className="size-5" aria-hidden /> Raccrocher
      </Button>
    </div>
  );
}

/* ---------------- Safety ---------------- */
const CHECKS = [
  ["✓ GPS", "Position suivie en temps réel"],
  ["✓ Chauffeur identifié", "Identité vérifiée par Gozem"],
  ["✓ Véhicule identifié", "Plaque et modèle contrôlés"],
] as const;

export function SafetySheet({ open, onClose, onShare, onSos, onContacts }: SheetProps & { onShare: () => void; onSos: () => void; onContacts: () => void }) {
  const actions = [
    { label: "Partager mon trajet", icon: Share2, onClick: onShare },
    { label: "Contacter un proche", icon: Users, onClick: onContacts },
    { label: "Assistance", icon: Headset, onClick: () => toast.success("Assistance Gozem prévenue ✓", { description: "Un agent vous rappelle dans 2 min." }) },
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title="Votre sécurité">
      <ul className="flex flex-col gap-sm rounded-lg bg-primary-soft p-md">
        {CHECKS.map(([t, d]) => (
          <li key={t} className="flex flex-col">
            <span className="text-label-md text-success">{t}</span>
            <span className="text-caption text-muted">{d}</span>
          </li>
        ))}
      </ul>
      <div className="mt-md flex flex-col gap-sm">
        {actions.map(({ label, icon: Icon, onClick }) => (
          <button key={label} type="button" onClick={onClick} className="flex min-h-touch-target items-center gap-md rounded-lg bg-surface-sunken px-md py-sm text-left text-label-md text-on-surface hover:bg-border">
            <Icon className="size-5 text-primary-dark" aria-hidden />
            {label}
          </button>
        ))}
        <Button variant="danger" full onClick={onSos}>
          <Siren className="size-5" aria-hidden /> Urgence
        </Button>
      </div>
    </BottomSheet>
  );
}

export function ShareSheet({ open, onClose, message }: SheetProps & { message: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {}
    toast.success("Trajet partagé ✓");
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="Partager mon trajet">
      <p className="text-body-md text-muted">Vos proches suivent votre trajet en direct, sans application.</p>
      <p className="num mt-md rounded-md bg-surface-sunken px-md py-sm text-label-md text-ink">{SHARE_URL.replace("https://", "")}</p>
      <div className="mt-md flex flex-col gap-sm">
        <Button full onClick={copy}>
          Copier le lien
        </Button>
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className={buttonClass("secondary", true)}>
          <MessageCircle className="size-5" aria-hidden /> WhatsApp
        </a>
      </div>
    </BottomSheet>
  );
}

export function ContactsSheet({ open, onClose }: SheetProps) {
  const contacts = useApp((s) => s.profile.trustedContacts);
  return (
    <BottomSheet open={open} onClose={onClose} title="Contacter un proche">
      <ul className="flex flex-col gap-sm">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center gap-md rounded-lg bg-surface-sunken p-md">
            <div className="min-w-0 flex-1">
              <p className="text-label-md text-ink">{c.name}</p>
              <p className="num text-caption text-muted">{c.phone}</p>
            </div>
            <Button
              variant="chip-selected"
              onClick={() => {
                toast.success(`Position envoyée à ${c.name} ✓`);
                onClose();
              }}
            >
              Envoyer ma position
            </Button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}

export function SosSheet({ open, onClose }: SheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <Sos onClose={onClose} />
    </BottomSheet>
  );
}

function Sos({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [left, setLeft] = useState(10);
  useEffect(() => {
    if (!sent) return;
    const id = setInterval(() => setLeft((n) => Math.max(n - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [sent]);
  if (!sent)
    return (
      <div className="flex flex-col gap-md">
        <Siren className="size-10 text-error" aria-hidden />
        <p className="text-h2 text-ink">Déclencher une alerte d&apos;urgence ?</p>
        <p className="text-body-md text-muted">Vos proches et l&apos;assistance Gozem recevront votre position et les infos du chauffeur.</p>
        <Button variant="danger" full onClick={() => setSent(true)}>
          Confirmer l&apos;alerte
        </Button>
        <Button variant="secondary" full onClick={onClose}>
          Retour
        </Button>
      </div>
    );
  return (
    <div className="flex flex-col items-center gap-md text-center" role="alert">
      <span className="grid size-20 place-items-center rounded-full bg-error text-on-error">
        <span className="num text-price-hero" data-testid="sos-countdown">
          {left}
        </span>
      </span>
      <p className="text-h2 text-ink">Alerte envoyée</p>
      <p className="text-body-md text-muted">{left > 0 ? `Les secours seront appelés dans ${left} s.` : "Secours contactés. Restez en ligne."}</p>
      <Button
        variant="secondary"
        full
        onClick={() => {
          toast("Alerte annulée");
          onClose();
        }}
      >
        Annuler
      </Button>
    </div>
  );
}

/* ---------------- Places (stops / destination) ---------------- */
function PlacePicker({ exclude, onPick }: { exclude: string[]; onPick: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const list = (q ? searchPlaces(q) : PLACES).filter((p) => !exclude.includes(p.id));
  return (
    <div className="flex flex-col gap-sm">
      <label className="flex h-13 items-center gap-sm rounded-md bg-surface-sunken px-md">
        <Search className="size-5 text-muted" aria-hidden />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un lieu" aria-label="Rechercher un lieu" className="h-full flex-1 bg-transparent text-body-lg outline-none placeholder:text-muted" />
      </label>
      <ul className="flex flex-col">
        {list.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onPick(p)} className="flex min-h-touch-target w-full items-center gap-md rounded-md px-sm py-sm text-left hover:bg-surface-sunken">
              <MapPin className="size-5 shrink-0 text-muted" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-label-md text-ink">{p.name}</span>
                <span className="block text-caption text-muted">{p.subtitle}</span>
              </span>
            </button>
          </li>
        ))}
        {!list.length && <li className="p-md text-caption text-muted">Aucun lieu trouvé</li>}
      </ul>
    </div>
  );
}

export function StopSheet({ open, onClose }: SheetProps) {
  const ride = useApp((s) => s.ride);
  return (
    <BottomSheet open={open} onClose={onClose} title="Ajouter un arrêt">
      <PlacePicker
        exclude={[ride.destinationId ?? "", ...ride.stops]}
        onPick={(p) => {
          const r = useApp.getState().addStop(p.id);
          if (!r.ok) toast.error(r.error);
          else toast.success(`Arrêt ajouté : ${p.shortName}`);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

export function DestinationSheet({ open, onClose }: SheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Modifier destination">
      <ChangeDestination onClose={onClose} />
    </BottomSheet>
  );
}

function ChangeDestination({ onClose }: { onClose: () => void }) {
  const ride = useApp((s) => s.ride);
  const [pick, setPick] = useState<Place | null>(null);
  const quote = useMemo(() => {
    if (!pick || !ride.destinationId) return null;
    const base = { vehicleId: ride.vehicleId, stops: ride.stops, discountPct: getPromo(ride.activePromoId)?.discountPct };
    return { now: quoteRide({ ...base, destinationId: ride.destinationId }), next: quoteRide({ ...base, destinationId: pick.id }) };
  }, [pick, ride]);
  if (!pick || !quote) return <PlacePicker exclude={[ride.destinationId ?? "", ...ride.stops]} onPick={setPick} />;
  const diff = quote.next.price - quote.now.price;
  return (
    <div className="flex flex-col gap-md">
      <p className="text-body-md text-muted">
        {getPlace(ride.destinationId!)?.shortName} → <span className="text-label-md text-ink">{pick.shortName}</span>
      </p>
      <div className="flex items-end justify-between rounded-lg bg-surface-sunken p-md">
        <div>
          <p className="text-caption text-muted">Nouveau prix</p>
          <Price amount={quote.next.price} hero className="text-ink" />
        </div>
        <span className={cn("num rounded-full px-sm py-xs text-caption", diff > 0 ? "bg-accent-soft text-on-accent" : "bg-primary-soft text-success")}>
          {diff >= 0 ? "+" : "−"}
          {formatFCFA(Math.abs(diff))}
        </span>
      </div>
      <p className="text-caption text-muted">
        {quote.next.distanceKm.toString().replace(".", ",")} km · {quote.next.durationMin} min au total
      </p>
      <Button
        full
        onClick={() => {
          useApp.getState().setRide({ destinationId: pick.id });
          toast.success(`Destination modifiée : ${pick.shortName}`);
          onClose();
        }}
      >
        Confirmer
      </Button>
      <Button variant="ghost" full onClick={() => setPick(null)}>
        Choisir un autre lieu
      </Button>
    </div>
  );
}
