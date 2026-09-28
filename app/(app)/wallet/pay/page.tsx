"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ScanLine, Store } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { PinPad } from "@/components/PinPad";
import { Price } from "@/components/Price";
import { SuccessCheck } from "@/components/SuccessCheck";
import { Button, ButtonLink } from "@/components/ui/button";
import { purchase, useApp } from "@/lib/store";
import { formatFCFA } from "@/lib/format";
import { QR_MERCHANT } from "@/lib/mock/products";
import { sleep } from "@/lib/services/mock";

type Step = "idle" | "scanning" | "found" | "success";

export default function QrPayPage() {
  const balance = useApp((s) => s.wallet.balance);
  const [step, setStep] = useState<Step>("idle");
  const [pinOpen, setPinOpen] = useState(false);
  const { name, amount } = QR_MERCHANT;

  useEffect(() => {
    if (step !== "scanning") return;
    const t = setTimeout(() => setStep("found"), 2000);
    return () => clearTimeout(t);
  }, [step]);

  const onPin = async () => {
    await sleep(600);
    const r = purchase(useApp, {
      amount,
      label: `Paiement ${name}`,
      category: "payment",
      activity: { type: "payment", title: `Paiement ${name}`, subtitle: "Paiement QR", amount, meta: { Marchand: name, Moyen: "Gozem Money" } },
      notification: { kind: "wallet", title: "Paiement réussi ✓", body: `${formatFCFA(amount)} payés à ${name}`, href: "/wallet" },
    });
    if (!r.ok) return `${r.error} : il vous manque ${formatFCFA(r.missing)}`;
    setPinOpen(false);
    setStep("success");
    toast.success("Paiement réussi ✓");
  };

  return (
    <Page>
      <PageHeader title="Payer" subtitle={`Solde : ${formatFCFA(balance)}`} back="/wallet" />

      {(step === "idle" || step === "scanning") && (
        <div className="flex flex-col items-center gap-lg">
          <div data-testid="qr-viewfinder" className="relative aspect-square w-full max-w-80 overflow-hidden rounded-xl bg-ink">
            {/* Corner brackets */}
            {["left-md top-md border-l-4 border-t-4", "right-md top-md border-r-4 border-t-4", "left-md bottom-md border-b-4 border-l-4", "right-md bottom-md border-b-4 border-r-4"].map((c) => (
              <span key={c} className={`absolute size-12 rounded-sm border-primary ${c}`} aria-hidden />
            ))}
            {step === "scanning" ? (
              <motion.span
                className="absolute inset-x-lg h-1 rounded-full bg-primary shadow-float"
                initial={{ top: "12%" }}
                animate={{ top: ["12%", "86%", "12%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              />
            ) : (
              <ScanLine className="absolute inset-0 m-auto size-16 text-on-ink/60" aria-hidden />
            )}
            <p className="absolute inset-x-0 bottom-lg text-center text-caption text-on-ink">
              {step === "scanning" ? "Recherche du QR code…" : "Placez le QR code du marchand dans le cadre"}
            </p>
          </div>
          <Button full onClick={() => setStep("scanning")} disabled={step === "scanning"}>
            <ScanLine className="size-5" aria-hidden /> Scanner un QR
          </Button>
        </div>
      )}

      {step === "found" && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-md rounded-lg bg-surface p-md shadow-card" data-testid="qr-merchant">
          <div className="flex items-center gap-md">
            <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary-dark"><Store className="size-6" aria-hidden /></span>
            <div className="flex-1">
              <p className="text-h3 text-ink">{name}</p>
              <p className="text-caption text-muted">Marchand vérifié · Cotonou</p>
            </div>
            <Price amount={amount} />
          </div>
          <Button full onClick={() => setPinOpen(true)}>Payer {formatFCFA(amount)}</Button>
          <Button full variant="ghost" onClick={() => setStep("idle")}>Annuler</Button>
        </motion.section>
      )}

      {step === "success" && (
        <div className="mt-xl flex flex-col items-center gap-md text-center">
          <SuccessCheck label="Paiement réussi" />
          <p className="text-body-lg text-muted">{formatFCFA(amount)} payés à {name}</p>
          <p className="text-caption text-muted">Nouveau solde : <span className="num">{formatFCFA(balance)}</span></p>
          <ButtonLink href="/wallet" full className="mt-md">Retour au wallet</ButtonLink>
        </div>
      )}

      <PinPad open={pinOpen} onClose={() => setPinOpen(false)} onComplete={onPin} subtitle={`${name} · ${formatFCFA(amount)}`} />
    </Page>
  );
}
