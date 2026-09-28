"use client";
import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { normalize } from "@/lib/mock/places";
import { cn } from "@/lib/utils";

type Msg = { from: "me" | "agent"; text: string };

function agentReply(text: string) {
  const n = normalize(text);
  if (/rembours|debit|paiement|argent/.test(n)) return "Je vérifie votre paiement… C'est noté : si un débit est en trop, il sera recrédité sur Gozem Money sous 24 h.";
  if (/objet|oubli|perdu/.test(n)) return "Pas d'inquiétude, je contacte le chauffeur de votre dernier trajet et je reviens vers vous dans quelques minutes.";
  if (/retard|commande|livr/.test(n)) return "Je vois votre commande. Le coursier est en route ; si le retard dépasse 20 min, la livraison vous sera remboursée.";
  return "Merci pour votre message ! Un conseiller a bien pris en charge votre demande. Pouvez-vous me donner un peu plus de détails ?";
}

/** Mock support chat; mount it when opening (fresh conversation each time). */
export function SupportChat({ onClose, topic }: { onClose: () => void; topic: string }) {
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ from: "agent", text: `Bonjour, je suis Awa du support Gozem 👋${topic ? ` Vous nous contactez pour : ${topic}.` : ""} Comment puis-je vous aider ?` }]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" }); // may return a Promise in new Chromium: keep the effect body void
  }, [msgs, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMsgs((m) => [...m, { from: "me", text }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "agent", text: agentReply(text) }]);
    }, 1200);
  };

  return (
    <BottomSheet
      open
      onClose={onClose}
      title="Support Gozem"
      footer={
        <form
          className="flex items-center gap-sm"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Écrivez votre message…" aria-label="Message au support" className="h-12 flex-1 rounded-full bg-surface-sunken px-md text-body-md outline-none focus:ring-2 focus:ring-primary-dark" />
          <button type="submit" aria-label="Envoyer" className="grid size-12 place-items-center rounded-full bg-primary-dark text-on-primary hover:bg-ink">
            <SendHorizontal className="size-5" aria-hidden />
          </button>
        </form>
      }
    >
      <p className="mb-sm text-caption text-muted">Awa · Conseillère · répond en moins de 2 min</p>
      <div className="flex min-h-60 flex-col gap-sm" data-testid="support-chat" aria-live="polite">
        {msgs.map((m, i) => (
          <p key={i} data-from={m.from} className={cn("max-w-[85%] rounded-lg px-md py-sm text-body-md", m.from === "me" ? "self-end bg-primary-dark text-on-primary" : "self-start bg-surface-sunken text-on-surface")}>
            {m.text}
          </p>
        ))}
        {typing && <p className="self-start rounded-lg bg-surface-sunken px-md py-sm text-caption text-muted">Awa écrit…</p>}
        <div ref={end} />
      </div>
    </BottomSheet>
  );
}
