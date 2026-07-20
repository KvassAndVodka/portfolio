"use client";

import { useCallback, useEffect, useState } from "react";

export type TimedFetchStatus = "loading" | "ready" | "timeout" | "error";

interface TimedFetchState<T> {
  data: T | null;
  retry: () => void;
  status: TimedFetchStatus;
}

export function useTimedFetch<T>(url: string, timeoutMs = 10_000): TimedFetchState<T> {
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<TimedFetchStatus>("loading");

  const retry = useCallback(() => {
    setData(null);
    setStatus("loading");
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;

    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
      if (active) setStatus("timeout");
    }, timeoutMs);

    async function load() {
      try {
        const response = await fetch(url, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Request failed with ${response.status}`);

        const payload = (await response.json()) as T;
        if (!active) return;

        window.clearTimeout(timeout);
        setData(payload);
        setStatus("ready");
      } catch {
        if (!active || timedOut) return;
        window.clearTimeout(timeout);
        setStatus("error");
      }
    }

    void load();

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt, timeoutMs, url]);

  return { data, retry, status };
}
