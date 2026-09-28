"use client";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/Field";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/States";
import { isBeninPhone } from "@/lib/mock/user";
import { useApp } from "@/lib/store";

export default function SecurityPage() {
  const contacts = useApp((s) => s.profile.trustedContacts);
  const add = useApp((s) => s.addTrustedContact);
  const remove = useApp((s) => s.removeTrustedContact);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+229 ");
  const valid = name.trim().length > 0 && isBeninPhone(phone);

  return (
    <Page>
      <PageHeader title="Sécurité" back="/account" />
      <div className="flex items-start gap-md rounded-lg bg-primary-soft p-md">
        <ShieldCheck className="size-6 shrink-0 text-primary-dark" aria-hidden />
        <p className="text-body-md text-ink">Vos contacts de confiance peuvent suivre vos trajets en direct quand vous partagez votre course.</p>
      </div>

      <h2 className="mt-lg mb-sm text-h3 text-ink">Contacts de confiance</h2>
      {contacts.length === 0 ? (
        <EmptyState icon={<UserRound className="size-6" aria-hidden />} title="Aucun contact de confiance" body="Ajoutez un proche pour partager vos trajets en un geste." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-card">
          {contacts.map((c) => (
            <li key={c.id} className="flex min-h-16 items-center gap-md px-md py-sm">
              <span className="grid size-10 place-items-center rounded-full bg-surface-sunken text-label-md text-ink">{c.name[0]}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-label-md text-ink">{c.name}</span>
                <span className="num block text-caption text-muted">{c.phone}</span>
              </span>
              <button type="button" aria-label={`Retirer ${c.name}`} onClick={() => remove(c.id)} className="grid size-touch-target place-items-center rounded-full text-muted hover:bg-surface-sunken">
                <Trash2 className="size-5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button full variant="secondary" className="mt-md" onClick={() => setOpen(true)}>+ Ajouter un contact</Button>

      <h2 className="mt-lg mb-sm text-h3 text-ink">Connexion</h2>
      <div className="flex min-h-14 items-center gap-md rounded-lg bg-surface px-md shadow-card">
        <KeyRound className="size-5 text-muted" aria-hidden />
        <span className="flex-1 text-body-md">Code PIN Gozem Money</span>
        <span className="text-caption text-success">Activé</span>
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Nouveau contact de confiance"
        footer={
          <Button
            full
            disabled={!valid}
            onClick={() => {
              add({ name: name.trim(), phone: phone.trim() });
              setOpen(false);
              setName("");
              setPhone("+229 ");
              toast.success("Contact ajouté ✓");
            }}
          >
            Ajouter
          </Button>
        }
      >
        <div className="space-y-md">
          <Field label="Nom" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Papa" />
          <Field label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="num" />
        </div>
      </BottomSheet>
    </Page>
  );
}
