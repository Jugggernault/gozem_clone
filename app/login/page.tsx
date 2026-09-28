import Link from "next/link";
import { Logo } from "@/components/shell/Logo";
import { buttonClass } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-primary-dark px-gutter pb-[max(2rem,env(safe-area-inset-bottom))] pt-2xl text-on-primary">
      <div className="mx-auto flex w-full max-w-120 flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center gap-md">
          <span className="grid size-20 place-items-center rounded-xl bg-surface text-hero" aria-hidden>🏍️</span>
          <Logo className="text-hero text-on-primary" />
          <h1 className="text-h1">Se déplacer, manger, payer. Tout au même endroit.</h1>
          <p className="text-body-lg opacity-90">Cotonou · Abomey-Calavi · Porto-Novo</p>
        </div>
        <Link href="/" className={buttonClass("secondary", true, "h-13 bg-surface text-ink hover:bg-surface-sunken")}>
          Continuer
        </Link>
        <p className="mt-md text-center text-caption opacity-80">En continuant, vous acceptez les conditions d&apos;utilisation de Gozem.</p>
      </div>
    </main>
  );
}
