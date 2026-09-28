"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Briefcase, GraduationCap, House, MapPin, Trash2 } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/Field";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/States";
import { useApp } from "@/lib/store";

const ICONS = { home: House, work: Briefcase, school: GraduationCap, pin: MapPin };

export default function AddressesPage() {
  const addresses = useApp((s) => s.profile.addresses);
  const addAddress = useApp((s) => s.addAddress);
  const removeAddress = useApp((s) => s.removeAddress);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");

  const save = () => {
    if (!label.trim() || !detail.trim()) return;
    addAddress({ label: label.trim(), detail: detail.trim(), icon: "pin" });
    setOpen(false);
    setLabel("");
    setDetail("");
    toast.success("Adresse enregistrée ✓");
  };

  return (
    <Page>
      <PageHeader title="Adresses" back="/account" />
      {addresses.length === 0 ? (
        <EmptyState icon={<MapPin className="size-6" aria-hidden />} title="Aucune adresse enregistrée" body="Ajoutez vos lieux favoris pour commander plus vite." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
          {addresses.map((a) => {
            const Icon = ICONS[a.icon];
            return (
              <li key={a.id} className="flex min-h-16 items-center gap-md px-md py-sm">
                <span className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary-dark"><Icon className="size-5" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-label-md text-ink">{a.label}</span>
                  <span className="block text-caption text-muted">{a.detail}</span>
                </span>
                <button type="button" aria-label={`Supprimer ${a.label}`} onClick={() => removeAddress(a.id)} className="grid size-touch-target place-items-center rounded-full text-muted hover:bg-surface-sunken">
                  <Trash2 className="size-5" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Button full variant="secondary" className="mt-md" onClick={() => setOpen(true)}>+ Nouvelle adresse</Button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Nouvelle adresse" footer={<Button full onClick={save} disabled={!label.trim() || !detail.trim()}>Enregistrer</Button>}>
        <div className="space-y-md">
          <Field label="Nom de l'adresse" placeholder="ex. Salle de sport" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Field label="Adresse" placeholder="ex. Haie Vive, Cotonou" value={detail} onChange={(e) => setDetail(e.target.value)} />
        </div>
      </BottomSheet>
    </Page>
  );
}
