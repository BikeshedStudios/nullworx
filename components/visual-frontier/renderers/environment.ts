import { CanvasTexture, EquirectangularReflectionMapping, SRGBColorSpace } from 'three';
import type { BufferGeometry, Material, Mesh, Object3D } from 'three';
// A procedural studio light rig, generated at runtime. No photographic HDRI.
export function studioMap(warm = false) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas2D is required for the procedural light rig.');
  ctx.fillStyle = warm ? '#17141c' : '#121827'; ctx.fillRect(0,0,1024,512);
  const panels: [number, number, number, number, string][] = [[40,15,80,470,'#fff8ed'],[290,90,170,320,warm?'#ffcb98':'#a8ddff'],[500,0,18,512,'#ffffff'],[720,80,120,280,warm?'#f8f0df':'#dcc7ff'],[950,170,50,200,'#fff']];
  for(const [x,y,w,h,color] of panels){ const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#121725');g.addColorStop(.18,color);g.addColorStop(.8,color);g.addColorStop(1,'#121725');ctx.fillStyle=g;ctx.fillRect(x,y,w,h); }
  const texture = new CanvasTexture(canvas); texture.mapping = EquirectangularReflectionMapping; texture.colorSpace = SRGBColorSpace;
  return texture;
}
export function disposeScene(scene: Object3D, textOwnedGeometry?: BufferGeometry) {
  const geometries = new Set<BufferGeometry>(), materials = new Set<Material>();
  scene.traverse(object => { const o = object as Mesh; if(o.geometry && o.geometry !== textOwnedGeometry) geometries.add(o.geometry); for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]) materials.add(m); });
  geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose());
}
