"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarClock, Package, SendHorizontal, Star } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { buttonClass } from "@/components/ui/button";
import { ASSISTANT_CHIPS, type AssistantCard, type AssistantReply, reply } from "@/lib/assistant";
import { formatFCFA } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type Msg = { id: number; from: "me" | "bot"; text: string; reply?: AssistantReply };

function Chips({ chips, onPick }: { chips: string[]; onPick: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-sm" data-testid="assistant-chips">
      {chips.map((c) => (
        <button key={c} type="button" onClick={() => onPick(c)} className="min-h-9 rounded-full border border-border bg-surface px-3 py-xs text-left text-caption text-on-surface hover:bg-surface-sunken">
          {c}
        </button>
      ))}
    </div>
  );
}

function Card({ card }: { card: AssistantCard }) {
  const router = useRouter();
  const startRide = useApp((s) => s.startRide);
  const setRide = useApp((s) => s.setRide);
  const box = "w-full rounded-lg bg-surface p-md shadow-card";

  if (card.kind === "ride")
    return (
      <div className={box} data-testid="assistant-card-ride">
        <div className="flex items-center gap-sm text-caption text-muted"><CalendarClock className="size-4" aria-hidden /> Trajet programmé</div>
        <p className="mt-xs text-label-md text-ink">{card.fromLabel} → {card.toLabel}</p>
        <div className="mt-xs flex items-center justify-between">
          <span className="num text-body-md text-on-surface">{card.whenLabel}</span>
          <span className="flex items-baseline gap-sm"><span className="text-caption text-muted">🏍️ {card.vehicle}</span> <Price amount={card.price} /></span>
        </div>
        <button
          type="button"
          className={buttonClass("primary", true, "mt-md")}
          onClick={() => {
            startRide(card.toId);
            setRide({ vehicleId: "zem", schedule: { mode: card.mode, time: card.time } });
            router.push(card.href);
          }}
        >
          Programmer ce trajet
        </button>
      </div>
    );

  if (card.kind === "parcel")
    return (
      <div className={box} data-testid="assistant-card-parcel">
        <div className="flex items-center gap-sm text-caption text-muted"><Package className="size-4" aria-hidden /> Envoi de colis</div>
        <p className="mt-xs text-label-md text-ink">Ma position → {card.toLabel}</p>
        <Link href={card.href} className={buttonClass("primary", true, "mt-md")}>Préparer l&apos;envoi</Link>
      </div>
    );

  if (card.kind === "restaurants")
    return (
      <ul className="w-full space-y-sm" data-testid="assistant-card-restaurants">
        {card.items.map((r) => (
          <li key={r.slug}>
            <Link href={`/food/${r.slug}`} data-testid="assistant-restaurant" className="flex items-center gap-md rounded-lg bg-surface p-md shadow-card hover:bg-surface-sunken">
              <span className="grid size-12 place-items-center rounded-md bg-surface-sunken text-h2" aria-hidden>{r.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-label-md text-ink">{r.name}</span>
                <span className="flex items-center gap-xs text-caption text-muted">
                  <Star className="size-3 text-accent" fill="currentColor" aria-hidden /> {r.rating.toLocaleString("fr-FR")} · {r.timeMin} · {r.distanceKm.toLocaleString("fr-FR")} km
                </span>
              </span>
              <ArrowRight className="size-5 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    );

  return (
    <div className={box} data-testid="assistant-card-spending">
      <p className="text-caption text-muted">Total dépensé cette semaine</p>
      <p data-testid="spending-total"><Price amount={card.total} hero /></p>
      {card.lines.length > 0 && (
        <ul className="mt-md divide-y divide-border">
          {card.lines.map((l) => (
            <li key={l.label} className="flex items-center justify-between py-sm text-body-md">
              <span>{l.label}</span>
              <span className="num text-on-surface">{formatFCFA(l.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Streams the reply word by word, then reveals its card and chips. */
function BotMessage({ msg, onPick, onTick }: { msg: Msg; onPick: (c: string) => void; onTick: () => void }) {
  const words = msg.text.split(" ");
  const [shown, setShown] = useState(msg.id === 0 ? words.length : 0);
  useEffect(() => {
    if (shown >= words.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 35);
    return () => clearTimeout(t);
  }, [shown, words.length]);
  useEffect(() => {
    onTick();
  }, [shown, onTick]);
  const done = shown >= words.length;
  return (
    <div className="flex max-w-[92%] flex-col items-start gap-sm self-start" data-testid="assistant-reply" data-done={done}>
      <p className="rounded-lg bg-surface px-md py-sm text-body-md text-on-surface shadow-card">{words.slice(0, shown).join(" ")}</p>
      {done && msg.reply?.card && <Card card={msg.reply.card} />}
      {done && msg.reply?.chips && <Chips chips={msg.reply.chips} onPick={onPick} />}
    </div>
  );
}

const WELCOME: Msg = {
  id: 0,
  from: "bot",
  text: "Bonjour Abed ✨ Je suis votre Gozem Assistant. Dites-moi où vous voulez aller, ce que vous voulez envoyer ou manger.",
  reply: { text: "", chips: ASSISTANT_CHIPS },
};

export default function AssistantPage() {
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const end = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const scroll = useCallback(() => {
    end.current?.scrollIntoView({ block: "end" }); // may return a Promise in new Chromium: keep void
  }, []);
  useEffect(() => {
    scroll();
  }, [msgs, typing, scroll]);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setDraft("");
    setMsgs((m) => [...m, { id: nextId.current++, from: "me", text: t }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      // Computed at answer time from the live store (e.g. spending changes after a new payment).
      const r = reply(t, { transactions: useApp.getState().wallet.transactions });
      setTyping(false);
      setMsgs((m) => [...m, { id: nextId.current++, from: "bot", text: r.text, reply: r }]);
    }, 700);
  };

  return (
    <Page className="flex flex-1 flex-col">
      <PageHeader title="✨ Gozem Assistant" subtitle="Réservez, envoyez, commandez en une phrase" back={true} />
      <div className="flex flex-1 flex-col gap-md pb-md">
        {msgs.map((m) =>
          m.from === "me" ? (
            <p key={m.id} className="max-w-[85%] self-end rounded-lg bg-primary-dark px-md py-sm text-body-md text-on-primary">{m.text}</p>
          ) : (
            <BotMessage key={m.id} msg={m} onPick={ask} onTick={scroll} />
          ),
        )}
        {typing && (
          <div data-testid="assistant-typing" aria-label="L'assistant écrit" className="flex gap-xs self-start rounded-lg bg-surface px-md py-md shadow-card">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        className={cn("sticky bottom-0 -mx-gutter flex items-center gap-sm border-t border-border bg-neutral px-gutter py-sm pb-[max(0.5rem,env(safe-area-inset-bottom))]")}
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Écrivez votre demande…" aria-label="Message à l'assistant" className="h-12 flex-1 rounded-full bg-surface-sunken px-md text-body-md outline-none focus:ring-2 focus:ring-primary-dark" />
        <button type="submit" aria-label="Envoyer" className="grid size-12 place-items-center rounded-full bg-primary-dark text-on-primary hover:bg-ink">
          <SendHorizontal className="size-5" aria-hidden />
        </button>
      </form>
    </Page>
  );
}
