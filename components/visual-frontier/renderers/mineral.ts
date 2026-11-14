import * as THREE from 'three/webgpu';
import { uniform, positionLocal, normalLocal, sin, cos, vec3, mix } from 'three/tsl';
import { studioMap, disposeScene } from './environment';
import { createNodeRenderer } from './node-renderer';
import type { Engine, SceneState } from '../types';
export async function create(host: HTMLElement,signal: AbortSignal): Promise<Engine>{
  const { renderer, disposeRenderer } = await createNodeRenderer();renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.info.autoReset=false;
  renderer.setClearColor(0xe6ddce,1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.1,50);camera.position.set(0,0,6.2);
  const environment=studioMap(true);scene.environment=environment;
  scene.add(new THREE.AmbientLight(0xffffff,1.5));
  const key=new THREE.DirectionalLight(0xfff1df,5);key.position.set(3,4,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0x487fa4,3);rim.position.set(-4,-1,2);scene.add(rim);
  const clock=uniform(0),tension=uniform(.5),chroma=uniform(.5);
  const material=new THREE.MeshPhysicalNodeMaterial({color:0xaead96,metalness:.93,roughness:.22,clearcoat:1,iridescence:.65,iridescenceIOR:1.5,side:THREE.DoubleSide});
  const folds=sin(positionLocal.y.mul(23).add(sin(positionLocal.x.mul(4)).mul(3)).add(clock.mul(.28)));
  const wave=sin(positionLocal.x.mul(3).add(clock.mul(.15))).mul(cos(positionLocal.z.mul(5)));
  material.positionNode=positionLocal.add(normalLocal.mul(folds.mul(.035).add(wave.mul(tension).mul(.22))));
  const strata=sin(positionLocal.y.mul(48).add(sin(positionLocal.x.mul(6)).mul(5))).mul(.5).add(.5);
  const patina=mix(vec3(.18,.37,.35),vec3(.81,.51,.22),strata);
  material.colorNode=mix(vec3(.73,.71,.65),patina,chroma.mul(.85));
  material.roughnessNode=strata.mul(.22).add(.16);
  const group=new THREE.Group();scene.add(group);
  // A folded, non-orientable ribbon. Dense geometry carries actual node displacement.
  const vertices=[],uvs=[],indices=[],U=240,V=48;
  for(let i=0;i<=U;i++){
    const u=i/U*Math.PI*2;
    for(let j=0;j<=V;j++){
      const v=(j/V-.5)*1.12;
      const radius=1.15+v*Math.cos(1.5*u);
      vertices.push(radius*Math.cos(u),radius*Math.sin(u),v*Math.sin(1.5*u)+.12*Math.sin(u*3));uvs.push(i/U,j/V);
      if(i<U&&j<V){const a=i*(V+1)+j,b=a+V+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  group.add(new THREE.Mesh(geometry,material));
  // Fine offset laminations give the ribbon a visible stratified edge.
  for(let i=1;i<=3;i++){const layer=new THREE.Mesh(geometry,material);layer.scale.setScalar(1+i*.015);layer.position.z=-i*.022;group.add(layer);}
  let disposed=false;
  async function dispose(){if(disposed)return;disposed=true;disposeScene(scene);environment.dispose();await disposeRenderer();renderer.domElement.remove();}
  const compileStarted=performance.now();
  try { await renderer.compileAsync(scene,camera); } catch(error) { await dispose();throw error; }
  if(signal.aborted)await dispose();
  return {backend:'Three MeshPhysicalNodeMaterial · TSL vertex displacement · WebGL2 fallback',compileMs:performance.now()-compileStarted,
    resize(w: number,h: number){renderer.setPixelRatio(Math.min(devicePixelRatio,1.5,Math.sqrt(420000/(w*h))));renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=Math.max(7.3,6.5/(w/h));camera.updateProjectionMatrix();},
    draw(t: number,state: SceneState){renderer.info.reset();clock.value=t;tension.value=state.values[0];chroma.value=state.values[1];group.rotation.set(.45+state.pointer[1]*.45,-.28+state.pointer[0]*.65+Math.sin(t*.15)*.18,-.35);material.iridescence=state.values[1];renderer.render(scene,camera);},dispose,info:()=>({geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,calls:renderer.info.render.drawCalls,triangles:renderer.info.render.triangles,bytes:renderer.info.memory.total,readbackBuffers:renderer.info.memory.readbackBuffers,renderTargets:renderer.info.memory.renderTargets})};
}
