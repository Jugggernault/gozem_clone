"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/Field";
import { Avatar } from "@/components/shell/Avatar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

const initials = (name: string) =>
  name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

export default function ProfilePage() {
  const user = useApp((s) => s.profile.user);
  const updateProfile = useApp((s) => s.updateProfile);
  const [form, setForm] = useState({ firstName: user.firstName, name: user.name, phone: user.phone, email: user.email });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Page>
      <PageHeader title="Informations personnelles" back="/account" />
      <div className="flex justify-center py-md">
        <Avatar link={false} className="size-20 text-h2" />
      </div>
      <form
        className="space-y-md rounded-lg bg-surface p-md shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfile({ ...form, avatar: initials(form.name) });
          toast.success("Profil mis à jour ✓");
        }}
      >
        <Field label="Prénom" value={form.firstName} onChange={set("firstName")} required />
        <Field label="Nom complet" value={form.name} onChange={set("name")} required />
        <Field label="Téléphone" value={form.phone} onChange={set("phone")} inputMode="tel" className="num" />
        <Field label="E-mail" value={form.email} onChange={set("email")} type="email" />
        <Button type="submit" full>Enregistrer</Button>
      </form>
    </Page>
  );
}
