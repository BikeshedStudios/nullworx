/** Browser-only instrumentation; never included by application code. */
export function asciiProbe() {
  const counts = { draws: 0, uploads: 0, textures: 0, programs: 0, arrays: 0, contexts: 0, atlasUploads: 0, sample: 0, energy: 0, timeline: [] as { at: number; time: number }[], uniforms: {} as Record<string, number | number[]>, urls: 0 };
  Object.assign(window, { asciiCounts: counts });
  let frameAt = 0;
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = callback => raf(now => { frameAt = now; callback(now); });
  const contexts = new WeakSet();
  const get = HTMLCanvasElement.prototype.getContext;
  Object.assign(HTMLCanvasElement.prototype, { getContext: function (this: HTMLCanvasElement, ...args: unknown[]) {
    const context = Reflect.apply(get, this, args);
    if (args[0] === "webgl2" && context && !contexts.has(context)) { contexts.add(context); counts.contexts++; }
    return context;
  } });
  const createUrl = URL.createObjectURL, revokeUrl = URL.revokeObjectURL;
  URL.createObjectURL = function (blob) { counts.urls++; return createUrl.call(this, blob); };
  URL.revokeObjectURL = function (url) { counts.urls--; return revokeUrl.call(this, url); };
  const p = WebGL2RenderingContext.prototype;
  const draw = p.drawArrays;
  p.drawArrays = function (...args) {
    counts.draws++;
    const result = draw.apply(this, args);
    counts.timeline.push({ at: frameAt, time: Number(counts.uniforms.uTime) });
    if (counts.timeline.length > 30) counts.timeline.shift();
    if (!document.querySelector("video")?.paused) return result;
    const w = this.drawingBufferWidth, h = this.drawingBufferHeight;
    const pixels = new Uint8Array(w * h * 4);
    this.readPixels(0, 0, w, h, this.RGBA, this.UNSIGNED_BYTE, pixels);
    let hash = 2166136261;
    let energy = 0;
    for (let i = 0; i < pixels.length; i++) hash = Math.imul(hash ^ pixels[i], 16777619);
    for (let i = 0; i < pixels.length; i += 4) energy += pixels[i] + pixels[i + 1] + pixels[i + 2];
    counts.sample = hash >>> 0;
    counts.energy = energy / (w * h * 3);
    return result;
  };
  const upload = p.texImage2D;
  Object.assign(p, { texImage2D: function (this: WebGL2RenderingContext, ...args: unknown[]) {
    if (args.some(a => a instanceof HTMLVideoElement)) counts.uploads++;
    if (args.some(a => a instanceof HTMLCanvasElement)) counts.atlasUploads++;
    return Reflect.apply(upload, this, args);
  } });
  const locations = new WeakMap<WebGLUniformLocation, string>(), locate = p.getUniformLocation;
  p.getUniformLocation = function (...args) { const result = locate.apply(this, args); if (result) locations.set(result, args[1]); return result; };
  for (const method of ["uniform1f", "uniform1i", "uniform2f", "uniform3f"] as const) {
    const original = p[method];
    Object.assign(p, { [method]: function (this: WebGL2RenderingContext, location: WebGLUniformLocation, ...values: number[]) {
      counts.uniforms[locations.get(location) ?? "unknown"] = values.length === 1 ? values[0] : values;
      return Reflect.apply(original, this, [location, ...values]);
    } });
  }
  for (const [create, remove, key] of [["createTexture", "deleteTexture", "textures"], ["createProgram", "deleteProgram", "programs"], ["createVertexArray", "deleteVertexArray", "arrays"]] as const) {
    const make = p[create], destroy = p[remove], live = new WeakSet();
    Object.assign(p, {
      [create]: function (this: WebGL2RenderingContext) { const object = make.call(this); if (object) { live.add(object); counts[key]++; } return object; },
      [remove]: function (this: WebGL2RenderingContext, object: never) { if (object && live.delete(object)) counts[key]--; return destroy.call(this, object); },
    });
  }
}
export type AsciiCounts = { draws: number; uploads: number; textures: number; programs: number; arrays: number; contexts: number; atlasUploads: number; sample: number; energy: number; timeline: { at: number; time: number }[]; uniforms: Record<string, number | number[]>; urls: number };
