"use client";
import dynamic from "next/dynamic";
const Wake = dynamic(() => import("./App"), {
  ssr: false,
  loading: () => (
    <main id="main" className="container section" aria-busy="true">
      Preparing Digital Wake…
    </main>
  ),
});
export function DigitalWakePreview() {
  return <Wake />;
}
