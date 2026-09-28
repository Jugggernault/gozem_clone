import { useApp } from "@/lib/store";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Wrap mock data in API-like latency (300–1500 ms). Throws when the demo flag
 * "Simuler une erreur" is on, so screens can show their error + "Réessayer" state.
 */
export async function mockCall<T>(fn: () => T, latency: [number, number] = [300, 900]): Promise<T> {
  await sleep(latency[0] + Math.random() * (latency[1] - latency[0]));
  if (useApp.getState().demo.simulateError) throw new Error("Une erreur est survenue.");
  return fn();
}
