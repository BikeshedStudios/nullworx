import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const out = process.env.DROPS_EVIDENCE ?? "evidence/drops-runtime";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const checks = [];
const keys = ["NULLWORX_DROPS_ENABLED", "BREVO_API_KEY", "BREVO_LIST_ID", "BREVO_DOI_TEMPLATE_ID", "DROPS_PRIVACY_CONTACT_EMAIL"];
try {
  for (const enabled of [false, true]) {
    const port = enabled ? 4344 : 4343;
    const env = { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" };
    for (const key of keys) delete env[key];
    if (enabled) Object.assign(env, { NULLWORX_DROPS_ENABLED: "1", BREVO_API_KEY: "fixture-only",
      BREVO_LIST_ID: "1", BREVO_DOI_TEMPLATE_ID: "1", DROPS_PRIVACY_CONTACT_EMAIL: "privacy@example.invalid" });
    const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { env, stdio: "ignore" });
    const base = `http://127.0.0.1:${port}`;
    try {
      for (let n=0;n<80;n++) {
        if (await fetch(base+"/api/drops/status").then(r=>r.ok).catch(()=>false)) break;
        if(n===79) throw new Error("Runtime server did not start");
        await new Promise(r=>setTimeout(r,100));
      }
      const response=await fetch(base+"/api/drops/status");
      const capability=await response.json();
      if (capability.enabled !== enabled || Object.keys(capability).join() !== "enabled" || response.headers.get("cache-control")!=="no-store") throw new Error("Incorrect capability/cache boundary");
      const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
      const page=await context.newPage();
      const { expect }=await import("@playwright/test");
      const errors=[];page.on("pageerror",e=>errors.push(e.message));
      await page.goto(base+"/drops");
      await expect(page.getByRole("textbox",{name:"Email address"})).toHaveCount(enabled?1:0);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
      await page.goto(base+"/privacy");
      await expect(page.locator('a[href="mailto:privacy@example.invalid"]')).toHaveCount(enabled?1:0);
      await page.goto(base);
      await expect(page.getByRole("link",{name:"Get free Drops",exact:false})).toHaveCount(enabled?1:0);
      await page.getByLabel("Open navigation",{exact:true}).click();
      await expect(page.getByRole("navigation",{name:"Mobile navigation"}).locator('a[href="/drops"]')).toHaveCount(enabled?1:0);
      await expect(page.locator('footer a[href="/drops"]')).toHaveCount(enabled?1:0);
      await page.screenshot({path:`${out}/${enabled?"configured-fixture":"disabled"}-390.png`});
      const status=await page.request.post(base+"/api/drops/subscribe",{headers:{origin:"https://nullworx.space"},data:{email:"invalid",source:"drops"}});
      if(status.status()!==(enabled?400:503)) throw new Error(`Validation/disabled collection failed: enabled=${enabled}, status=${status.status()}, body=${await status.text()}`);
      if(enabled) {
        const forbidden=await page.request.post(base+"/api/drops/subscribe",{headers:{origin:"https://attacker.invalid"},data:{email:"invalid",source:"drops"}});
        if(forbidden.status()!==403) throw new Error("Cross-origin request accepted");
      }
      if(errors.length) throw new Error(errors.join(";"));
      checks.push({enabled,capability,noStore:true,form:enabled,privacyContact:enabled,navigation:enabled,invalidOrDisabledStatus:status.status(),errors,
        providerRequests:0,realDoiVerified:false});
      await context.close();
    } finally { server.kill("SIGTERM"); await new Promise(r=>server.once("exit",r)); }
  }
  writeFileSync(out+"/runtime-proof.json",JSON.stringify({passed:true,sameCleanBuild:true,credentials:"synthetic fixture only",realDoiVerified:false,checks},null,2));
  console.log("PASS: same clean build reflects runtime configuration; form, privacy and navigation agree. No real Brevo send or DOI proof.");
} finally { await browser.close(); }
