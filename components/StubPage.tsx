import Link from "next/link";
import { Construction } from "lucide-react";
import { Page } from "./Page";
import { PageHeader } from "./PageHeader";

/** Placeholder so navigation never 404s. Replace the route's page.tsx with the real screen. */
export function StubPage({ title, back = true }: { title: string; back?: string | boolean }) {
  return (
    <Page>
      <PageHeader title={title} back={back === false ? undefined : back} />
      <div className="mt-lg flex flex-col items-center gap-md rounded-lg border border-border bg-surface p-xl text-center">
        <Construction className="size-8 text-accent" aria-hidden />
        <p className="text-body-lg text-muted">Cet écran arrive très bientôt.</p>
        <Link href="/" className="text-label-md text-primary-dark underline underline-offset-4">Retour à l&apos;accueil</Link>
      </div>
    </Page>
  );
}
