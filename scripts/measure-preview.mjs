import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3350';
const output=process.env.PREVIEW_EVIDENCE||'evidence/consolidation-preview';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||undefined,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/');await page.waitForFunction(()=>document.querySelector('[data-ascii-field]')?.getAttribute('data-phase')==='live');
 await page.screenshot({path:output+'/homepage.png',fullPage:true});
 await page.goto(base+'/effects/digital-wake');await page.waitForFunction(()=>!!window.__wake);await page.evaluate(()=>window.__wake.ready());
 await page.getByRole('button',{name:'PLAY ▶',exact:true}).waitFor({state:'visible'});
 const receipts=[];
 for(const preset of ['SUBTLE','EXPRESSIVE']){
  await page.getByRole('button',{name:preset,exact:true}).click();
  await page.evaluate(()=>document.querySelector('video').play());await page.waitForTimeout(1000);
  const before=await page.evaluate(()=>({time:performance.now(),metrics:window.__wake.metrics()}));
  await page.waitForTimeout(6000);
  const after=await page.evaluate(()=>({time:performance.now(),metrics:window.__wake.metrics()}));
  const timings=after.metrics.work.slice(before.metrics.work.length),callbacks=after.metrics.callbackTimes.slice(before.metrics.callbackTimes.length),intervals=callbacks.slice(1).map((t,i)=>t-callbacks[i]);
  const stats=a=>{const sorted=a.toSorted((a,b)=>a-b);return {n:a.length,p50:sorted[Math.floor(a.length*.5)]??null,p95:sorted[Math.floor(a.length*.95)]??null,p99:sorted[Math.floor(a.length*.99)]??null};};
  const elapsed=after.time-before.time,frames=after.metrics.rendered-before.metrics.rendered;
  const receipt={preset,elapsedMs:elapsed,draws:frames,drawFps:1000*frames/elapsed,frameWorkMs:stats(timings),presentedIntervalMs:stats(intervals),videoTime:after.metrics.mediaTime,sourceVerified:after.metrics.sourceVerified};
  receipts.push(receipt);console.log(JSON.stringify(receipt));
  await page.screenshot({path:output+'/'+preset.toLowerCase()+'.png',fullPage:true});
 }
 const gl=await page.evaluate(()=>{const c=document.querySelector('.render-canvas'),g=c.getContext('webgl2'),e=g.getExtension('WEBGL_debug_renderer_info');return {version:g.getParameter(g.VERSION),renderer:e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)};});
 await page.evaluate(()=>{document.querySelector('video').pause();window.__wake.setConfig({showMask:true,showSpawns:true,debugOverlay:true});});
 await page.evaluate(()=>window.__wake.frameAt(225,'C','debug'));
 await page.screenshot({path:output+'/debug.png',fullPage:true});
 const seam=await page.evaluate(()=>{const api=window.__wake;return {before:api.particles(29.99).map(p=>({id:p.birth.id,x:p.x,y:p.y,age:p.age})),after:api.particles(30.01).map(p=>({id:p.birth.id,x:p.x,y:p.y,age:p.age}))};});
 const loopBefore=await page.evaluate(()=>window.__wake.metrics().loopCount);
 await page.evaluate(()=>{window.__wake.setConfig({debugOverlay:false,showMask:false,showSpawns:false});document.querySelector('video').currentTime=29;return document.querySelector('video').play();});
 await page.waitForFunction(previous=>window.__wake.metrics().loopCount>previous,loopBefore);
 const loop=await page.evaluate(()=>window.__wake.metrics());
 await writeFile(output+'/measurements.json',JSON.stringify({base,browser:browser.version(),viewport:{width:1440,height:1080},gl,receipts,loop:{count:loop.loopCount,media:loop.media},seam,errors,note:'Local browser with explicitly forced SwiftShader; no physical GPU claim. Screenshots/receipts remain local.'},null,2)+'\n');
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();}
