"use client";

import { useEffect, useState } from "react";
import type { PlaygroundContract } from "@/lib/playground";

export function usePlayground<Settings>(contract: PlaygroundContract<Settings>) {
  const [settings, setSettings] = useState(contract.defaults);
  const [sharedUrl, setSharedUrl] = useState("");
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    function restore() {
      setSettings(contract.parse(window.location.search));
      setSharedUrl("");
      setFeedback("");
    }
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [contract]);

  function update(patch: Partial<Settings>) {
    setSettings(current => ({ ...current, ...patch }));
    setSharedUrl("");
    setFeedback("");
  }
  function reset() {
    setSettings(contract.defaults);
    setSharedUrl("");
    setFeedback("Default settings restored.");
  }
  async function share() {
    const url = new URL(contract.path, window.location.origin);
    url.search = contract.query(settings);
    setSharedUrl(url.href);
    try {
      await navigator.clipboard.writeText(url.href);
      setFeedback("Settings link copied.");
    } catch {
      setFeedback("Copy the settings link from the field below. Clipboard access is unavailable.");
    }
  }
  return { settings, update, reset, share, sharedUrl, feedback };
}
