"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { PinPad } from "@/components/PinPad";
import { Price } from "@/components/Price";
import { SuccessCheck } from "@/components/SuccessCheck";
import { Button, ButtonLink } from "@/components/ui/button";
import { purchase, useApp } from "@/lib/store";
import { formatFCFA } from "@/lib/format";
import { findContact, isBeninPhone } from "@/lib/mock/user";
import { mockCall } from "@/lib/services/mock";

type Step = "phone" | "amount" | "confirm" | "success";
const input = "h-13 w-full rounded-md bg-surface-sunken px-3.5 text-body-lg text-on-surface outline-none focus:ring-2 focus:ring-primary-dark";

export default function SendMoneyPage() {
  const balance = useApp((s) => s.wallet.balance);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+229 ");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const contact = findContact(phone);
  const value = Number(amount.replace(/\D/g, "")) || 0;

  const submitPhone = () => {
    if (!isBeninPhone(phone)) return setPhoneError("Numéro invalide. Format attendu : +229 XX XX XX XX");
    setPhoneError(null);
    setStep("amount");
  };

  const onPin = async () => {
    try {
      await mockCall(() => null, [500, 900]);
    } catch {
      return "Erreur réseau. Réessayez.";
    }
    const r = purchase(useApp, {
      amount: value,
      label: `Transfert à ${contact.name}`,
      category: "transfer",
      activity: { type: "payment", title: `Transfert à ${contact.name}`, subtitle: message || contact.phone, amount: value, meta: { Destinataire: contact.name, Numéro: contact.phone, ...(message ? { Message: message } : {}) } },
      notification: { kind: "wallet", title: "Transfert envoyé ✓", body: `${formatFCFA(value)} envoyés à ${contact.name}`, href: "/wallet" },
    });
    if (!r.ok) return `${r.error} : il vous manque ${formatFCFA(r.missing)}`;
    setPinOpen(false);
    setStep("success");
    toast.success("Transfert envoyé ✓");
  };

  const back = () => setStep(step === "confirm" ? "amount" : "phone");

  return (
    <Page>
      <PageHeader title="Envoyer de l'argent" subtitle={`Solde : ${formatFCFA(balance)}`} back={step === "phone" || step === "success" ? "/wallet" : undefined}
        right={step === "amount" || step === "confirm" ? <Button variant="ghost" onClick={back}>Retour</Button> : undefined} />

      {step === "phone" && (
        <form className="flex flex-col gap-md" onSubmit={(e) => { e.preventDefault(); submitPhone(); }}>
          <label className="flex flex-col gap-sm">
            <span className="text-label-md text-ink">Numéro du destinataire</span>
            <input className={input} type="tel" inputMode="tel" value={phone} autoFocus onChange={(e) => { setPhone(e.target.value); setPhoneError(null); }} aria-invalid={!!phoneError} />
          </label>
          {phoneError && <p role="alert" className="text-caption text-error">{phoneError}</p>}
          <Button type="submit" full>Continuer</Button>
        </form>
      )}

      {step === "amount" && (
        <form className="flex flex-col gap-md" onSubmit={(e) => { e.preventDefault(); if (value > 0) setStep("confirm"); }}>
          <p className="rounded-lg bg-surface p-md text-body-md shadow-card">
            À <span className="text-label-md text-ink">{contact.name}</span> <span className="num text-muted">{contact.phone}</span>
          </p>
          <label className="flex flex-col gap-sm">
            <span className="text-label-md text-ink">Montant (FCFA)</span>
            <input className={`${input} num`} inputMode="numeric" value={amount} autoFocus placeholder="10 000" onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="flex flex-col gap-sm">
            <span className="text-label-md text-ink">Message (facultatif)</span>
            <input className={input} value={message} placeholder="Merci pour hier 🙏" onChange={(e) => setMessage(e.target.value)} />
          </label>
          <Button type="submit" full disabled={value <= 0}>Continuer</Button>
        </form>
      )}

      {step === "confirm" && (
        <div className="flex flex-col gap-md">
          <section className="rounded-lg bg-surface p-md shadow-card">
            <p className="text-h3 text-ink">Envoyer {formatFCFA(value)} à {contact.name}</p>
            <dl className="mt-md flex flex-col gap-sm text-body-md">
              <div className="flex justify-between"><dt className="text-muted">Numéro</dt><dd className="num">{contact.phone}</dd></div>
              {message && <div className="flex justify-between gap-md"><dt className="text-muted">Message</dt><dd className="text-right">{message}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Frais</dt><dd className="num">0 FCFA</dd></div>
              <div className="flex items-center justify-between border-t border-border pt-sm"><dt className="text-label-md">Total</dt><dd><Price amount={value} /></dd></div>
            </dl>
          </section>
          <Button full onClick={() => setPinOpen(true)}>Confirmer</Button>
        </div>
      )}

      {step === "success" && (
        <div className="mt-xl flex flex-col items-center gap-md text-center">
          <SuccessCheck label="Transfert réussi" />
          <p className="text-body-lg text-muted">{formatFCFA(value)} envoyés à {contact.name}</p>
          <p className="text-caption text-muted">Nouveau solde : <span className="num">{formatFCFA(balance)}</span></p>
          <ButtonLink href="/wallet" full className="mt-md">Retour au wallet</ButtonLink>
        </div>
      )}

      <PinPad open={pinOpen} onClose={() => setPinOpen(false)} onComplete={onPin} subtitle={`Envoyer ${formatFCFA(value)} à ${contact.name}`} />
    </Page>
  );
}
