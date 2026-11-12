"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const Availability = createContext(false);

/** One capability request for static home, header and footer; no provider secrets. */
export function DropsAvailabilityProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/drops/status", { cache: "no-store", signal: abort.signal })
      .then(async response => response.ok ? response.json() : null)
      .then(value => { if (!abort.signal.aborted) setEnabled(value?.enabled === true); })
      .catch(() => { if (!abort.signal.aborted) setEnabled(false); });
    return () => abort.abort();
  }, []);
  return <Availability.Provider value={enabled}>{children}</Availability.Provider>;
}

export const useDropsAvailability = () => useContext(Availability);

export function DropsLink({ children, className }: { children: ReactNode; className?: string }) {
  return useDropsAvailability() ? <Link href="/drops" className={className}>{children}</Link> : null;
}
