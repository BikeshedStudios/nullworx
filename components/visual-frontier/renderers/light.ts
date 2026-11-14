import type { Engine, FrontierKind, SceneState, Variant } from "../types";

/** Cheap LIVE Canvas2D companion. It is labelled separately from the full mesh/SDF. */
export function create(host: HTMLElement, kind: FrontierKind, variant: Variant): Engine {
  const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas2D is unavailable. The study name and controls remain readable.");
  host.appendChild(canvas);
  let w = 1, h = 1;
  return {
    backend: "Live Canvas2D companion",
    resize(width, height) {
      const ratio = Math.min(devicePixelRatio, 1.25, Math.sqrt(100000 / (width * height)));
      canvas.width = Math.max(1, Math.round(width * ratio)); canvas.height = Math.max(1, Math.round(height * ratio));
      w = canvas.width; h = canvas.height;
    },
    draw(time: number, state: SceneState) {
      const a = state.values[0], b = state.values[1];
      const type = kind === "refractive-type", warm = variant === 1;
      ctx.fillStyle = type ? warm ? "#1c100e" : "#0a1025" : warm ? "#e6ddce" : "#121510";
      ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.translate(w / 2 + state.pointer[0] * w * .06, h / 2 - state.pointer[1] * h * .06);
      if (type) {
        ctx.rotate((warm ? .12 : -.1) + Math.sin(time * .17) * .035);
        const text = warm ? "VOID" : "PHASE";
        ctx.font = `bold ${Math.min(h * .55, w / (warm ? 2.6 : 3.6))}px sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        if (warm) for (let i = 4; i > 0; i--) { ctx.fillStyle = `rgba(217,108,48,${.15 + b * .04})`; ctx.fillText(text, i * w * .012, i * h * .028); }
        const gradient = ctx.createLinearGradient(-w * .3, -h * .2, w * .3, h * .2);
        gradient.addColorStop(0, warm ? "#fa9435" : "#466bef"); gradient.addColorStop(.35, "#d0eafe"); gradient.addColorStop(.55, warm ? "#a63e29" : "#3040a3"); gradient.addColorStop(.8, "#a3d9f6"); gradient.addColorStop(1, warm ? "#d17332" : "#5a57d0");
        ctx.fillStyle = gradient; ctx.fillText(text, Math.sin(time * .55) * b * w * .012, 0);
        ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = a * .4;
        for (let i = 0; i < 16; i++) { ctx.strokeStyle = `hsl(${i * 19 + time * 5} 80% 65%)`; ctx.beginPath(); ctx.ellipse(0, 0, w * (.22 + i * .012), h * (.22 + i * .012), -.2, 0, Math.PI * 2); ctx.stroke(); }
      } else {
        const scale = Math.min(w, h) * .28;
        ctx.rotate(-.35 + state.pointer[0] * .25);
        for (let layer = warm ? 3 : 2; layer >= 0; layer--) {
          ctx.beginPath();
          for (let i = 0; i <= 160; i++) {
            const u = i / 160 * Math.PI * 2;
            const radius = scale * (1 + Math.cos(u * 3 + time * .18 + layer * 2.094) * (.12 + a * .18));
            const x = Math.cos(u) * radius, y = Math.sin(u) * radius * (warm ? .8 : .72) + Math.sin(u * 3) * scale * (warm ? .2 : .08);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          const gradient = ctx.createLinearGradient(-scale, -scale, scale, scale);
          gradient.addColorStop(0, warm ? "#3e6b66" : "#b8cedc"); gradient.addColorStop(.23, "#f4f4e5"); gradient.addColorStop(.42, warm ? "#a49765" : "#263e50"); gradient.addColorStop(.7, warm ? `hsl(${35 + b * 60} 34% 48%)` : "#d6b783"); gradient.addColorStop(1, "#e7eff0");
          ctx.strokeStyle = gradient; ctx.lineWidth = scale * (warm ? .25 : .14); ctx.stroke();
        }
      }
      ctx.restore();
    },
    dispose() { canvas.remove(); },
  };
}
