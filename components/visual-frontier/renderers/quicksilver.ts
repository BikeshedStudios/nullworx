import * as THREE from 'three';
import sculpture from './quicksilver.compiled.json';
import { disposeScene } from './environment';
import type { Engine, SceneState } from '../types';
// Original analytic studio reflection, coupled to Shader Park's computed SDF normal.
// The library's default white ambient rig flattens metal; these light panels give it structure.
const reflectionRig=`
vec3 frontierEnvironment(vec3 r){
  float az=atan(r.z,r.x);float el=r.y;
  vec3 c=vec3(.018,.025,.033);
  float windowA=pow(max(0.,cos(az*2.4+.6)),12.);
  float windowB=pow(max(0.,cos(az*3.7-1.1)),22.);
  float horizon=exp(-pow((el-.16)*9.,2.));
  c+=vec3(.75,.88,1.)*windowA*(.2+.8*smoothstep(-.5,.7,el))*2.;
  c+=vec3(1.,.73,.36)*windowB*.8;
  c+=vec3(.9,.95,1.)*horizon*.75;
  return c;
}
ShadedMaterial frontierLighting(vec3 wp,vec3 n,vec3 ld,Material mat,vec3 bg){
  vec3 v=-getRayDirection();vec3 r=reflect(-v,n);
  vec3 environment=frontierEnvironment(r);
  float rim=pow(1.-max(0.,dot(n,v)),4.);
  vec3 color=environment*mix(vec3(.7),mat.albedo,.5)+rim*vec3(.15,.2,.3);
  color+=pow(max(0.,dot(n,normalize(v+ld))),90.)*vec3(1.,.95,.8)*1.2;
  return ShadedMaterial(mat,color,bg);
}
`;
export async function create(host: HTMLElement,signal: AbortSignal): Promise<Engine>{
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.debug.checkShaderErrors=true;
  renderer.debug.onShaderError=(gl,program,_vertex,fragment)=>{throw new Error(`Shader compilation failed: ${gl.getProgramInfoLog(program) || gl.getShaderInfoLog(fragment) || 'unknown GPU error'}`);};
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.info.autoReset=false;renderer.setClearColor(0x121510,1);
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,50);camera.position.set(0,0,4.6);
  const uniforms: Record<string, THREE.IUniform>={};
  for(const u of sculpture.uniforms){let value: unknown=u.value;const components=Array.isArray(value)?value:typeof value==='object'&&value!==null?Object.values(value):[];if(u.type==='vec2')value=new THREE.Vector2(components[0],components[1]);if(u.type==='vec3')value=new THREE.Vector3(components[0],components[1],components[2]);if(u.type==='vec4')value=new THREE.Vector4(components[0],components[1],components[2],components[3]);uniforms[u.name]={value};}
  uniforms.opacity.value=1;uniforms._scale.value=1;
  const fragment=sculpture.frag.replace('ShadedMaterial pbrLighting(',reflectionRig+'\nShadedMaterial pbrLighting(').replace('return pbrLighting(worldPos.xyz, normal, lightDirection, scope_0_material, backgroundColor);','return frontierLighting(worldPos.xyz, normal, lightDirection, scope_0_material, backgroundColor);');
  const material=new THREE.ShaderMaterial({vertexShader:sculpture.vert,fragmentShader:fragment,uniforms,transparent:true,depthWrite:false,side:THREE.BackSide});
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(2,32,20),material);scene.add(mesh);
  // Concentric measurement arcs sit behind the sculpture, as geometry, not UI art.
  const grid=new THREE.Group();scene.add(grid);
  for(let i=0;i<5;i++){
    const points=[];for(let j=0;j<=160;j++){const a=j/160*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*(1.25+i*.16),Math.sin(a)*(1.25+i*.16),-1.2));}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x899577,transparent:true,depthWrite:false,opacity:.15-i*.018}));line.renderOrder=-1;grid.add(line);
  }
  let disposed=false;
  function dispose(){if(disposed)return;disposed=true;disposeScene(scene);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
  const compileStarted=performance.now();
  try {await renderer.compileAsync(scene,camera);} catch(error) {dispose();throw error;}
  if(signal.aborted)dispose();
  return {backend:'Shader Park 0.2.8 compiled SDF · Three WebGL2 · 110 march steps',compileMs:performance.now()-compileStarted,
    resize(w: number,h: number){renderer.setPixelRatio(Math.min(devicePixelRatio,1.4,Math.sqrt(320000/(w*h))));renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=Math.max(4.3,4.5/(w/h));camera.updateProjectionMatrix();uniforms.resolution?.value.set(w,h);},
    draw(t: number,state: SceneState){renderer.info.reset();uniforms.time.value=t;uniforms.tension.value=state.values[0];uniforms.chroma.value=state.values[1];uniforms.turnX.value=state.pointer[0];uniforms.turnY.value=state.pointer[1];grid.rotation.z=t*.015;renderer.render(scene,camera);},dispose,info:()=>({...renderer.info.memory,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles})};
}
