import type { Config } from './config';
import { stableHash } from './config';

export type FlowSample = { x: number; y: number; vx: number; vy: number; confidence: number };
export type MotionSidecar = { schema: 1; sourceSha256: string; duration: number; fps: number; grid: [number,number]; frames: { time: number; cells: FlowSample[] }[] };
export type FinAnchor = { x:number; y:number; label:string };

const VERT=`#version 300 es
precision highp float;
void main(){
  vec2 pos=vec2((gl_VertexID<<1)&2,gl_VertexID&2);
  gl_Position=vec4(pos*2.0-1.0,0.0,1.0);
}`;
const FRAG=`#version 300 es
precision highp float;
uniform sampler2D u_frame;
uniform sampler2D u_glyph;
uniform vec2 u_res;
uniform int u_mode;
uniform int u_glyphCount;
uniform float u_glyphStep;
uniform float u_dotStep;
uniform float u_dotSize;
uniform float u_blend;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_jitter;
uniform float u_compare;
uniform float u_compareSplit;
out vec4 outColor;
float hash21(vec2 p){ p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x); }
vec3 tone(vec3 color){
  color=clamp((color-.5)*u_contrast+.5,0.,1.);
  float lum=dot(color,vec3(.2126,.7152,.0722));
  color=clamp(mix(vec3(lum),color,u_saturation)*u_brightness,0.,1.);
  return color;
}
vec3 sampleSource(vec2 uv){return tone(texture(u_frame,clamp(uv,0.,1.)).rgb);}
float intensity(vec3 color){return dot(color,vec3(.2126,.7152,.0722));}
vec3 ascii(vec2 pix){
  float stepSize=max(3.,u_glyphStep);
  vec2 cell=floor(pix/stepSize);
  vec2 within=fract(pix/stepSize);
  vec2 uv=(cell+.5)*stepSize/u_res;
  vec3 color=sampleSource(uv);
  float value=intensity(color);
  float idx=min(float(u_glyphCount-1),floor(value*float(u_glyphCount)));
  // Atlas has each glyph in its own, full-size normalized tile.
  vec2 glyphUv=vec2((idx+within.x)/float(u_glyphCount),1.-within.y);
  float glyph=texture(u_glyph,glyphUv).r;
  return color*glyph;
}
vec3 dots(vec2 pix){
  float stepSize=max(3.,u_dotStep);
  vec2 cell=floor(pix/stepSize);
  vec2 jitter=vec2(hash21(cell),hash21(cell+97.7))-.5;
  vec2 center=(cell+.5+jitter*.5*u_jitter)*stepSize;
  vec3 color=sampleSource(center/u_res);
  float luma=intensity(color);
  float radius=clamp((.2+luma*.55)*u_dotSize*stepSize*.36,.4,stepSize*.44);
  float disk=1.-smoothstep(radius-.8,radius+.8,length(pix-center));
  return color*disk;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  vec3 color;
  if(u_mode==0 || u_mode==4) color=texture(u_frame,uv).rgb;
  else if(u_mode==1) color=ascii(gl_FragCoord.xy);
  else if(u_mode==2) color=dots(gl_FragCoord.xy);
  else color=mix(ascii(gl_FragCoord.xy),dots(gl_FragCoord.xy),1.-u_blend);
  if(u_compare>.5 && gl_FragCoord.x < u_res.x*u_compareSplit) color=texture(u_frame,uv).rgb;
  outColor=vec4(color,1.);
}`;
function compile(gl:WebGL2RenderingContext,type:number,source:string){
  const shader=gl.createShader(type); if(!shader) throw new Error('No shader allocation');
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)||'Shader compile failed');
  return shader;
}
function program(gl:WebGL2RenderingContext){
  const p=gl.createProgram(); if(!p) throw new Error('No shader program');
  const a=compile(gl,gl.VERTEX_SHADER,VERT),b=compile(gl,gl.FRAGMENT_SHADER,FRAG);
  gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);
  gl.deleteShader(a);gl.deleteShader(b);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'Program link failed');
  return p;
}
export class VideoGpuRenderer {
  readonly gl:WebGL2RenderingContext;
  private p:WebGLProgram;
  private tex:WebGLTexture;
  private atlas:WebGLTexture;
  private vao:WebGLVertexArrayObject;
  private glyphCount=1;
  private ramp='';
  readonly canvas:HTMLCanvasElement;
  frames=0;
  constructor(canvas:HTMLCanvasElement){
    this.canvas=canvas;
    const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,preserveDrawingBuffer:false});
    if(!gl)throw new Error('WebGL2 unavailable');
    this.gl=gl;this.p=program(gl);
    const t=gl.createTexture(),a=gl.createTexture(),v=gl.createVertexArray();
    if(!t||!a||!v)throw new Error('WebGL allocation failure');
    this.tex=t;this.atlas=a;this.vao=v;
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,a);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    canvas.addEventListener('webglcontextlost',e=>e.preventDefault());
  }
  setAtlas(ramp:string){
    if(this.ramp===ramp)return;
    this.ramp=ramp;this.glyphCount=Array.from(ramp).length;
    const tile=48;const cvs=document.createElement('canvas');cvs.width=tile*this.glyphCount;cvs.height=tile;
    const ctx=cvs.getContext('2d',{willReadFrequently:false});if(!ctx)throw new Error('Glyph atlas canvas unavailable');
    ctx.fillStyle='black';ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 46px monospace';
    for(let i=0;i<this.glyphCount;i++)ctx.fillText(Array.from(ramp)[i]!,tile*i+tile/2,tile/2+2);
    const gl=this.gl;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.atlas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,0);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cvs);
  }
  render(video:HTMLVideoElement,c:Config){
    if(video.readyState<2 || !video.videoWidth)return;
    const w=video.videoWidth,h=video.videoHeight;
    // Bound actual GPU work. Controls change the sample grid, not the video source.
    const scale=Math.min(1,1280/Math.max(w,h));
    const rw=Math.max(1,Math.round(w*scale)),rh=Math.max(1,Math.round(h*scale));
    if(this.canvas.width!==rw||this.canvas.height!==rh){this.canvas.width=rw;this.canvas.height=rh;}
    const gl=this.gl;
    if(gl.isContextLost())throw new Error('WebGL context lost');
    this.setAtlas(c.asciiRamp);
    gl.viewport(0,0,rw,rh);gl.useProgram(this.p);gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,0);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.atlas);
    const uni=(key:string)=>gl.getUniformLocation(this.p,key);
    gl.uniform1i(uni('u_frame'),0);gl.uniform1i(uni('u_glyph'),1);
    gl.uniform2f(uni('u_res'),rw,rh);
    gl.uniform1i(uni('u_mode'),({original:0,ascii:1,pointillism:2,hybrid:3,'wake-debug':4} as const)[c.mode]);
    gl.uniform1i(uni('u_glyphCount'),this.glyphCount);
    gl.uniform1f(uni('u_glyphStep'),c.asciiSize);
    gl.uniform1f(uni('u_dotStep'),Math.max(3,9/c.dotDensity));
    gl.uniform1f(uni('u_dotSize'),c.dotSize);
    gl.uniform1f(uni('u_blend'),c.asciiBlend);
    gl.uniform1f(uni('u_brightness'),c.brightness);
    gl.uniform1f(uni('u_contrast'),c.contrast);
    gl.uniform1f(uni('u_saturation'),c.saturation);
    gl.uniform1f(uni('u_jitter'),c.dotDistribution==='jitter'?c.dotStability:0);
    gl.uniform1f(uni('u_compare'),c.compare?1:0);
    gl.uniform1f(uni('u_compareSplit'),c.compareSplit);
    gl.drawArrays(gl.TRIANGLES,0,3);
    const error=gl.getError();
    if(error!==gl.NO_ERROR)throw new Error(`WebGL draw error ${error}`);
    this.frames++;
  }
  destroy(){const gl=this.gl;gl.deleteTexture(this.tex);gl.deleteTexture(this.atlas);gl.deleteVertexArray(this.vao);gl.deleteProgram(this.p);}
}
export function parseMotion(input:unknown):MotionSidecar {
  if(!input||typeof input!=='object')throw new Error('Motion JSON must be an object');
  const obj=input as Partial<MotionSidecar>;
  if(obj.schema!==1||!Array.isArray(obj.frames)||!Array.isArray(obj.grid)||!Number.isFinite(obj.duration))throw new Error('Invalid motion sidecar header');
  for(const frame of obj.frames){
    if(!Number.isFinite(frame.time)||!Array.isArray(frame.cells))throw new Error('Invalid motion frame');
    for(const q of frame.cells)if(![q.x,q.y,q.vx,q.vy,q.confidence].every(Number.isFinite))throw new Error('Invalid motion vector');
  }
  return obj as MotionSidecar;
}
export function flowAt(sidecar:MotionSidecar|null,t:number,x:number,y:number):FlowSample|null {
  if(!sidecar||!sidecar.frames.length)return null;
  const idx=Math.max(0,Math.min(sidecar.frames.length-1,Math.round(t*(sidecar.fps || 10))));
  const frame=sidecar.frames[idx]!;
  let nearest:FlowSample|null=null, bestDist=Infinity;
  for(const next of frame.cells){const dist=(next.x-x)**2+(next.y-y)**2;if(dist<bestDist){bestDist=dist;nearest=next;}}
  return nearest;
}
/** CPU overlay is explicitly Proof A only: not GPU-resident and not fin tracking. */
export function drawWake(
  canvas:HTMLCanvasElement, config:Config, t:number, duration:number,
  anchors:FinAnchor[], motion:MotionSidecar|null, sampledColor:string,
){
  const ctx=canvas.getContext('2d');if(!ctx)return 0;
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
  if(config.mode!=='wake-debug'&&!config.wakeEnabled)return 0;
  if(config.mode==='wake-debug'){
    for(const a of anchors){ctx.beginPath();ctx.strokeStyle='#17d2c7';ctx.lineWidth=2;
      ctx.arc(a.x*w,a.y*h,18,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.fillText(a.label,a.x*w+22,a.y*h);}
  }
  const d=duration>0?duration:30;
  const lif=config.wakeLifetime;
  // Quantized birth times yield the same positions at t and (t + duration).
  // Histories wrap at the video boundary; existing particles are never cleared.
  let painted=0;
  for(let i=0;i<anchors.length;i++){
    const a=anchors[i]!;
    const rate=config.wakeRate;
    if(rate<=0)continue;
    const start=Math.floor((t-lif)*rate),end=Math.floor(t*rate);
    for(let j=start;j<=end&&painted<config.particleBudget;j++){
      const age=t-j/rate;
      if(age<0||age>lif)continue;
      const seed=((j%(Math.round(d*rate)||1))+(Math.round(d*rate)||1))%(Math.round(d*rate)||1);
      const birth=((j/rate)%d+d)%d;
      const q=flowAt(motion,birth,a.x,a.y);
      const vx=q?.vx??(-.08),vy=q?.vy??(-.012);
      const dispersion=(stableHash(i,seed,41)-.5)*config.wakeTurbulence;
      const curve=Math.sin(age*3+stableHash(i,seed,97)*6.283)*config.wakeCurl*.016;
      const px=(a.x+(vx*.035+dispersion*.04)*age*config.wakeVelocity+curve)*w;
      const py=(a.y+(vy*.035+dispersion*.04)*age*config.wakeVelocity+curve*.6)*h;
      const alpha=(1-age/lif)**1.5 * config.wakeOpacity * (q?.confidence??.45);
      if(alpha<=.02)continue;
      ctx.globalAlpha=alpha;
      ctx.fillStyle=sampledColor;
      const radius=Math.max(.3,config.wakeSize*(.65+stableHash(i,seed,99)*.8));
      ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);ctx.fill();painted++;
    }
  }
  ctx.globalAlpha=1;
  return painted;
}
