import * as THREE from 'three/webgpu';
import { uniform, positionLocal, sin, cos, vec2, vec3, vec4, mix, float, bumpMap, glslFn, texture, uv } from 'three/tsl';
import { Text } from 'three-text';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { studioMap, disposeScene } from './environment';
import { createNodeRenderer } from './node-renderer';
import type { Engine, SceneState, Variant } from '../types';
import { data as harfbuzz } from './harfbuzz-data';
import { data as fontData } from './font-data';

// Original optical shader, now sampling a GPU target in the same WebGL2 context.
// No readPixels, canvas upload, OGL renderer or per-frame allocation.
const lensCoordinates = glslFn(`vec3 frontierLens(vec2 vUv, float uAmount, float uAspect, vec2 uPointer){
 vec2 p=(vUv-.5)*vec2(uAspect,1.);vec2 pointer=uPointer*.42;
 float radius=length(p-pointer);float lens=exp(-radius*radius*7.);
 vec2 q=vUv+normalize(p-pointer+vec2(.001))*.018*lens*uAmount;
 return vec3(q,(.0015+.009*lens)*uAmount);
}`);
const optical = glslFn(`vec4 frontierOptics(vec4 tex, vec3 object, vec2 vUv, float uTime, float uVariant, float uAspect){
 vec2 p=(vUv-.5)*vec2(uAspect,1.);
 float halo=exp(-dot(p*vec2(.8,1.3),p*vec2(.8,1.3))*3.);
 vec3 bg=mix(vec3(.025,.032,.065),vec3(.09,.12,.22),halo);
 if(uVariant>.5)bg=mix(vec3(.035,.028,.026),vec3(.19,.075,.025),halo);
 float field=length(p*vec2(.75,1.4))+sin(atan(p.y,p.x)*3.+uTime*.2)*.012;
 float caustic=pow(.5+.5*sin(field*110.-uTime*.4+p.x*9.),28.);
 bg+=(.5+.5*cos(6.28318*(field*2.+uTime*.015+vec3(.02,.34,.67))))*caustic*.12*halo;
 float arc=pow(.5+.5*sin(field*24.-uTime*.15),55.);
 bg+=(.5+.5*cos(6.28318*(p.x*.4+.48+vec3(.02,.34,.67))))*arc*halo*.13;
 vec3 col=mix(bg,object,tex.a);
 float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
 col+=grain*.014;col*=1.-.24*length(vUv-.5);return vec4(col,1.);
}`);
let font: ArrayBuffer | undefined;
function decode(base64: string) { return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer; }
function initializeText() {
  if (!font) { Text.setHarfBuzzBuffer(decode(harfbuzz)); font = decode(fontData); Text.setMaxFontCacheMemoryMB(2); }
  return font;
}

export async function create(host: HTMLElement, variant: Variant, signal: AbortSignal): Promise<Engine> {
  const { renderer, disposeRenderer } = await createNodeRenderer();
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.info.autoReset=false;
  renderer.setClearColor(0x000000,0); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
  const scene = new THREE.Scene(), group = new THREE.Group(); scene.add(group);
  const environment = studioMap(!!variant); scene.environment = environment;
  const camera = new THREE.PerspectiveCamera(33,1,.1,100); camera.position.set(0,0,13);
  scene.add(new THREE.AmbientLight(0xc7d8ff,1.1));
  const key = new THREE.DirectionalLight(0xffffff,5);key.position.set(-3,5,6);scene.add(key);
  const rim = new THREE.DirectionalLight(variant?0xff9653:0x619dff,7);rim.position.set(3,-2,3);scene.add(rim);
  const clock=uniform(0), deform=uniform(.2), dispersion=uniform(.5);
  // Refraction lives in the spectral composite pass. Transmission on this nearly
  // metallic mesh added a second geometry pass with negligible visible change.
  const material = new THREE.MeshPhysicalNodeMaterial({metalness:.96,roughness:.15,clearcoat:1,clearcoatRoughness:.08,ior:1.55,iridescence:1,iridescenceIOR:1.8,side:THREE.DoubleSide});
  const ripple=sin(positionLocal.x.mul(2.6).add(clock.mul(.55))).mul(cos(positionLocal.y.mul(3.2).add(clock.mul(.25))));
  material.positionNode=positionLocal.add(vec3(0,0,ripple.mul(deform).mul(.34)));
  const contours=positionLocal.y.mul(16).add(sin(positionLocal.x.mul(3).add(clock.mul(.22))).mul(3));
  const band=sin(contours).mul(.5).add(.5);
  material.normalNode=bumpMap(sin(contours).mul(.12).add(ripple.mul(deform).mul(.3)),float(.55));
  material.colorNode=mix(vec3(variant?.95:.13,variant?.35:.26,variant?.08:.72),vec3(.75,.94,1),band);
  material.emissiveNode=mix(vec3(.01,.02,.08),vec3(.03,.075,.09),band).mul(dispersion);
  let result: Awaited<ReturnType<typeof Text.create>>;
  try { result=await Text.create({text:variant?'VOID':'PHASE',font:initializeText(),size:1,depth:variant?.55:.28}); }
  catch(error){environment.dispose();material.dispose();await disposeRenderer();throw error;}
  result.geometry.center();
  const geometry=new TessellateModifier(.085,5).modify(result.geometry);
  geometry.computeVertexNormals();geometry.computeBoundingBox();
  const width=geometry.boundingBox!.max.x-geometry.boundingBox!.min.x;
  const textMesh=new THREE.Mesh(geometry,material);textMesh.scale.set(7.4/width,(7.4/width)*(variant?1.7:2.15),1.4); group.add(textMesh);
  const echoes: THREE.Mesh[]=[];
  if(variant){
    for(let i=1;i<5;i++){
      const m=new THREE.MeshPhysicalNodeMaterial({color:new THREE.Color().setHSL(.055+i*.025,.65,.4),metalness:.9,roughness:.25,transparent:true,opacity:.28});
      // Echoes are rigid: only the foreground needs tessellation for TSL bends.
      const mesh=new THREE.Mesh(result.geometry,m);mesh.scale.copy(textMesh.scale);mesh.position.set(i*.12,-i*.28,-i*.42);group.add(mesh);echoes.push(mesh);
    }
  }
  group.rotation.set(-.13, -.15, variant? .12 : -.1);
  host.appendChild(renderer.domElement);
  const target=new THREE.RenderTarget(1,1,{type:THREE.UnsignedByteType,generateMipmaps:false,samples:4});
  const amount=uniform(.5), aspect=uniform(1), pointer=uniform(new THREE.Vector2());
  const composite=new THREE.NodeMaterial();
  // OGL's triangle is bottom-origin; Three's QuadMesh UVs are top-origin.
  // TextureNode already flips render-target sampling on the WebGL backend.
  const opticalUV=uv().flipY();
  const coordinates=lensCoordinates({vUv:opticalUV,uAmount:amount,uAspect:aspect,uPointer:pointer}) as THREE.Node<"vec3">;
  const sceneTexture=texture(target.texture);
  const center=sceneTexture.sample(coordinates.xy.flipY());
  const red=sceneTexture.sample(coordinates.xy.add(vec2(coordinates.z,0)).flipY());
  const blue=sceneTexture.sample(coordinates.xy.sub(vec2(coordinates.z,0)).flipY());
  // The lab's HTMLCanvas upload unpremultiplied alpha. Restore that contract
  // for the GPU target so transparent physical echoes keep their exact weight.
  const tex=vec4(center.rgb.div(center.a.max(.00001)).clamp(0,1),center.a);
  const channels=vec3(red.r.div(red.a.max(.00001)).clamp(0,1),tex.g,blue.b.div(blue.a.max(.00001)).clamp(0,1));
  composite.fragmentNode=optical({tex,object:channels,vUv:opticalUV,uTime:clock,uVariant:float(variant),uAspect:aspect});
  const screen=new THREE.QuadMesh(composite);
  let disposed=false;
  async function dispose(){if(disposed)return;disposed=true;disposeScene(scene,result.geometry);result.dispose();environment.dispose();target.dispose();composite.dispose();await disposeRenderer();renderer.domElement.remove();}
  const compileStarted=performance.now();
  try { renderer.setOutputRenderTarget(target);renderer.setRenderTarget(target);await renderer.compileAsync(scene,camera);renderer.setRenderTarget(null);renderer.setOutputRenderTarget(null);renderer.toneMapping=THREE.NoToneMapping;renderer.outputColorSpace=THREE.LinearSRGBColorSpace;await renderer.compileAsync(screen,screen.camera);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputColorSpace=THREE.SRGBColorSpace; } catch(error) { await dispose();throw error; }
  if(signal.aborted){await dispose();}
  return {
    backend:'three-text mesh → Three TSL/WebGL2 → same-context spectral pass',compileMs:performance.now()-compileStarted,
    resize(w: number,h: number){const ratio=Math.min(devicePixelRatio,1.5,Math.sqrt(360000/(w*h)));renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);target.setSize(renderer.domElement.width,renderer.domElement.height);camera.aspect=w/h;camera.position.z=Math.max(11,14/(w/h));camera.updateProjectionMatrix();aspect.value=w/h;},
    draw(t: number,state: SceneState){
      renderer.info.reset();
      clock.value=t;deform.value=state.values[1];dispersion.value=state.values[0];
      group.rotation.y=state.pointer[0]*.38+Math.sin(t*.22)*.12;
      group.rotation.x=-.14+state.pointer[1]*.2;
      group.rotation.z=(variant?.12:-.1)+Math.sin(t*.17)*.035;
      group.position.y=variant?.25:0;
      material.iridescence=state.values[0];material.roughness=.12+state.values[1]*.16;
      for(let i=0;i<echoes.length;i++)echoes[i].position.x=(i+1)*(.07+state.values[1]*.22);
      renderer.setOutputRenderTarget(target);renderer.setRenderTarget(target);renderer.render(scene,camera);
      renderer.setRenderTarget(null);renderer.setOutputRenderTarget(null);
      amount.value=state.values[0]*2;pointer.value.set(state.pointer[0],state.pointer[1]);
      // Match the lab's ACES/sRGB canvas samples, then composite without a second conversion.
      renderer.toneMapping=THREE.NoToneMapping;renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
      screen.render(renderer);
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputColorSpace=THREE.SRGBColorSpace;
    },dispose,info:()=>({geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,calls:renderer.info.render.drawCalls,triangles:renderer.info.render.triangles,bytes:renderer.info.memory.total,readbackBuffers:renderer.info.memory.readbackBuffers,renderTargets:renderer.info.memory.renderTargets}),
  };
}
