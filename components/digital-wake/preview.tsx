"use client";
import dynamic from "next/dynamic";
const Wake = dynamic(() => import("./App"), {
  ssr: false,
  loading: () => (
    <main id="main" className="container section" aria-busy="true">
      <p>Experimental / Beta</p>
      <h1>Digital Wake</h1>
      <p>Preparing Digital Wake…</p>
    </main>
  ),
});
export function DigitalWakePreview() {
  return <Wake />;
}
