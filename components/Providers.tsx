"use client";
import { type ReactNode, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Logo } from "./shell/Logo";
import { OfflineBanner } from "./shell/OfflineBanner";

/**
 * Rehydrates the persisted store, then renders the app. Children never see pre-hydration seed state,
 * so pages can read the store synchronously on first render.
 */
export function Providers({ children }: { children: ReactNode }) {
  const hydrated = useApp((s) => s.hydrated);
  useEffect(() => {
    void useApp.persist.rehydrate();
  }, []);
  if (!hydrated)
    return (
      <div className="grid min-h-dvh place-items-center bg-neutral" aria-busy="true">
        <Logo className="text-hero text-ink" />
      </div>
    );
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
