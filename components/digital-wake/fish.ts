import { stableHash, type Config } from './config';

/** Pixel x/y, RGB, normal, body velocity, relative fin velocity, flow confidence,
 * manual fin candidate, track id, curvature weight. Velocities: normalized / sec. */
export type SourceSample = [number,number,number,number,number,number,number,number,number,number,number,number,number,number,number];
export type FishFrame = {i:number;valid:boolean;rle:number[];finRle:number[];p:SourceSample[]};
export type FishData = {schema:2;sourceSha256:string;annotationSha256:string;fps:number;duration:number;frameCount:number;width:number;height:number;sourceWidth:number;sourceHeight:number;method:string;limitation:string;frames:FishFrame[]};
export type Variant = Config['emissionVariant'];
export type Birth = {id:string;frame:number;slot:number;x:number;y:number;sx:number;sy:number;rgb:[number,number,number];nx:number;ny:number;vx:number;vy:number;bodyVx:number;bodyVy:number;relativeVx:number;relativeVy:number;confidence:number;region:'fin-candidate'|'body-contour';track:number;seed:number};
export type Particle = {birth:Birth;x:number;y:number;age:number;alpha:number;radius:number;cycle:number};
export const SOURCE_SHA='807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238';
export function contains(rle:number[],x:number,y:number,w:number,h:number):boolean {
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=w||y>=h)return false;
  const pixel=y*w+x;let lo=0,hi=rle.length/2-1;
  while(lo<=hi){const m=(lo+hi)>>1,start=rle[m*2]!,length=rle[m*2+1]!;if(pixel<start)hi=m-1;else if(pixel>=start+length)lo=m+1;else return true;}
  return false;
}
export function parseFish(raw:unknown):FishData {
  if(!raw||typeof raw!=='object')throw new Error('Missing fish data');
  const d=raw as FishData;
  if(d.schema!==2||d.sourceSha256!==SOURCE_SHA||d.width!==640||d.height!==360||d.fps!==30||d.duration!==30||d.frameCount!==900||!Array.isArray(d.frames)||d.frames.length!==900)throw new Error('Fish data/source/timing mismatch; emission suppressed');
  for(let i=0;i<d.frames.length;i++){
    const f=d.frames[i]!;
    if(f.i!==i||typeof f.valid!=='boolean'||!Array.isArray(f.p))throw new Error(`Invalid mask frame ${i}`);
    for(const r of [f.rle,f.finRle]){
      if(!Array.isArray(r)||r.length%2)throw new Error(`Invalid mask RLE ${i}`);
      let end=0;
      for(let j=0;j<r.length;j+=2){const x=r[j]!,n=r[j+1]!;if(!Number.isInteger(x)||!Number.isInteger(n)||x<end||n<=0||x+n>d.width*d.height)throw new Error(`Invalid mask run ${i}`);end=x+n;}
    }
    for(const p of f.p){
      if(!Array.isArray(p)||p.length!==15||!p.every(Number.isFinite)||!contains(f.rle,p[0],p[1],d.width,d.height)||p.slice(2,5).some(c=>!Number.isInteger(c)||c<0||c>255)||p[11]<0||p[11]>1||![0,1].includes(p[12]))throw new Error(`Invalid source sample ${i}`);
      if(p[12]&&!contains(f.finRle,p[0],p[1],d.width,d.height))throw new Error(`Invalid fin sample ${i}`);
    }
  }
  return d;
}
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
export class FishWake {
  readonly data:FishData;
  private cache=new Map<string,Birth[][]>();
  constructor(data:FishData){this.data=data;}
  births(c:Config,variant:Variant=c.emissionVariant):Birth[][] {
    if(variant==='A')return this.data.frames.map(()=>[]); // Historical implementation lives in engine.ts.
    const key=[variant,c.wakeRate,c.finEmission,c.bodyEmission,c.wakeVelocity,c.wakeLifetime,c.particleBudget].join(':');
    const cached=this.cache.get(key);if(cached)return cached;
    const d=this.data;
    const all=d.frames.map(f=>{
      if(!f.valid||!f.rle.length)return [];
      const weights=f.p.map(p=>{
        if(!contains(f.rle,p[0],p[1],d.width,d.height))return 0;
        if(variant==='B')return 1;
        if(p[12]&&p[11]>.35){
          const speed=Math.hypot(p[9],p[10]);
          // Body translation alone cannot drive C. Residual below 1.2 px/s is suppressed.
          return speed>.002?c.finEmission*p[11]*clamp(speed/.035,0,2)*p[14]:0;
        }
        return !p[12]?c.bodyEmission*clamp(Math.hypot(p[7],p[8])/.04,0,1):0;
      });
      const total=weights.reduce((a,b)=>a+b,0);if(total<=0)return [];
      // Four streams preserve the legacy maximum of four anchors, with one shared budget.
      const perFrame=Math.min(c.wakeRate*4/d.fps,c.particleBudget/(c.wakeLifetime*d.fps));
      const attempts=Math.floor(perFrame)+(stableHash(f.i,0,41)<perFrame%1?1:0);
      const out:Birth[]=[];
      for(let slot=0;slot<attempts;slot++){
        // Fin motion controls amount as well as distribution. Never exceed the common budget.
        const strength=variant==='B'?1:clamp(Math.max(...weights),0,1);
        if(stableHash(f.i,slot,47)>strength)continue;
        let q=stableHash(f.i,slot,41)*total,idx=weights.length-1;
        for(let j=0;j<weights.length;j++){q-=weights[j]!;if(q<0){idx=j;break;}}
        const p=f.p[idx]!;
        if(!contains(f.rle,p[0],p[1],d.width,d.height))continue;
        if(variant==='C'&&p[12]&&!contains(f.finRle,p[0],p[1],d.width,d.height))continue;
        const relx=variant==='C'?p[9]:0,rely=variant==='C'?p[10]:0;
        const vx=clamp(p[7]*.55+(relx*.9+p[5]*.014)*c.wakeVelocity,-.22,.22);
        const vy=clamp(p[8]*.55+(rely*.9+p[6]*.014*d.width/d.height)*c.wakeVelocity,-.3,.3);
        out.push({id:`${variant}-${f.i}-${slot}`,frame:f.i,slot,x:p[0],y:p[1],sx:Math.min(d.sourceWidth-1,Math.floor((p[0]+.5)*d.sourceWidth/d.width)),sy:Math.min(d.sourceHeight-1,Math.floor((p[1]+.5)*d.sourceHeight/d.height)),rgb:[p[2],p[3],p[4]],nx:p[5],ny:p[6],vx,vy,bodyVx:p[7],bodyVy:p[8],relativeVx:p[9],relativeVy:p[10],confidence:p[11],region:p[12]?'fin-candidate':'body-contour',track:p[13],seed:stableHash(f.i,slot,97)});
      }
      return out;
    });
    if(this.cache.size>=12)this.cache.clear();this.cache.set(key,all);return all;
  }
  particles(t:number,c:Config,variant:Variant=c.emissionVariant):Particle[]{
    if(!Number.isFinite(t)||!c.wakeEnabled&&c.mode!=='wake-debug')return [];
    const d=this.data,frames=this.births(c,variant),out:Particle[]=[];
    const absoluteCycle=Math.floor(t/d.duration);
    t=Math.round((t-absoluteCycle*d.duration)*1e9)/1e9;
    const end=Math.floor(t*d.fps+1e-5),start=Math.ceil((t-c.wakeLifetime)*d.fps-1e-7);
    // Finite periodic history includes births from the previous loop at t=0.
    for(let f=start;f<=end;f++){
      const index=((f%d.frameCount)+d.frameCount)%d.frameCount;
      for(const birth of frames[index]!){
        const rawAge=t-f/d.fps;if(rawAge<-.00001||rawAge>c.wakeLifetime+1e-8)continue;const age=clamp(rawAge,0,c.wakeLifetime);
        const damping=(1-Math.exp(-.8*age))/.8;
        const phase=birth.seed*Math.PI*2;
        const curl=c.wakeCurl*.0014*(Math.sin(age*2.1+phase)-Math.sin(phase));
        const spread=c.wakeTurbulence*.00085*Math.pow(age,1.5);
        const diffusionX=Math.cos(phase)*spread,diffusionY=Math.sin(phase)*spread;
        // Smooth coherent advection is tied to source body motion, with bounded curl.
        const advection=.12*age;
        const x=(birth.x+.5)/d.width+birth.vx*damping+birth.bodyVx*advection+curl+diffusionX;
        const y=(birth.y+.5)/d.height+birth.vy*damping+birth.bodyVy*advection+curl*.6+diffusionY;
        const alpha=Math.pow(Math.max(0,1-age/c.wakeLifetime),1.5)*c.wakeOpacity*smooth(age/.055);
        out.push({birth,x,y,age,alpha,radius:Math.max(.3,c.wakeSize*(.65+stableHash(birth.frame,birth.slot,99)*.8)),cycle:Math.floor(f/d.frameCount)+absoluteCycle});
      }
    }
    // The global cap is enforced after chronological history creation; discard oldest first.
    return out.slice(-Math.floor(c.particleBudget));
  }
  draw(canvas:HTMLCanvasElement,c:Config,t:number,variant:Variant=c.emissionVariant):number {
    const ctx=canvas.getContext('2d');if(!ctx)return 0;ctx.clearRect(0,0,canvas.width,canvas.height);
    const particles=this.particles(t,c,variant);
    for(const p of particles){if(p.alpha<=.004)continue;
      ctx.globalAlpha=p.alpha;ctx.fillStyle=`rgb(${p.birth.rgb.join(' ')})`;
      ctx.beginPath();ctx.arc(p.x*canvas.width,p.y*canvas.height,p.radius,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;return particles.length;
  }
  paintMask(canvas:HTMLCanvasElement,frame:number,fin=false){
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const d=this.data,f=d.frames[((frame%d.frameCount)+d.frameCount)%d.frameCount]!;
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=fin?'#e5e45b':'#29d8bc';
    if(!f.valid)return;
    const runs=fin?f.finRle:f.rle;
    const sx=canvas.width/d.width,sy=canvas.height/d.height;
    for(let i=0;i<runs.length;i+=2){let start=runs[i]!,remaining=runs[i+1]!;while(remaining>0){const y=Math.floor(start/d.width),x=start%d.width,n=Math.min(remaining,d.width-x);ctx.fillRect(x*sx,y*sy,n*sx,sy);start+=n;remaining-=n;}}
  }
  paintSpawns(canvas:HTMLCanvasElement,c:Config,frame:number,variant:Variant=c.emissionVariant){
    const ctx=canvas.getContext('2d');if(!ctx)return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const births=this.births(c,variant)[((frame%900)+900)%900]??[];
    ctx.strokeStyle='#ffff83';ctx.fillStyle='#fff';ctx.lineWidth=1.2;
    for(const p of births){const x=(p.x+.5)/this.data.width*canvas.width,y=(p.y+.5)/this.data.height*canvas.height;
      ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-7,y);ctx.lineTo(x+7,y);ctx.moveTo(x,y-7);ctx.lineTo(x,y+7);ctx.stroke();
      ctx.strokeStyle='#72bfff';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+p.bodyVx*canvas.width*.18,y+p.bodyVy*canvas.height*.18);ctx.stroke();
      ctx.strokeStyle='#ff7cdb';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+p.relativeVx*canvas.width*.22,y+p.relativeVy*canvas.height*.22);ctx.stroke();ctx.strokeStyle='#ffff83';
      ctx.font='10px monospace';ctx.fillText(`f${p.frame}/${p.slot}`,x+8,y-8);
    }
  }
}
