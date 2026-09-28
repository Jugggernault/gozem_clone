"use client";
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useApp } from "@/lib/store";

/** Shown when the browser is offline or the "Simuler hors connexion" demo flag is on. */
export function OfflineBanner() {
  const simulated = useApp((s) => s.demo.offline);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  if (!simulated && !offline) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-60 flex items-center justify-center gap-sm bg-ink px-md py-sm pt-[max(0.5rem,env(safe-area-inset-top))] text-caption text-on-ink">
      <WifiOff className="size-4" aria-hidden /> Vous êtes hors connexion. Certaines actions seront envoyées dès le retour du réseau.
    </div>
  );
}
