// Serialize creation AND asynchronous disposal. Lightweight cards never lease.
let owner: { close(): Promise<void> } | undefined;
let pending = Promise.resolve();
export function gpuSession(start: (signal: AbortSignal) => Promise<() => void | Promise<void>>, relinquished: () => void) {
  const controller = new AbortController();
  let stop: (() => void | Promise<void>) | undefined;
  let closed: Promise<void> | undefined;
  const session = { close() {
    if (closed) return closed;
    controller.abort(); relinquished();
    closed = initialized.catch(() => {}).then(async () => { await stop?.(); if (owner === session) owner = undefined; });
    return closed;
  } };
  const initialized = pending.then(async () => {
    await owner?.close();
    if (controller.signal.aborted) return;
    owner = session; stop = await start(controller.signal);
  });
  pending = initialized.catch(() => {});
  return { close: session.close, ready: initialized };
}
