// Drives headless Chrome (CDP) through the REAL running app and saves screenshots for the demo video.
// usage: node capture.mjs <outDir> [baseUrl]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const OUT = process.argv[2], BASE = process.argv[3] || "http://localhost:3200", PORT = 9333;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "kamai-chrome-"));
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });

async function ready() { for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://localhost:${PORT}/json/list`); const l = await r.json(); const p = l.find(t => t.type === "page"); if (p) return p.webSocketDebuggerUrl; } catch { /* starting */ } await sleep(500); } throw new Error("Chrome did not start"); }

const ws = new WebSocket(await ready());
await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } };
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });

const ev = async js => { const r = await send("Runtime.evaluate", { expression: js, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval failed"); return r.result.value; };
const view = (w, h, mobile = false) => send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
const go = async (url) => { await send("Page.navigate", { url: BASE + url }); await sleep(1800); };
const waitText = async (txt, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(`document.body.innerText.includes(${JSON.stringify(txt)})`)) return; await sleep(300); } throw new Error("timeout waiting for: " + txt); };
const shot = async name => { const r = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(OUT, name + ".png"), Buffer.from(r.data, "base64")); console.log("  shot", name); };
const clickText = (sel, txt) => ev(`(() => { const e = [...document.querySelectorAll(${JSON.stringify(sel)})].find(x => x.textContent.includes(${JSON.stringify(txt)})); if (!e) throw new Error('no ${txt}'); e.click(); return true; })()`);
const typeInto = async (sel, text) => { await ev(`document.querySelector(${JSON.stringify(sel)}).focus()`); await send("Input.insertText", { text }); await sleep(300); };
const loginDemo = async role => { await send("Network.clearBrowserCookies"); await go("/join"); await ev(`fetch('/api/auth/demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({role:${JSON.stringify(role)}})}).then(r=>r.status)`); };
const setLang = l => ev(`localStorage.setItem('kamai.lang', ${JSON.stringify(l)})`);

try {
  await send("Network.enable"); await send("Page.enable");

  // ---------- home + sign-up (English then Hindi) ----------
  await view(1280, 720); await go("/"); await waitText("kamai"); await sleep(800); await shot("home");
  await view(390, 844, true); await go("/join"); await setLang("en"); await go("/join"); await waitText("Create your account"); await shot("join-en");
  await setLang("hi"); await go("/join"); await waitText("अपना खाता बनाइए"); await shot("join-hi");

  // ---------- vendor app (Hindi) ----------
  await loginDemo("vendor"); await setLang("hi"); await go("/vendor"); await waitText("नमस्ते"); await sleep(600); await shot("v1-today");
  await typeInto("input[type=text]", "आज 1800 की बिक्री हुई और 1100 का माल लिया"); await shot("v2-typed");
  await clickText("button", "सहेजें"); await waitText("1,800"); await sleep(900); await ev("window.scrollTo(0, 560)"); await sleep(500); await shot("v3-saved"); await ev("window.scrollTo(0, 0)");
  await clickText(".tabs button", "स्कोर"); await sleep(1500); await shot("v4-score");
  await ev(`document.querySelector('.page svg[aria-label]')?.scrollIntoView({block:'center'})`); await sleep(500); await shot("v4b-chart");
  await clickText(".tabs button", "लोन"); await sleep(1000); await ev("window.scrollTo(0,0)"); await shot("v5-loan");
  await clickText("button", "एक टैप में आवेदन करें"); await sleep(1500); await ev("window.scrollTo(0, document.body.scrollHeight)"); await sleep(400); await shot("v6-applied");
  await ev("window.scrollTo(0,0)"); await clickText(".tabs button", "बारिश बीमा"); await sleep(1000); await shot("v7-rain");
  await clickText("button", "सभी दावे दर्ज करें"); await sleep(1500); await ev("document.querySelector('.pkg')?.scrollIntoView({block:'center'})"); await sleep(500); await shot("v8-claims");

  // ---------- lender (English, desktop) ----------
  await view(1280, 720); await loginDemo("lender"); await setLang("en"); await go("/lender"); await waitText("Lender dashboard"); await waitText("Savitri Devi"); await sleep(800);
  await clickText("tbody tr", "Savitri Devi"); await sleep(700); await shot("l1-savitri");
  await clickText("tbody tr", "Raju Sahani"); await sleep(700); await shot("l2-raju");
  await clickText("tbody tr", "Imran Ali"); await sleep(700); await shot("l3-imran");

  // ---------- insurer ----------
  await loginDemo("insurer"); await go("/insurer"); await waitText("Insurer console"); await waitText("Claims queue"); await sleep(900); await shot("i1-claims");

  // ---------- problem page ----------
  await go("/problem"); await waitText("The problem"); await sleep(600); await shot("p1-problem");
  await ev(`document.documentElement.style.scrollBehavior='auto'; const h=[...document.querySelectorAll('h2')].find(x=>x.textContent.includes('value looks')); window.scrollTo(0,h.getBoundingClientRect().top+scrollY-70)`); await sleep(600); await shot("p2-value");
  console.log("capture done");
} finally { ws.close(); chrome.kill(); setTimeout(() => process.exit(), 300); }
