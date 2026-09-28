"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { mockCall } from "@/lib/services/mock";

type Status = "loading" | "error" | "ready";
export type MockServiceState<T> = { status: Status; data: T | null; retry: () => void };

/**
 * Loads mock data with API-like latency. status "loading" → show <Skeleton>s, "error" → <ErrorState onRetry={retry}/>.
 * Fails while the demo flag "Simuler une erreur" is on; retry after turning it off recovers.
 */
export function useMockService<T>(fn: () => T, latency?: [number, number]): MockServiceState<T> {
  const fnRef = useRef(fn);
  const latRef = useRef(latency);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ status: Status; data: T | null }>({ status: "loading", data: null });
  useEffect(() => {
    let alive = true;
    mockCall(fnRef.current, latRef.current).then(
      (data) => alive && setState({ status: "ready", data }),
      () => alive && setState({ status: "error", data: null }),
    );
    return () => {
      alive = false;
    };
  }, [attempt]);
  const retry = useCallback(() => {
    setState({ status: "loading", data: null });
    setAttempt((a) => a + 1);
  }, []);
  return { ...state, retry };
}
