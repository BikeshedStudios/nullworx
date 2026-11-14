// Fresh installations from the public playground's ACTUAL clipboard output.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const output=process.env.FRONTIER_CONSUMER_RECEIPTS || await mkdtemp(join(tmpdir(),'nullworx-frontier-consumers-'));
await mkdir(output,{recursive:true});
const base=process.env.FRONTIER_BASE_URL || 'http://127.0.0.1:3381';
const result={base,output,node:process.version,sourceHashes:{},consumers:[],errors:[]};
const children=[];let browser;
const hash=s=>createHash('sha256').update(s).digest('hex');
let installationHash='';
async function put(file,data){await mkdir(dirname(file),{recursive:true});await writeFile(file,data);}
async function run(cwd,name,args){
 const child=spawn('pnpm',args,{cwd,env:{...process.env,CI:'1',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
 let log=`pnpm ${args.join(' ')}\n`;child.stdout.on('data',s=>log+=s);child.stderr.on('data',s=>log+=s);
 const code=await new Promise((ok,fail)=>{child.once('error',fail);child.once('close',ok);});
 await writeFile(join(output,name+'.log'),log);assert.equal(code,0,log.slice(-5000));console.log(name+': PASS');
}
async function start(cwd,kind,port){
 await new Promise((ok,fail)=>{const probe=createServer();probe.once('error',fail);probe.listen(port,'127.0.0.1',()=>probe.close(ok));});
 const cli=kind==='next'?['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)]:['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(port)];
 const child=spawn(process.execPath,cli,{cwd,detached:true,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});children.push(child);
 let log='';child.stdout.on('data',s=>log+=s);child.stderr.on('data',s=>log+=s);child.once('close',()=>writeFile(join(output,kind+'-server.log'),log));
 const url=`http://127.0.0.1:${port}`;
 for(let i=0;i<100;i++){if(child.exitCode!==null)throw Error(log);if(await fetch(url).then(r=>r.ok).catch(()=>false))return url;await new Promise(r=>setTimeout(r,200));}
 throw Error('Consumer did not start');
}
try{
 browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 const payload=await fetch(base+'/api/effects/visual-frontier/source').then(r=>{assert.equal(r.status,200);return r.json();});
 const copied={},examples={};
 for(const [slug,prefix] of [['refractive-type','A'],['impossible-material','C']]){
  await page.goto(base+'/effects/'+slug);
  await page.getByRole('button',{name:'Load complete source & copy files',exact:true}).click();
  await expect(page.getByRole('button',{name:/^Copy example/})).toBeVisible();
  if(prefix==='A')for(const file of Object.keys(payload.sources)){
   await page.getByRole('tab',{name:file,exact:true}).click();await page.getByRole('button',{name:/^Copy file/}).click();
   copied[file]=await page.evaluate(()=>navigator.clipboard.readText());
   assert.equal(copied[file],payload.sources[file]);assert.equal(copied[file],await readFile(join(root,'components/visual-frontier',file),'utf8'));
   result.sourceHashes[file]=hash(copied[file]);
  }
  for(const variant of [0,1]){
   if(variant)await page.getByRole('button',{name:new RegExp(`^${prefix}2 /`)}).click();
   await page.getByRole('tab',{name:'Usage',exact:true}).click();await page.getByRole('button',{name:/^Copy example/}).click();
   examples[prefix+(variant+1)]=await page.evaluate(()=>navigator.clipboard.readText());
   assert.match(examples[prefix+(variant+1)],/mode="full"/);
  }
 }
 installationHash=hash(JSON.stringify(copied));
 await writeFile(join(output,'clipboard.json'),JSON.stringify({sources:copied,examples},null,2));await context.close();
 for(const [index,kind] of ['vite','next'].entries()){
  const cwd=join(output,kind);await cp(join(root,'tests/distribution/fixtures',kind),cwd,{recursive:true});
  for(const file of await readdir(cwd))if(file.endsWith('.template')){const name=file.slice(0,-9);await put(join(cwd,kind==='next'&&['layout.tsx','page.tsx'].includes(name)?'app':'',name),await readFile(join(cwd,file)));}
  const pkg=JSON.parse(await readFile(join(cwd,'package.json'),'utf8'));pkg.dependencies={...pkg.dependencies,three:'0.187.0','three-text':'0.6.5'};pkg.devDependencies['@types/three']='0.187.0';await put(join(cwd,'package.json'),JSON.stringify(pkg,null,2));
  const config=JSON.parse(await readFile(join(cwd,'tsconfig.json'),'utf8'));config.compilerOptions.resolveJsonModule=true;await put(join(cwd,'tsconfig.json'),JSON.stringify(config,null,2));
  for(const [file,source]of Object.entries(copied))await put(join(cwd,'components/visual-frontier',file),source);
  for(const [name,source]of Object.entries(examples))await put(join(cwd,name+'.tsx'),source);
  await put(join(cwd,'Demo.tsx'),`"use client";\nimport {useState} from 'react';\n${Object.keys(examples).map(n=>`import {MyInterface as ${n}} from './${n}';`).join('\n')}\nconst studies={A1,A2,C1,C2};\nexport function Demo(){const [name,setName]=useState<keyof typeof studies>('A1');const Study=studies[name];return <main data-frontier-installation="${installationHash}"><h1>Consumer installation</h1><nav>${Object.keys(examples).map(n=>`<button onClick={()=>setName('${n}')} aria-pressed={name==='${n}'}>${n}</button>`).join('')}</nav><Study key={name}/></main>;}`);
  await put(join(cwd,kind==='next'?'app/globals.css':'globals.css'),'body{margin:0;padding:20px;background:#f4f0e8;color:#16131d;font-family:sans-serif}*{box-sizing:border-box}button{min-height:44px;padding:10px;margin:5px}main{max-width:1440px;margin:auto}');
  await run(cwd,kind+'-install',['install','--no-frozen-lockfile']);await run(cwd,kind+'-typecheck',['typecheck']);await run(cwd,kind+'-build',['build']);
  const url=await start(cwd,kind,Number(process.env.FRONTIER_CONSUMER_PORT||3504)+index),ctx=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),p=await ctx.newPage();
  const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto(url);await expect(p.locator('main')).toHaveAttribute('data-frontier-installation',installationHash);const cases=[];
  for(const width of [1280,390]){
   await p.setViewportSize({width,height:900});
   for(const name of ['A1','A2','C1','C2']){
    await p.getByRole('button',{name,exact:true}).click();const surface=p.locator('[data-frontier]');await surface.scrollIntoViewIfNeeded();
    await expect(surface).toHaveAttribute('data-status','ready',{timeout:15000});await expect(surface).toHaveAttribute('data-mode','full');await expect(surface.locator('canvas')).toHaveCount(1);
    const host=surface.locator('[role="img"]');await expect(host).toHaveAttribute('data-running','false');
    const before=await surface.locator('canvas').evaluate(c=>c.toDataURL());await host.focus();await host.press('ArrowRight');
    await expect.poll(()=>surface.locator('canvas').evaluate(c=>c.toDataURL())).not.toBe(before);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));cases.push({name,width,render:'PASS',keyboard:'PASS',reducedMotion:'PASS'});
   }
  }
  assert.deepEqual(errors,[]);await p.screenshot({path:join(output,kind+'-390.png')});result.consumers.push({kind,url,cases,errors,sourceHashes:result.sourceHashes});await ctx.close();
  console.log(kind+' four full variants / desktop + phone: PASS');
 }
}catch(error){result.failure=String(error.stack||error);throw error;}
finally{await browser?.close();for(const child of children){if(child.exitCode===null&&child.signalCode===null){child.kill('SIGTERM');await Promise.race([new Promise(ok=>child.once('exit',ok)),new Promise(ok=>setTimeout(ok,1000))]);if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');}}await writeFile(join(output,'results.json'),JSON.stringify({...result,installationHash},null,2));}
