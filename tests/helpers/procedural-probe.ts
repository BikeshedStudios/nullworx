/** Observe actual canvas draws and defer real ResizeObserver entries across suspension. */
export function installProceduralProbe() {
  type Record = { id: number; owner: Element | null; callback: ResizeObserverCallback; observer: ResizeObserver; entries: ResizeObserverEntry[]; pending: ResizeObserverEntry[][]; disconnected: boolean };
  const records: Record[] = [], events: object[] = [], draws = new WeakMap<Element, number>();
  const snapshot = (owner: Element | null) => ({ connected: owner?.isConnected ?? false, hidden: document.hidden, playing: owner?.getAttribute("data-playing"), frame: owner?.getAttribute("data-frame"), time: owner?.getAttribute("data-time"), draws: owner ? draws.get(owner) ?? 0 : 0 });
  const note = (event: object) => { events.push(event); if (events.length > 400) events.shift(); };
  const fill = CanvasRenderingContext2D.prototype.fillRect;
  CanvasRenderingContext2D.prototype.fillRect = function (...args) {
    const owner = this.canvas.closest("[data-procedural-ascii]");
    if (owner) { draws.set(owner, (draws.get(owner) ?? 0) + 1); if (document.hidden || !owner.isConnected) note({ kind: "draw", ...snapshot(owner) }); }
    return fill.apply(this, args);
  };
  const Native = window.ResizeObserver;
  window.ResizeObserver = class extends Native {
    private record: Record;
    constructor(callback: ResizeObserverCallback) {
      super((entries, observer) => {
        const record = this.record;
        record.entries = entries;
        if (record.owner?.matches("[data-procedural-ascii]")) {
          note({ kind: "resize-notification", id: record.id, ...snapshot(record.owner) });
          if (document.hidden) { record.pending.push(entries); return; }
        }
        callback(entries, observer);
      });
      const record = { id: records.length, owner: null, callback, observer: this, entries: [], pending: [], disconnected: false };
      this.record = record; records.push(record);
    }
    observe(target: Element, options?: ResizeObserverOptions) { this.record.owner = target; super.observe(target, options); }
    disconnect() { this.record.disconnected = true; note({ kind: "disconnect", id: this.record.id, ...snapshot(this.record.owner) }); super.disconnect(); }
  };
  window.__proceduralProbe = {
    current() { return records.filter(r => r.owner?.matches("[data-procedural-ascii]") && r.owner.isConnected && !r.disconnected).at(-1)!.id; },
    pending(id) { return records[id].pending.length; },
    snapshot(id) { return snapshot(records[id].owner); },
    deliver(id, stale = false) {
      const r = records[id], before = snapshot(r.owner);
      for (const entries of stale ? [r.entries] : r.pending.splice(0)) r.callback(entries, r.observer);
      note({ kind: "delayed-delivery", id, disconnected: r.disconnected, before, after: snapshot(r.owner) });
    },
    dump() { return { records: records.filter(r => r.owner?.matches("[data-procedural-ascii]")).map(r => ({ id: r.id, disconnected: r.disconnected, pending: r.pending.length, ...snapshot(r.owner) })), events }; },
  };
}

declare global {
  interface Window {
    __proceduralProbe: {
      current(): number;
      pending(id: number): number;
      snapshot(id: number): { connected: boolean; hidden: boolean; playing: string | null | undefined; frame: string | null | undefined; time: string | null | undefined; draws: number };
      deliver(id: number, stale?: boolean): void;
      dump(): object;
    };
  }
}
