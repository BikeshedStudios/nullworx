"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./drops-form.module.css";

export function DropsForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/drops/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? "").trim(),
          website: String(data.get("website") ?? ""),
          source: "drops",
        }),
      });
      if (!response.ok) {
        setMessage(response.status === 429 ? "Too many requests. Try again later." : "Signups are unavailable right now. Try again later.");
        return;
      }
      setSucceeded(true);
      setMessage("Check your inbox for a confirmation link. You are not subscribed until you confirm.");
      form.reset();
    } catch {
      setMessage("Could not reach the signup service. Try again later.");
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={submit} className={styles.form}>
    <label htmlFor="drops-email">Email address</label>
    <div className={styles.fields}>
      <input id="drops-email" name="email" type="email" autoComplete="email" required maxLength={254}
        placeholder="you@example.com" disabled={pending || succeeded}/>
      <button type="submit" disabled={pending || succeeded}>{pending ? "Sending…" : succeeded ? "Confirmation sent" : "Get free Drops"}</button>
    </div>
    <div className={styles.trap} aria-hidden="true"><label htmlFor="drops-website">Website</label><input id="drops-website" name="website" autoComplete="off" tabIndex={-1}/></div>
    <p className={styles.fine}>Occasional emails about free effects, presets and experiments. Double opt-in, no spam. <Link href="/privacy">Privacy</Link>.</p>
    <p aria-live="polite" role="status" className={styles.status}>{message}</p>
  </form>;
}
