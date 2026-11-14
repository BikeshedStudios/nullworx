// Browser/runtime/performance evidence. Screenshots are never taken during FPS samples.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { chromium, webkit, expect } from '@playwright/test';
const base=process.env.FRONTIER_BASE_URL || 'http://127.0.0.1:3381';
const output=process.env.FRONTIER_VERIFY_RECEIPTS;
assert.ok(output,'Set FRONTIER_VERIFY_RECEIPTS to a new evidence directory');await mkdir(output,{recursive:true});
const suites=(process.env.FRONTIER_SUITES || (process.env.DISPLAY?'hardware,phone,webkit,software':'software,phone,webkit')).split(',');
const result={base,at:new Date().toISOString(),cases:[],skips:[],failures:[],limitations:['Phone cases emulate a viewport and touch on the host GPU; no physical phone claim.','NVIDIA utilization/memory is system-wide and may include other applications.','CPU submission time is not GPU completion time.','WebKit reports a privacy-masked Apple GPU string on Linux; this is not Apple hardware validation.']};
const p95=values=>values.length?[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*.95)]:null;
function gpuSample(){try{return execFileSync('nvidia-smi',['--query-gpu=name,memory.used,utilization.gpu','--format=csv,noheader,nounits'],{encoding:'utf8',timeout:3000}).trim();}catch{return null;}}
function trackContexts(){
 const native=HTMLCanvasElement.prototype.getContext,seen=new WeakSet();
 window.__frontierMotionChanges=0;matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",()=>window.__frontierMotionChanges++);
 window.__frontierGpu={created:0,released:0,live:0,peak:0};
 HTMLCanvasElement.prototype.getContext=function(...args){
  const gl=native.apply(this,args);
  if(gl&&/webgl/.test(args[0])&&!seen.has(gl)){
   seen.add(gl);const metrics=window.__frontierGpu;metrics.created++;metrics.live++;metrics.peak=Math.max(metrics.peak,metrics.live);let live=true;
   const release=()=>{if(live){live=false;metrics.live--;metrics.released++;}};
   this.addEventListener('webglcontextlost',release);
   const extension=gl.getExtension('WEBGL_lose_context');
   if(extension){const lose=extension.loseContext.bind(extension);extension.loseContext=()=>{release();lose();};}
  }
  return gl;
 };
}
const image=async surface=>createHash('sha256').update(await surface.locator('canvas').evaluate(canvas=>canvas.toDataURL())).digest('hex');
async function waitReady(surface){await surface.scrollIntoViewIfNeeded();await expect(surface).toHaveAttribute('data-status','ready',{timeout:15000});await expect(surface).toHaveAttribute('data-mode','full');}
async function setMotion(page,value){
 const before=await page.evaluate(()=>({changes:window.__frontierMotionChanges,matches:matchMedia('(prefers-reduced-motion: reduce)').matches}));
 if(before.matches===(value==='reduce'))return;
 await page.emulateMedia({reducedMotion:value});
 await expect.poll(()=>page.evaluate(()=>window.__frontierMotionChanges)).toBeGreaterThan(before.changes);
}
async function inspect(browser,suite){
 const mobile=suite==='phone'||suite==='webkit';
 const native=suite==='hardware';
 const context=native?browser.contexts()[0]:await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
 await context.addInitScript(trackContexts);const page=await context.newPage();
 if(native){await page.setViewportSize({width:1440,height:1000});await setMotion(page,'reduce');await page.bringToFront();}
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const session=suite!=='webkit'?await context.newCDPSession(page):null;
 for(const [slug,prefix,controls] of [['refractive-type','A',['Dispersion','Deformation']],['impossible-material','C',['Tension','Iridescence']]]){
  await page.goto(base+'/effects/'+slug);await page.getByRole('button',{name:'Activate full WebGL effect',exact:true}).click();
  const surface=page.locator('[data-frontier]'),host=surface.locator('[role="img"]');
  async function resetLook(){
   const before=Number(await host.getAttribute('data-frames'));
   await page.getByRole('button',{name:'Reset',exact:true}).click();await surface.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
   await expect(host).toHaveAttribute('data-running','false');
   await expect.poll(async()=>Number(await host.getAttribute('data-frames'))).toBeGreaterThan(before);
   await expect.poll(()=>host.evaluate(el=>el.frontier.time)).toBe(2.4);
  }
  for(const variant of [0,1]){
   if(variant)await page.getByRole('button',{name:new RegExp(`^${prefix}2 /`)}).click();await waitReady(surface);
   await resetLook();
   // Capture a presented still before comparing resets; the native compositor
   // may present the first submitted draw after React's pending resize effects.
   await surface.locator('canvas').screenshot({path:output+'/'+suite+'-'+prefix+(variant+1)+'-initial.png'});
   const initial=await image(surface);
   const renderer=await surface.locator('canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl2'),extension=gl?.getExtension('WEBGL_debug_renderer_info');return extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):'unavailable';});
   if(suite==='hardware')assert.ok(!/swiftshader|llvmpipe|software|unavailable/i.test(renderer),`Hardware suite is not hardware: ${renderer}`);
   for(const label of controls){
    const before=await image(surface),slider=page.getByRole('slider',{name:label,exact:true});await slider.focus();await slider.press('End');await surface.scrollIntoViewIfNeeded();await expect.poll(()=>image(surface)).not.toBe(before);
   }
   await host.focus();const beforeKey=await image(surface);await host.press('ArrowRight');await expect.poll(()=>image(surface)).not.toBe(beforeKey);
   if(mobile){const beforeTouch=await image(surface);const box=await host.boundingBox();await page.touchscreen.tap(box.x+box.width*.68,box.y+box.height*.35);await expect.poll(()=>image(surface)).not.toBe(beforeTouch);}
   await resetLook();await expect.poll(()=>image(surface)).toBe(initial);
   const pixels=await surface.locator('canvas').evaluate(c=>({width:c.width,height:c.height}));assert.ok(pixels.width*pixels.height<=(prefix==='A'?360000:variant?420000:320000)*1.01);
   await page.screenshot({path:output+'/'+suite+'-'+prefix+(variant+1)+'.png'});
   await page.getByRole('button',{name:'Play',exact:true}).click();await surface.scrollIntoViewIfNeeded();await expect(host).toHaveAttribute('data-running','true');
   if(native){await page.bringToFront();await expect.poll(()=>page.evaluate(()=>document.visibilityState)).toBe('visible');}
   await page.waitForTimeout(1000);
   const started=await host.evaluate(el=>{el.frontier.intervals.length=0;el.frontier.cpuMs.length=0;return {now:performance.now(),frames:el.frontier.frames,startupMs:el.frontier.startupMs};});
   const sampleMs=suite==='hardware'?30000:suite==='phone'?5000:suite==='software'?3000:1000;
   const heapBefore=session?await session.send('Runtime.getHeapUsage'):null,gpuBefore=gpuSample();
   const rect=await host.boundingBox();
   for(let elapsed=0;elapsed<sampleMs;elapsed+=1000){
    if(native){await page.bringToFront();assert.equal(await page.evaluate(()=>document.visibilityState),'visible','Invalid benchmark: native tab was hidden');}
    await page.mouse.move(rect.x+rect.width*(.35+.3*((elapsed/1000)%2)),rect.y+rect.height*.45);
    await page.waitForTimeout(1000);
    if(native){assert.equal(await page.evaluate(()=>document.visibilityState),'visible','Invalid benchmark: native tab was hidden');assert.equal(await host.getAttribute('data-running'),'true','Invalid benchmark: canvas was paused or offscreen');assert.equal(await surface.getAttribute('data-mode'),'full','Invalid benchmark: full renderer fell back');}
   }
   const measured=await host.evaluate(el=>({now:performance.now(),...el.frontier}));
   const heapAfter=session?await session.send('Runtime.getHeapUsage'):null;
   const fps=(measured.frames-started.frames)*1000/(measured.now-started.now);
   if(suite==='hardware')assert.ok(fps>=55,`${prefix}${variant+1} sustained hardware FPS ${fps.toFixed(1)}`);
   // Actual background-tab behavior on headed Chromium; simulated document
   // visibility is covered by the normal unit/browser suite, not called hardware proof.
   let hiddenTab='not exercised by this browser profile';
   if(suite==='hardware'){
    const cover=await context.newPage();await cover.goto('about:blank');await cover.bringToFront();
    await expect.poll(()=>page.evaluate(()=>document.visibilityState)).toBe('hidden');
    await page.waitForTimeout(150);const held=await host.getAttribute('data-frames');await page.waitForTimeout(250);assert.equal(await host.getAttribute('data-frames'),held);
    await cover.close();await page.bringToFront();await expect(host).toHaveAttribute('data-running','true');hiddenTab='PASS: real hidden document and stable frame counter';
   }
   // Live media preference change must stop a prior explicit Play.
   await setMotion(page,'no-preference');await setMotion(page,'reduce');
   await expect(host).toHaveAttribute('data-running','false');
   const still=await host.getAttribute('data-frames');await page.waitForTimeout(180);assert.equal(await host.getAttribute('data-frames'),still);
   // Offscreen pause uses the real intersection observer.
   await setMotion(page,'no-preference');await page.getByRole('button',{name:'Play',exact:true}).click();await surface.scrollIntoViewIfNeeded();
   await page.locator('#effect-notes').evaluate(el=>el.scrollIntoView({block:'start'}));await expect(host).toHaveAttribute('data-running','false');
   const offscreen=await host.getAttribute('data-frames');await page.waitForTimeout(180);assert.equal(await host.getAttribute('data-frames'),offscreen);
   await surface.scrollIntoViewIfNeeded();await expect(host).toHaveAttribute('data-running','true');
   await setMotion(page,'reduce');
   const contexts=await page.evaluate(()=>window.__frontierGpu);assert.equal(contexts.live,1);assert.equal(contexts.peak,1);
   const record={suite,variant:prefix+(variant+1),renderer,startupMs:started.startupMs,compileMs:measured.compileMs,fps,sampleMs:measured.now-started.now,frameP95:p95(measured.intervals),cpuP95:p95(measured.cpuMs),pixels,memory:measured.memory,heapBefore,heapAfter,gpuBefore,gpuAfter:gpuSample(),contexts,hiddenTab,controls:'PASS',reset:'PASS exact pixels',keyboard:'PASS',touch:mobile?'PASS native touchscreen':'not requested',motion:'PASS initial + live change',offscreen:'PASS',errors:[...errors]};
   result.cases.push(record);await writeFile(output+'/verification.json',JSON.stringify(result,null,2));console.log(`${suite} ${record.variant}: ${fps.toFixed(1)} FPS / startup ${started.startupMs.toFixed(0)}ms / ${renderer}`);
  }
  // Repeated switching must release the former context, then loss must fall back.
  for(const variant of [0,1,0]){await page.getByRole('button',{name:new RegExp(`^${prefix}${variant+1} /`)}).click();await waitReady(surface);}
  assert.equal(await page.evaluate(()=>window.__frontierGpu.live),1);
  await surface.locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(surface.getByRole('alert')).toContainText('context lost');await expect(surface).toHaveAttribute('data-mode','light');
  await expect(surface.locator('canvas')).toBeVisible();assert.equal(await page.evaluate(()=>window.__frontierGpu.live),0);
 }
 assert.deepEqual(errors,[]);if(!native)await context.close();
}
for(const suite of suites){
 let browser, nativeProcess, nativeProfile;
 try{
  if(suite==='webkit'){
   const lib=process.env.FRONTIER_WEBKIT_LIBRARY_PATH;
   try{browser=await webkit.launch({headless:true,...(lib?{env:{...process.env,LD_PRELOAD:lib+'/libmanette-0.2.so.0'}}:{})});}
   catch(error){result.skips.push({suite,reason:String(error.message)});continue;}
  }else if(suite==='hardware'){
   // CDP noDefaults avoids Playwright's focus/visibility emulation on the native context.
   nativeProfile=await mkdtemp(join(tmpdir(),'nullworx-frontier-native-'));
   nativeProcess=spawn(chromium.executablePath(),['--remote-debugging-port=0','--user-data-dir='+nativeProfile,'--no-first-run','--no-default-browser-check','--no-sandbox','about:blank'],{stdio:'ignore',detached:true});
   let port;
   for(let n=0;n<100;n++){try{port=(await readFile(join(nativeProfile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{}await new Promise(resolve=>setTimeout(resolve,50));}
   assert.ok(port,'Native Chromium did not start');
   browser=await chromium.connectOverCDP('http://127.0.0.1:'+port,{noDefaults:true});
  }else browser=await chromium.launch({headless:true,args:suite==='software'?['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']:[]});
  await inspect(browser,suite);
 }catch(error){result.failures.push({suite,error:String(error.stack||error).slice(0,5000)});console.error(suite+': FAIL '+error.message);}
 finally{await browser?.close();if(nativeProcess){if(nativeProcess.exitCode===null&&nativeProcess.signalCode===null){nativeProcess.kill('SIGTERM');}await new Promise(resolve=>setTimeout(resolve,250));if(nativeProcess.exitCode===null&&nativeProcess.signalCode===null){nativeProcess.kill('SIGKILL');}await rm(nativeProfile,{recursive:true,force:true});}await writeFile(output+'/verification.json',JSON.stringify(result,null,2));}
}
assert.deepEqual(result.failures,[],'Browser/performance failures; see verification.json');

console.log(`PASS: ${result.cases.length} variant/browser cases; ${result.skips.length} skips; no failures.`);
