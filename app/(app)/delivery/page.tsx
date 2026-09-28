"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Price } from "@/components/Price";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { purchase } from "@/lib/store/actions";
import { PARCEL_ID, PARCEL_PRICE, PARCEL_VEHICLES } from "@/lib/mock/delivery";
import { COURIER } from "@/lib/mock/vehicles";
import { USER_POSITION_LABEL, getPlace } from "@/lib/mock/places";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";

const input = "h-13 w-full rounded-md bg-surface-sunken px-3.5 text-body-lg text-on-surface placeholder:text-muted";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-xs">
      <span className="text-caption text-muted">{label}</span>
      {children}
    </label>
  );
}

function DeliveryForm() {
  const router = useRouter();
  const params = useSearchParams();
  const to = params.get("to") ?? "";
  const [form, setForm] = useState({
    pickup: USER_POSITION_LABEL,
    recipientName: "",
    recipientPhone: "",
    address: getPlace(to)?.name ?? to,
    vehicle: "moto" as "moto" | "voiture",
    description: "",
  });
  const [quoted, setQuoted] = useState(false);
  const deliveries = useApp((s) => s.errands.deliveries);
  const addDelivery = useApp((s) => s.addDelivery);
  const updateDelivery = useApp((s) => s.updateDelivery);
  const removeActivity = useApp((s) => s.removeActivity);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setQuoted(false);
  };

  const order = () => {
    // Demo: one parcel id (#GZ-2841); re-ordering replaces the previous run.
    removeActivity(`act-${PARCEL_ID}`);
    const res = purchase(useApp, {
      amount: PARCEL_PRICE,
      label: `Livraison colis #${PARCEL_ID}`,
      category: "delivery",
      activity: { id: `act-${PARCEL_ID}`, type: "delivery", status: "in_progress", title: `Colis #${PARCEL_ID}`, subtitle: `Vers ${form.address} · ${form.recipientName}`, amount: PARCEL_PRICE, meta: { parcelId: PARCEL_ID, courier: COURIER.firstName } },
    });
    if (!res.ok) return toast.error(res.error);
    const data = { ...form, price: PARCEL_PRICE };
    if (deliveries.some((d) => d.id === PARCEL_ID)) updateDelivery(PARCEL_ID, { ...data, step: 1, createdAt: new Date().toISOString() });
    else {
      addDelivery({ id: PARCEL_ID, ...data });
      updateDelivery(PARCEL_ID, { step: 1 });
    }
    toast.success(`Coursier ${COURIER.firstName} assigné`);
    router.push("/delivery/tracking");
  };

  return (
    <Page>
      <PageHeader title="Envoyer un colis" subtitle="Un coursier récupère et livre votre colis" back="/" />
      <form
        className="flex flex-col gap-md rounded-lg bg-surface p-md shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          setQuoted(true);
        }}
      >
        <Field label="Retrait">
          <input className={input} value={form.pickup} onChange={(e) => set("pickup", e.target.value)} required />
        </Field>
        <Field label="Nom du destinataire">
          <input className={input} value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} placeholder="Ex. Aïcha Dossou" autoComplete="off" required />
        </Field>
        <Field label="Téléphone du destinataire">
          <input className={cn(input, "num")} type="tel" inputMode="tel" value={form.recipientPhone} onChange={(e) => set("recipientPhone", e.target.value)} placeholder="+229 97 00 00 00" required />
        </Field>
        <Field label="Adresse de livraison">
          <input className={input} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Quartier, rue, repère" required />
        </Field>
        <fieldset>
          <legend className="mb-xs text-caption text-muted">Véhicule</legend>
          <div className="grid grid-cols-2 gap-sm" role="radiogroup" aria-label="Véhicule">
            {PARCEL_VEHICLES.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={form.vehicle === v.id}
                onClick={() => set("vehicle", v.id)}
                className={cn("rounded-lg bg-surface-sunken p-md text-left", form.vehicle === v.id && "bg-primary-soft ring-2 ring-primary-dark")}
              >
                <span className="block text-label-md text-ink">{v.id === "moto" ? "🛵" : "🚗"} {v.label}</span>
                <span className="block text-caption text-muted">{v.description}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Description du colis">
          <textarea className={cn(input, "h-auto min-h-20 py-3.5")} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ex. Documents, petit carton…" />
        </Field>
        {!quoted && (
          <Button type="submit" full>
            Voir le prix
          </Button>
        )}
      </form>

      {quoted && (
        <section className="mt-md rounded-lg bg-surface p-md shadow-card" aria-live="polite">
          <div className="flex items-center justify-between gap-md">
            <div>
              <p className="text-caption text-muted">Prix de la livraison</p>
              <p className="text-body-md text-on-surface">{form.vehicle === "moto" ? "Moto" : "Voiture"} · payé avec Gozem Money</p>
            </div>
            <span data-testid="parcel-price"><Price amount={PARCEL_PRICE} hero /></span>
          </div>
          <Button full className="mt-md" onClick={order}>
            Commander un coursier
          </Button>
          <p className="mt-sm text-center text-caption text-muted">{formatFCFA(PARCEL_PRICE)} seront débités de votre wallet</p>
        </section>
      )}
    </Page>
  );
}

export default function DeliveryPage() {
  return (
    <Suspense>
      <DeliveryForm />
    </Suspense>
  );
}
