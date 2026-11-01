import {drawWake,type FinAnchor,type MotionSidecar} from './engine';
import {FishWake,type Variant} from './fish';
import type {Config} from './config';
// Frozen frame-0 fin positions for literal Proof A only. Never used by B/C.
export const HISTORICAL_ANCHORS:FinAnchor[]=[{x:.54,y:.23,label:'A / FROZEN 1'},{x:.59,y:.47,label:'A / FROZEN 2'},{x:.53,y:.75,label:'A / FROZEN 3'},{x:.36,y:.37,label:'A / FROZEN 4'}];
export function makeCanvas(w=1280,h=720){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
export function historical(canvas:HTMLCanvasElement,c:Config,t:number,video:HTMLVideoElement,motion:MotionSidecar|null){
  const sample=makeCanvas(64,36),ctx=sample.getContext('2d',{willReadFrequently:true})!;
  ctx.drawImage(video,0,0,64,36);const a=HISTORICAL_ANCHORS[0]!;
  const p=ctx.getImageData(Math.floor(a.x*64),Math.floor(a.y*36),1,1).data;
  return drawWake(canvas,c,t,30,HISTORICAL_ANCHORS,motion,`rgb(${p[0]} ${p[1]} ${p[2]})`);
}
export function debugPanels(target:HTMLCanvasElement,video:HTMLVideoElement,base:HTMLCanvasElement,wake:FishWake,c:Config,t:number,variant:Variant,motion:MotionSidecar|null){
  const ctx=target.getContext('2d')!;const tw=640,th=360;
  if(target.width!==tw*3||target.height!==th*2){target.width=tw*3;target.height=th*2;}
  ctx.fillStyle='#07070a';ctx.fillRect(0,0,target.width,target.height);
  const frame=Math.floor(t*30+1e-5)%900;const layer=makeCanvas(tw,th);
  const label=(text:string,x:number,y:number)=>{ctx.fillStyle='#15131df0';ctx.fillRect(x,y+th-27,tw,27);ctx.fillStyle='#f8edff';ctx.font='12px monospace';ctx.fillText(text,x+10,y+th-9);};
  ctx.drawImage(video,0,0,tw,th);label(`1 ORIGINAL / f${frame}`,0,0);
  wake.paintMask(layer,frame);ctx.drawImage(layer,tw,0);label(`2 FISH MASK / ${wake.data.frames[frame]?.valid?'VALID':'SUPPRESSED'}`,tw,0);
  ctx.drawImage(video,tw*2,0,tw,th);wake.paintMask(layer,frame,true);ctx.globalAlpha=.52;ctx.drawImage(layer,tw*2,0);ctx.globalAlpha=1;label('3 MANUAL FIN CANDIDATES / relative flow',tw*2,0);
  ctx.drawImage(video,0,th,tw,th);wake.paintSpawns(layer,c,frame,variant);ctx.drawImage(layer,0,th);label(`4 ACTUAL NEW BIRTHS / ${variant==='A'?'A: historical, unbound':wake.births(c,variant)[frame]?.length+' this frame'}`,0,th);
  ctx.drawImage(base,tw,th,tw,th);
  if(variant==='A')historical(layer,c,t,video,motion);else wake.draw(layer,{...c,wakeSize:c.wakeSize*.5},t,variant);
  ctx.drawImage(layer,tw,th);label(`5 FINAL WAKE / ${variant}`,tw,th);
  ctx.fillStyle='#d5c5e2';ctx.font='16px monospace';const x=tw*2+22,y=th+45;
  const births=wake.births(c,variant)[frame]??[];
  const lines=[`DIGITAL WAKE 01.1 / ${variant}`,`SOURCE FRAME ${frame} / 900`,`BIRTHS ${births.length} / shared seed 41`,`BODY EMISSION ${c.bodyEmission.toFixed(2)}`,`C: manual fin regions + residual flow`,'No semantic fin prediction claimed',...births.slice(0,4).map(b=>`${b.id} px(${b.sx},${b.sy}) RGB(${b.rgb})`)];
  for(let i=0;i<lines.length;i++)ctx.fillText(lines[i]!,x,y+i*30);
}
