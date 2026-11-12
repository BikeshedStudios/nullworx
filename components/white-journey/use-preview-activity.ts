"use client";

import { useEffect, useState, type RefObject } from "react";

/** No animation until visibility and the user's motion preference are known. */
export function usePreviewActivity(ref: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({ visible: false, reduced: true, seen: false });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const sync = () => setState(current => {
      const visible = inView && !document.hidden;
      return current.visible === visible && current.reduced === motion.matches && (current.seen || !inView)
        ? current : { visible, reduced: motion.matches, seen: current.seen || inView };
    });
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    observer.observe(node);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);
  return state;
}
