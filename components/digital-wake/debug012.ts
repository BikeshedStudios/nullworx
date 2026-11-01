import {makeCanvas,historical} from './debug';
import {FinWake,type FinBirth} from './fin012';
import type {Config} from './config';
import type {Variant} from './fish';
import type {MotionSidecar} from './engine';
export {makeCanvas,historical};
export function debugPanels(target:HTMLCanvasElement,video:HTMLVideoElement,base:HTMLCanvasElement,wake:FinWake,c:Config,t:number,variant:Variant,motion:MotionSidecar|null){
 const tw=640,th=360;if(target.width!==1920||target.height!==720){target.width=1920;target.height=720;}const ctx=target.getContext('2d')!;ctx.fillStyle='#0b0910';ctx.fillRect(0,0,1920,720);const frame=Math.min(899,Math.floor(t*30+1e-4)),f=wake.motion.frames[frame]!,layer=makeCanvas(tw,th);
 const label=(text:string,x:number,y:number)=>{ctx.fillStyle='#15121eea';ctx.fillRect(x,y+th-27,tw,27);ctx.fillStyle='#eee5f4';ctx.font='12px monospace';ctx.fillText(text,x+9,y+th-9);};
 ctx.drawImage(video,0,0,tw,th);label(`1 SOURCE / frame ${frame}`,0,0);
 wake.paintMask(layer,frame);ctx.drawImage(layer,tw,0);label('2 ORIGINAL FISH MASK / unchanged',tw,0);
 ctx.drawImage(video,tw*2,0,tw,th);wake.paintMask(layer,frame,true);ctx.globalAlpha=.5;ctx.drawImage(layer,tw*2,0);ctx.globalAlpha=1;
 for(const p of f.p){ctx.strokeStyle='#f6a0db';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tw*2+p[0],p[1]);ctx.lineTo(tw*2+p[0]+p[9]*.22,p[1]+p[10]*.22);ctx.stroke();}
 label('3 CAUDAL FIN ROIs / vectors / red = invalid',tw*2,0);
 ctx.drawImage(video,0,th,tw,th);wake.paintSpawns(layer,c,frame,variant);ctx.drawImage(layer,0,th);const births=wake.births(c,variant)[frame]??[];label(`4 ACTUAL ${variant} SPAWNS / ${births.length} / source frame ${frame}`,0,th);
 ctx.drawImage(base,tw,th,tw,th);if(variant==='A')historical(layer,c,t,video,motion);else wake.draw(layer,c,t,variant);ctx.drawImage(layer,tw,th);label(`5 FINAL WAKE / ${variant} / common budget ${c.particleBudget}`,tw,th);
 ctx.fillStyle='#dacde4';ctx.font='14px monospace';const lines=[`01.2 ${variant} / ${(frame/30).toFixed(2)}s`,...f.regions.map(r=>`E${r.id} ${r.speed.toFixed(1)}px/s / ${r.valid?'VALID':'SUPPRESSED'} / n${r.support}`),'Support = observed frames / 5, not probability',...births.slice(0,3).map((b:FinBirth)=>`E${b.track} ${b.supportFrames??'old'}/5 FB ${b.flowErrorPx?.toFixed(2)??'old'} px / donor ${b.motionFrame??b.frame}`),variant==='S'?'SHUFFLED TIMING CONTROL / same current geometry':'C uses source-aligned fin motion'];
 lines.forEach((s,i)=>ctx.fillText(s,tw*2+15,th+30+i*24));
 // Speed timeline uses held-out silhouette references, independent of selected births.
 const x0=tw*2+18,y0=th+th-55;ctx.strokeStyle='#72d4b6';ctx.beginPath();
 for(let i=0;i<900;i+=3){const fr=wake.motion.frames[i]!,v=fr.regions.filter(r=>r.valid).reduce((a,r)=>a+r.speed,0);const x=x0+i/900*(tw-40),y=y0-Math.min(100,v);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();const mx=x0+frame/900*(tw-40);ctx.moveTo(mx,y0-108);ctx.lineTo(mx,y0+5);ctx.stroke();label('6 FIN SPEED / SUPPORT / ACTUAL ERROR MEASUREMENTS',tw*2,th);
}
