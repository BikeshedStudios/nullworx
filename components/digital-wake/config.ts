export type Mode = 'original' | 'ascii' | 'pointillism' | 'hybrid' | 'wake-debug';
export type Distribution = 'grid' | 'jitter';
export type Config = {
  schema: 1;
  emissionVariant: 'A' | 'B' | 'C' | 'S';
  finEmission: number; bodyEmission: number; showMask: boolean; showSpawns: boolean;
  mode: Mode;
  asciiSize: number; asciiBlend: number; asciiRamp: string;
  dotSize: number; dotDensity: number; dotStability: number; dotDistribution: Distribution;
  brightness: number; contrast: number; saturation: number;
  wakeEnabled: boolean; wakeRate: number; wakeLifetime: number; wakeVelocity: number;
  wakeTurbulence: number; wakeCurl: number; wakeSize: number; wakeOpacity: number;
  particleBudget: number; speed: number; loop: boolean; fit: 'contain' | 'cover';
  compare: boolean; compareSplit: number; debugOverlay: boolean;
};
export const DEFAULT: Config = {
  schema: 1, emissionVariant:'C', finEmission:2, bodyEmission:0, showMask:false, showSpawns:false, mode: 'hybrid', asciiSize: 7, asciiBlend: .67, asciiRamp: ' .,:;irXA#@',
  dotSize: 2.1, dotDensity: 1.3, dotStability: 1, dotDistribution: 'jitter',
  brightness: 1, contrast: 1, saturation: 1, wakeEnabled: true, wakeRate: 18,
  wakeLifetime: 1.6, wakeVelocity: 1.1, wakeTurbulence: .35, wakeCurl: .55,
  wakeSize: 1.1, wakeOpacity: .8, particleBudget: 900, speed: 1, loop: true, fit: 'contain',
  compare: false, compareSplit: .5, debugOverlay: false
};
export const PRESETS: Record<string, Config> = {
  'SUBTLE': {...DEFAULT,emissionVariant:'C',wakeRate:60,wakeLifetime:2.7,wakeSize:1.25,wakeVelocity:1.15,wakeOpacity:.82,wakeCurl:.45,particleBudget:1800,bodyEmission:0,finEmission:1.6},
  'EXPRESSIVE': {...DEFAULT,emissionVariant:'C',wakeRate:60,wakeLifetime:2.7,wakeSize:1.6,wakeVelocity:1.7,wakeOpacity:.9,wakeCurl:.65,particleBudget:1800,bodyEmission:0,finEmission:1.6},
  'Faithful ASCII': {...DEFAULT, mode:'ascii', asciiSize:5, asciiBlend:1, wakeEnabled:false},
  'Fine Pointillism': {...DEFAULT, mode:'pointillism', dotSize:1.4, dotDensity:1.8, wakeEnabled:false},
  'Aquatic Chemtrail': {...DEFAULT, mode:'hybrid', wakeEnabled:true, wakeRate:30, wakeLifetime:2.1, wakeCurl:.75},
  'Dense Digital Wake': {...DEFAULT, mode:'hybrid', wakeEnabled:true, wakeRate:60, wakeLifetime:2.7, particleBudget:1800},
  'Minimal Subtle Wake': {...DEFAULT, mode:'hybrid', wakeEnabled:true, wakeRate:9, wakeLifetime:1, wakeOpacity:.4}
};
export function validate(input: unknown): Config {
  if(!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Preset is not an object');
  const raw = input as Record<string, unknown>;
  if(raw.schema!==1) throw new Error('Unsupported preset schema');
  const out: Record<string, unknown> = {...DEFAULT};
  const numeric = Object.entries(DEFAULT).filter(([,v])=>typeof v==='number').map(([k])=>k);
  for(const k of numeric){
    const v=raw[k] ?? (['finEmission','bodyEmission'].includes(k)?DEFAULT[k as keyof Config]:undefined);
    if(typeof v!=='number' || !Number.isFinite(v)) throw new Error(`Invalid number: ${k}`);
    out[k] = v;
  }
  const bounds: Record<string,[number,number]>={
    asciiSize:[3,24],asciiBlend:[0,1],dotSize:[.35,8],dotDensity:[.4,3],dotStability:[0,1],
    brightness:[.4,2.3],contrast:[.5,2],saturation:[0,2.5],wakeRate:[0,100],wakeLifetime:[.2,5],
    wakeVelocity:[0,5],wakeTurbulence:[0,3],wakeCurl:[0,3],wakeSize:[.3,8],wakeOpacity:[0,1],
    finEmission:[0,3],bodyEmission:[0,1],particleBudget:[100,4000],speed:[.25,2],compareSplit:[.1,.9]
  };
  for(const [k,[lo,hi]] of Object.entries(bounds)) if((out[k] as number)<lo || (out[k] as number)>hi) throw new Error(`Out of range: ${k}`);
  for(const k of ['wakeEnabled','compare','debugOverlay','loop'] as const){if(typeof raw[k]!=='boolean') throw new Error(`Invalid boolean: ${k}`);out[k]=raw[k];}
  for(const k of ['showMask','showSpawns'] as const){const v=raw[k]??DEFAULT[k];if(typeof v!=='boolean')throw new Error(`Invalid boolean: ${k}`);out[k]=v;}
  const variant=raw.emissionVariant??'C';if(!['A','B','C','S'].includes(String(variant)))throw new Error('Bad emission variant');out.emissionVariant=variant;
  if(!['original','ascii','pointillism','hybrid','wake-debug'].includes(String(raw.mode))) throw new Error('Bad mode');
  if(!['grid','jitter'].includes(String(raw.dotDistribution))) throw new Error('Bad dot distribution');
  if(!['contain','cover'].includes(String(raw.fit))) throw new Error('Bad fit');
  if(typeof raw.asciiRamp!=='string'||raw.asciiRamp.length<2||raw.asciiRamp.length>32) throw new Error('Bad ASCII ramp');
  for(const k of ['mode','dotDistribution','fit','asciiRamp'] as const) out[k]=raw[k];
  return out as Config;
}
export const asJson=(x:Config)=>JSON.stringify(x,null,2)+'\n';
export function stableHash(a:number,b:number,c:number): number {
  let x=(Math.imul(a|0, 0x9e3779b1)^Math.imul(b|0,0x85ebca6b)^Math.imul(c|0,0xc2b2ae35))|0;
  x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
  return (x>>>0)/4294967296;
}
