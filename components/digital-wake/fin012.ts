import {stableHash,type Config} from './config';
import {FishWake,contains,SOURCE_SHA,type FishData,type Birth,type Particle,type Variant} from './fish';
export type FinSite=[number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number];
export type FinRegion={id:number;name:string;rle:number[];reviewed:boolean;valid:boolean;angle:number;noise:number;speed:number;referenceSpeed:number;referenceSites:number;support:number};
export type FinFrame={i:number;valid:boolean;regions:FinRegion[];p:FinSite[]};
export type FinMotion={schema:1;sourceSha256:string;fishDataSha256:string;regionSha256:string;fps:number;duration:number;frameCount:number;width:number;height:number;emitters:{id:number;name:string;start:number;end:number}[];shuffle:Record<string,Record<string,number>>;frames:FinFrame[];confidenceMeaning:string};
export type FinBirth=Birth&{controlPriority?:number;sourceTime?:number;emitterId?:string;motionFrame?:number;edgeArcBin?:number;finSpeed?:number;noiseFloor?:number;valid?:boolean;supportFrames?:number;flowErrorPx?:number;edgeErrorPx?:number;localVelocity?:[number,number];spawnDirection?:[number,number]};
export type FinParticle=Particle&{birth:FinBirth;trailX?:number;trailY?:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function parseFinMotion(input:unknown,fish:FishData):FinMotion{
 if(!input||typeof input!=='object')throw new Error('Missing fin motion');const d=input as FinMotion;
 if(d.schema!==1||d.sourceSha256!==SOURCE_SHA||d.fps!==30||d.duration!==30||d.frameCount!==900||d.width!==640||d.height!==360||!Array.isArray(d.frames)||d.frames.length!==900)throw new Error('Fin source/timing mismatch');
 for(let i=0;i<900;i++){
  const f=d.frames[i]!;if(f.i!==i||typeof f.valid!=='boolean'||!Array.isArray(f.regions)||!Array.isArray(f.p))throw new Error(`Invalid fin frame ${i}`);
  for(const r of f.regions){if(!Number.isInteger(r.id)||!d.emitters.some(e=>e.id===r.id)||![r.angle,r.speed,r.referenceSpeed,r.noise,r.support].every(Number.isFinite)||r.speed<0||r.referenceSpeed<0||typeof r.valid!=='boolean'||typeof r.reviewed!=='boolean'||!Array.isArray(r.rle))throw new Error(`Invalid region ${i}`);let end=0;if(r.rle.length%2)throw new Error('Invalid fin mask');for(let k=0;k<r.rle.length;k+=2){const a=r.rle[k]!,n=r.rle[k+1]!;if(!Number.isInteger(a)||!Number.isInteger(n)||a<end||n<=0||a+n>640*360)throw new Error('Invalid fin run');end=a+n;}}
  for(const p of f.p){const r=f.regions.find(r=>r.id===p[15]);if(p.length!==18||!p.every(Number.isFinite)||!r||!contains(fish.frames[i]!.rle,p[0],p[1],640,360)||!contains(r.rle,p[0],p[1],640,360)||p[14]<3||p[14]>5||!Number.isInteger(p[14])||p[11]>1.15||p[12]>2.8||p[17]<0)throw new Error(`Unsupported fin site ${i}`);const old=fish.frames[i]!.p.find(q=>q[0]===p[0]&&q[1]===p[1]);if(!old||old.slice(2,5).some((v,j)=>v!==p[2+j]))throw new Error(`Fin RGB provenance differs ${i}`);}
 }
 for(const em of d.emitters){const map=d.shuffle[String(em.id)];if(!map)throw new Error('Missing shuffle');const values=[];for(let f=em.start;f<=em.end;f++){const donor=map[String(f)];if(!Number.isInteger(donor)||donor<em.start||donor>em.end)throw new Error('Invalid timing control');values.push(donor);}if(new Set(values).size!==values.length)throw new Error('Shuffle must be a permutation');}
 return d;
}
export class FinWake{
 readonly data:FishData;readonly motion:FinMotion;readonly legacy:FishWake;
 private cache=new Map<string,FinBirth[][]>();
 constructor(data:FishData,motion:FinMotion){this.data=data;this.motion=motion;this.legacy=new FishWake(data);}
 private motionFor(frame:FinFrame,r:FinRegion,p:FinSite,variant:Variant):{speed:number;vx:number;vy:number;donor:number}|null{
  if(variant!=='S')return {speed:r.speed,vx:p[9],vy:p[10],donor:frame.i};
  const donor=this.motion.shuffle[String(r.id)]?.[String(frame.i)];if(donor===undefined)return null;
  const df=this.motion.frames[donor]!,dr=df.regions.find(q=>q.id===r.id);if(!dr?.valid)return null;
  const sites=df.p.filter(q=>q[15]===r.id);const q=sites.sort((a,b)=>Math.abs(a[16]-p[16])-Math.abs(b[16]-p[16]))[0];if(!q)return null;
  // Copy donor motion in body coordinates; keep today's fish geometry, RGB and validity.
  const angle=r.angle-dr.angle,co=Math.cos(angle),si=Math.sin(angle);
  return {speed:dr.speed,vx:q[9]*co-q[10]*si,vy:q[9]*si+q[10]*co,donor};
 }
 births(c:Config,variant:Variant=c.emissionVariant):FinBirth[][]{
  if(variant==='A')return this.data.frames.map(()=>[]);
  if(variant==='B')return this.legacy.births(c,'C'); // Exact pre-sprint current behavior, not the older contour arm.
  const key=[variant,c.wakeRate,c.finEmission,c.wakeVelocity,c.wakeLifetime,c.particleBudget].join(':');const cached=this.cache.get(key);if(cached)return cached;
  const result=this.motion.frames.map(f=>{
   if(!f.valid||!this.data.frames[f.i]!.valid||c.finEmission<=0)return [];
   const options=f.p.flatMap(p=>{const r=f.regions.find(r=>r.id===p[15]);if(!r?.valid||!r.reviewed||!contains(r.rle,p[0],p[1],640,360)||!contains(this.data.frames[f.i]!.rle,p[0],p[1],640,360))return [];
    const m=this.motionFor(f,r,p,variant);if(!m)return [];const local=Math.max(0,Math.hypot(m.vx,m.vy)-p[17]);if(local<.5||m.speed<.5)return [];
    const weight=(.15+Math.min(3,local/18))*(p[14]/5);return [{p,r,m,weight}];});
   if(!options.length)return [];
   // Robust per-fin mean energy replaces the historical max-weight saturation.
   const regions=new Map<number,number>();for(const o of options)regions.set(o.r.id,o.m.speed);
   const speed=Array.from(regions.values()).reduce((a,b)=>a+b,0)/regions.size;
   const strength=clamp(c.finEmission*speed/(speed+22),0,1);
   const rate=Math.min(c.wakeRate*4/30,c.particleBudget/(c.wakeLifetime*30));const attempts=Math.floor(rate)+(stableHash(f.i,0,41)<rate%1?1:0);const total=options.reduce((a,o)=>a+o.weight,0);const out:FinBirth[]=[];
   for(let slot=0;slot<attempts;slot++){
    const gate=stableHash(f.i,slot,47);if(variant!=='S'&&gate>strength)continue;
    let q=stableHash(f.i,slot,41)*total;let selected=options[options.length-1]!;for(const o of options){q-=o.weight;if(q<0){selected=o;break;}}
    const {p,r,m}=selected;const nx=p[5],ny=p[6];const speedLocal=Math.hypot(m.vx,m.vy);const detach=Math.min(13,speedLocal*.18)*c.wakeVelocity;
    const launchX=p[7]*.42+(m.vx*.9*c.wakeVelocity+nx*detach),launchY=p[8]*.42+(m.vy*.9*c.wakeVelocity+ny*detach);const vx=clamp(launchX/640,-.22,.22),vy=clamp(launchY/360,-.3,.3),norm=Math.max(1e-8,Math.hypot(vx*640,vy*360));
    out.push({controlPriority:variant==='S'?gate/Math.max(1e-8,strength):undefined,id:`${variant}-${f.i}-${slot}`,frame:f.i,sourceTime:f.i/30,slot,x:p[0],y:p[1],sx:Math.floor((p[0]+.5)*3),sy:Math.floor((p[1]+.5)*3),rgb:[p[2],p[3],p[4]],nx,ny,vx,vy,bodyVx:p[7]/640,bodyVy:p[8]/360,relativeVx:m.vx/640,relativeVy:m.vy/360,confidence:p[14]/5,region:'fin-candidate',track:r.id,seed:stableHash(f.i,slot,97),emitterId:r.name,motionFrame:m.donor,edgeArcBin:p[16],finSpeed:m.speed,noiseFloor:p[17],valid:true,supportFrames:p[14],flowErrorPx:p[11],edgeErrorPx:p[12],localVelocity:[m.vx,m.vy],spawnDirection:[vx*640/norm,vy*360/norm]});
   }
   return out;
  });
  if(variant==='S'){
   // Equal realized birth count makes timing comparison independent of total particle intensity.
   const target=this.births(c,'C').reduce((a,f)=>a+f.length,0);const ranked=result.flat().sort((a,b)=>a.controlPriority!-b.controlPriority!);const selected=new Set(ranked.slice(0,target).map(b=>b.id));for(let i=0;i<result.length;i++)result[i]=result[i]!.filter(b=>selected.has(b.id));
  }
  if(this.cache.size>10)this.cache.clear();this.cache.set(key,result);return result;
 }
 particles(t:number,c:Config,variant:Variant=c.emissionVariant):FinParticle[]{
  if(!Number.isFinite(t)||(!c.wakeEnabled&&c.mode!=='wake-debug'))return [];
  if(variant==='B')return this.legacy.particles(t,c,'C');if(variant==='A')return [];
  const all=this.births(c,variant),cycle=Math.floor(t/30);t=Math.round((t-cycle*30)*1e9)/1e9;const out:FinParticle[]=[];
  for(let f=Math.ceil((t-c.wakeLifetime)*30-1e-7);f<=Math.floor(t*30+1e-5);f++){
   const idx=((f%900)+900)%900;for(const b of all[idx]!){const raw=t-f/30;if(raw<-.00001||raw>c.wakeLifetime+1e-8)continue;const age=clamp(raw,0,c.wakeLifetime);const damp=(1-Math.exp(-1.25*age))/1.25;
    const canonicalEmitter=b.track===1?3:b.track;const phase=b.x*.028+b.y*.019+b.frame/900*Math.PI*6+canonicalEmitter*1.7;const curl=c.wakeCurl*.0016*(Math.sin(phase+age*1.9)-Math.sin(phase));const arc=(b.edgeArcBin??0)>>1;const angle=stableHash(arc,canonicalEmitter,97)*Math.PI*2;const diffusion=c.wakeTurbulence*.0007*Math.pow(age,1.35);const adv=.08*age;
    const x=(b.x+.5)/640+b.vx*damp+b.bodyVx*adv+curl+Math.cos(angle)*diffusion,y=(b.y+.5)/360+b.vy*damp+b.bodyVy*adv+curl*.55+Math.sin(angle)*diffusion;
    const fadeIn=clamp(age/.065,0,1);const alpha=Math.pow(Math.max(0,1-age/c.wakeLifetime),1.35)*c.wakeOpacity*fadeIn*fadeIn*(3-2*fadeIn);
    out.push({birth:b,x,y,age,alpha,radius:Math.max(.3,c.wakeSize*(.65+stableHash(b.frame,b.slot,99)*.8)),cycle:Math.floor(f/900)+cycle,trailX:b.vx*Math.exp(-1.25*age),trailY:b.vy*Math.exp(-1.25*age)});
   }
  }return out.slice(-Math.floor(c.particleBudget));
 }
 draw(canvas:HTMLCanvasElement,c:Config,t:number,variant:Variant=c.emissionVariant){
  if(variant==='B')return this.legacy.draw(canvas,c,t,'C');const ctx=canvas.getContext('2d');if(!ctx)return 0;ctx.clearRect(0,0,canvas.width,canvas.height);const particles=this.particles(t,c,variant);const scale=canvas.width/1280;
  for(const p of particles){if(p.alpha<.004)continue;ctx.globalAlpha=p.alpha;ctx.fillStyle=`rgb(${p.birth.rgb.join(' ')})`;const x=p.x*canvas.width,y=p.y*canvas.height,dx=(p.trailX??0)*canvas.width,dy=(p.trailY??0)*canvas.height,n=Math.max(.001,Math.hypot(dx,dy)),len=clamp(n*.016,0,3.2)*scale,r=p.radius*scale;
   // A single filled shape retains the round point and adds a delicate velocity-aligned tail.
   ctx.beginPath();if(len<.3)ctx.arc(x,y,r,0,Math.PI*2);else ctx.ellipse(x-dx/n*len*.5,y-dy/n*len*.5,r+len*.5,r,Math.atan2(dy,dx),0,Math.PI*2);ctx.fill();
  }ctx.globalAlpha=1;return particles.length;
 }
 paintMask(canvas:HTMLCanvasElement,frame:number,fin=false){
  if(!fin)return this.legacy.paintMask(canvas,frame);const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);const f=this.motion.frames[((frame%900)+900)%900]!;
  for(const r of f.regions){ctx.fillStyle=r.valid?'#7bdfaf':'#dc6d86';for(let k=0;k<r.rle.length;k+=2){let start=r.rle[k]!,n=r.rle[k+1]!;while(n>0){const y=Math.floor(start/640),x=start%640,len=Math.min(n,640-x);ctx.fillRect(x*canvas.width/640,y*canvas.height/360,len*canvas.width/640,canvas.height/360);start+=len;n-=len;}}}
 }
 paintSpawns(canvas:HTMLCanvasElement,c:Config,frame:number,variant:Variant=c.emissionVariant){
  if(variant==='B')return this.legacy.paintSpawns(canvas,c,frame,'C');const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);const f=((frame%900)+900)%900;
  for(const b of this.births(c,variant)[f]!){const x=(b.x+.5)/640*canvas.width,y=(b.y+.5)/360*canvas.height;ctx.strokeStyle='#ffec9e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.stroke();ctx.strokeStyle='#d995ee';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+b.relativeVx*canvas.width*.22,y+b.relativeVy*canvas.height*.22);ctx.stroke();ctx.fillStyle='#fff';ctx.font='10px monospace';ctx.fillText(`f${f}/${b.slot} E${b.track}`,x+7,y-6);}
 }
}
