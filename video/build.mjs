// Builds the Kamai demo video: narration (macOS `say`) + slides/screens rendered by Chrome + captions burned
// into frames + ffmpeg assembly.  usage: WORK=<scratch dir with shots/> node build.mjs [outDir] [sceneIds...]
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scenes } from "./scenes.mjs";
import { ART } from "./art.mjs";
import { COLS, ROWS, COMPARE_NOTE, FEATURES } from "../lib/compare.ts";
import { fileURLToPath } from "node:url";

const WORK = process.env.WORK, OUT = process.argv[2] || path.resolve(".");
const ONLY = process.argv.slice(3);
const SHOTS = `${WORK}/shots`, FR = `${WORK}/slides`, AU = `${WORK}/audio`, CL = `${WORK}/clips`;
for (const d of [FR, AU, CL]) fs.mkdirSync(d, { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", PORT = 9334;
const HERE = path.dirname(fileURLToPath(import.meta.url));
// Real photos win over illustrations: drop video/photos/<sceneId>.jpg (s01..s04, s20) and rebuild.
const findPhoto = id => ["jpg", "jpeg", "png", "webp"].map(e => path.join(HERE, "photos", `${id}.${e}`)).find(p => fs.existsSync(p));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sh = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: "utf8" }); if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr?.slice(-400)}`); return r.stdout; };
const dur = f => parseFloat(sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]));

// ───────────────────────────── layouts (1280x720 HTML) ─────────────────────────────
const CSS = `*{box-sizing:border-box}body{margin:0;width:1280px;height:720px;overflow:hidden;position:relative;font-family:"Helvetica Neue",Helvetica,Arial,"Noto Sans Devanagari","Devanagari Sangam MN",sans-serif;color:#1d1a14}
.sub{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);width:max-content;max-width:1120px;background:rgba(10,10,12,.8);color:#fff;font-size:28px;line-height:1.3;padding:10px 24px;border-radius:12px;text-align:center}
.sub small{display:block;font-size:21px;opacity:.85;margin-top:3px}
.card{background:#fdf5e0;border:3px solid #1d1a14;border-bottom-width:9px;border-radius:24px}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.serif{font-family:"Iowan Old Style","Palatino Linotype",Georgia,"Noto Serif Devanagari",serif}`;
const shotUrl = n => `file://${SHOTS}/${n}.png`;
const page = (bg, body, extra = "") => `<!doctype html><meta charset="utf-8"><style>${CSS}body{background:${bg}}${extra}</style><body>${body}`;

const L = {
  dark: s => page("radial-gradient(ellipse at 50% 42%,#1c1c24 0,#09090c 72%)", `
    ${s.note ? `<div style="position:absolute;top:24px;left:30px;font-size:17px;color:#8a8476">${esc(s.note)}</div>` : ""}
    <div class="center" style="${s.chart ? "justify-content:flex-start;padding-top:78px" : ""}">
      <div class="serif" style="font-size:${s.big.length > 22 ? 64 : 80}px;font-weight:600;line-height:1.12;color:#f4efe6;letter-spacing:-.01em;max-width:1100px">${esc(s.big)}</div>
      <div style="font-size:28px;color:#b8b1a2;margin-top:22px;max-width:1000px">${esc(s.small)}</div>
      ${s.chart ? `<div style="width:976px;height:264px;overflow:hidden;position:relative;margin-top:30px;border-radius:14px;background:#fcf3dc;border:3px solid #3a362e"><img src="${shotUrl("v4b-chart")}" style="position:absolute;width:1248px;left:-136px;top:-1544px"></div>
      <div style="font-size:17px;color:#8a8476;margin-top:10px">Blue bars: real daily rainfall · Orange bars: days her sales collapsed</div>` : ""}
    </div>`),
  story: s => { const ph = findPhoto(s.id), bg = ph ? `<img src="file://${ph}" style="position:absolute;inset:0;width:1280px;height:720px;object-fit:cover">` : ART[s.art]();
    return page("#09090c", `<div style="position:absolute;inset:0">${bg}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,6,10,.9) 0,rgba(6,6,10,.74) 36%,rgba(6,6,10,0) 64%)"></div>
    ${s.note ? `<div style="position:absolute;top:24px;left:30px;font-size:17px;color:#d9d2c2;text-shadow:0 1px 3px #000">${esc(s.note)}</div>` : ""}
    <div style="position:absolute;left:70px;top:0;bottom:96px;width:560px;display:flex;flex-direction:column;justify-content:center">
      <div class="serif" style="font-size:${s.big.length > 16 ? 62 : 84}px;font-weight:600;line-height:1.1;color:#f7f2e8;letter-spacing:-.01em;text-shadow:0 2px 12px rgba(0,0,0,.5)">${esc(s.big)}</div>
      <div style="font-size:27px;color:#d6cfbf;margin-top:20px;line-height:1.35;text-shadow:0 1px 6px rgba(0,0,0,.6)">${esc(s.small)}</div>
      ${s.chart ? `<div style="width:560px;height:152px;overflow:hidden;position:relative;margin-top:26px;border-radius:12px;background:#fcf3dc;border:3px solid #1d1a14"><img src="${shotUrl("v4b-chart")}" style="position:absolute;width:718px;left:-78px;top:-888px"></div>
      <div style="font-size:16px;color:#d6cfbf;margin-top:8px">Real daily rainfall (blue) · days her sales collapsed (orange)</div>` : ""}
    </div>`); },
  features: s => page("#f6f1e7", `
    <div style="position:absolute;top:28px;width:100%;text-align:center;font-size:50px;font-weight:900;letter-spacing:-.04em">${esc(s.big)}</div>
    <div style="position:absolute;top:108px;left:58px;right:58px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">${FEATURES.map(([e, t, d]) => `<div class="card" style="padding:20px 24px;height:224px"><div style="font-size:42px;line-height:1">${e}</div><div style="font-size:28px;font-weight:900;letter-spacing:-.025em;line-height:1.1;margin-top:8px">${esc(t)}</div><div style="font-size:19px;line-height:1.3;margin-top:8px;color:#4a4331">${esc(d)}</div></div>`).join("")}</div>`),
  matrix: s => { const mark = (m, k) => m === "y" ? `<span style="color:#1f7a3c;font-size:32px;font-weight:900">✓</span>` : m === "p" ? `<span style="color:#b8650a;font-size:28px;font-weight:900">◐</span>` : `<span style="color:#b9ae94;font-size:26px">✕</span>`;
    return page("#f7c948", `
    <div style="position:absolute;top:16px;width:100%;text-align:center;font-size:38px;font-weight:900;letter-spacing:-.035em">${esc(s.big)}</div>
    <table style="position:absolute;left:46px;top:70px;width:1188px;border-collapse:separate;border-spacing:0">
      <tr><td style="width:420px"></td>${COLS.map((c, i) => `<td style="text-align:center;font-size:19px;font-weight:900;padding:8px 4px;line-height:1.1;${i === COLS.length - 1 ? "background:#f093e6;border:3px solid #1d1a14;border-bottom:0;border-radius:14px 14px 0 0;font-size:24px" : ""}">${esc(c)}</td>`).join("")}</tr>
      ${ROWS.map(([label, vals], r) => `<tr><td style="font-size:20px;font-weight:700;padding:0 10px;height:49px;background:#fdf5e0;border-top:2px solid #e4d9b8;${r === 0 ? "border-radius:12px 0 0 0" : ""}">${esc(label)}</td>${vals.map((v, i) => `<td style="text-align:center;height:49px;background:${i === vals.length - 1 ? "#fff0fb" : "#fdf5e0"};border-top:2px solid #e4d9b8;${i === vals.length - 1 ? "border-left:3px solid #1d1a14;border-right:3px solid #1d1a14;" + (r === ROWS.length - 1 ? "border-bottom:3px solid #1d1a14;border-radius:0 0 14px 14px" : "") : ""}">${mark(v)}</td>`).join("")}</tr>`).join("")}
    </table>
    <div style="position:absolute;left:46px;right:46px;top:${70 + 56 + ROWS.length * 49 + 8}px;font-size:13.5px;line-height:1.35;color:#4a4331"><b>✓</b> yes · <b>◐</b> partly · <b>✕</b> not found. ${esc(COMPARE_NOTE)}</div>`); },
  stats: s => page("#f6f1e7", `
    <div style="position:absolute;top:84px;width:100%;text-align:center;font:800 18px system-ui;letter-spacing:4px;text-transform:uppercase;color:#b8650a">${esc(s.kicker)}</div>
    <div style="position:absolute;top:150px;left:60px;right:60px;display:flex;gap:26px">${s.cards.map(([b, d]) => `<div class="card" style="flex:1;padding:30px 26px;height:330px"><div style="font-size:66px;font-weight:900;letter-spacing:-.045em;line-height:1">${esc(b)}</div><div style="font-size:24px;line-height:1.35;margin-top:18px;color:#4a4331">${esc(d)}</div></div>`).join("")}</div>
    <div style="position:absolute;bottom:136px;left:70px;right:70px;text-align:center;font-size:15px;color:#6b6354;line-height:1.4">${esc(s.foot)}</div>`),
  gap: s => page("#f7c948", `
    <div style="position:absolute;top:70px;left:80px;right:80px"><div style="font-size:60px;font-weight:800;letter-spacing:-.035em;line-height:1.05">${esc(s.big)}</div><div style="font-size:72px;font-weight:900;letter-spacing:-.04em;margin-top:6px;color:#b3261e">${esc(s.big2)}</div></div>
    <div style="position:absolute;top:330px;left:80px;right:80px">${s.rows.map(([a, b]) => `<div style="display:flex;align-items:center;gap:20px;margin:14px 0;font-size:34px"><span style="font-size:40px;color:#b3261e">✕</span><span><b>${esc(a)}</b> ${esc(b)}</span></div>`).join("")}</div>`),
  solution: s => page("#f093e6", `
    <div style="position:absolute;top:80px;left:70px;right:70px;text-align:center;font-size:64px;font-weight:900;letter-spacing:-.04em;line-height:1.05;color:#fff;text-shadow:0 3px 0 #1d1a14">${esc(s.big)}</div>
    <div style="position:absolute;top:250px;left:70px;right:70px;display:flex;gap:26px">${s.cards.map(([e, t, d]) => `<div class="card" style="flex:1;padding:26px;height:280px;text-align:center"><div style="font-size:60px">${e}</div><div style="font-size:42px;font-weight:900;letter-spacing:-.03em;margin-top:6px">${esc(t)}</div><div style="font-size:23px;margin-top:10px;color:#4a4331;line-height:1.3">${esc(d)}</div></div>`).join("")}</div>`),
  phone: s => page("#f7c948", `
    <div style="position:absolute;left:150px;top:22px;width:272px;height:572px;border:5px solid #1d1a14;border-radius:40px;overflow:hidden;background:#fdf5e0;box-shadow:0 18px 40px rgba(0,0,0,.28)"><img src="${shotUrl(s.shot)}" style="width:100%;display:block"></div>
    <div style="position:absolute;left:520px;top:120px;right:70px"><div style="font-size:52px;font-weight:900;letter-spacing:-.035em;line-height:1.06">${esc(s.label)}</div>
    <div style="margin-top:28px">${(s.points || []).map(p => `<div style="display:flex;gap:16px;font-size:30px;margin:14px 0;line-height:1.25"><span style="color:#1f7a3c;font-weight:900">✓</span><span>${esc(p)}</span></div>`).join("")}</div></div>`),
  desktop: s => page("#f7c948", `
    <div style="position:absolute;left:190px;top:18px;background:#111;color:#fff;font-size:26px;font-weight:700;padding:7px 18px;border-radius:10px">${esc(s.label)}</div>
    <img src="${shotUrl(s.shot)}" style="position:absolute;left:190px;top:72px;width:900px;height:506px;border:4px solid #1d1a14;border-radius:16px;box-shadow:0 16px 36px rgba(0,0,0,.28)">`),
  real: s => page("#f6f1e7", `
    <div style="position:absolute;top:60px;left:60px;right:60px;display:flex;gap:30px">${[[s.left, "#1f7a3c", "✓"], [s.right, "#b3261e", "○"]].map(([[t, items], c, ic]) => `<div class="card" style="flex:1;padding:28px;height:480px"><div style="font-size:40px;font-weight:900;letter-spacing:-.03em;color:${c}">${esc(t)}</div>${items.map(i => `<div style="display:flex;gap:14px;font-size:25px;margin:16px 0;line-height:1.28"><span style="color:${c};font-weight:900">${ic}</span><span>${esc(i)}</span></div>`).join("")}</div>`).join("")}</div>`),
  roadmap: s => page("#f7c948", `
    <div style="position:absolute;top:70px;width:100%;text-align:center;font-size:62px;font-weight:900;letter-spacing:-.04em">${esc(s.big)}</div>
    <div style="position:absolute;top:210px;left:50px;right:50px;display:flex;gap:20px">${s.steps.map(([n, t, d]) => `<div class="card" style="flex:1;padding:24px;height:330px"><div style="width:54px;height:54px;border-radius:50%;background:#f093e6;border:3px solid #1d1a14;display:grid;place-items:center;font-size:28px;font-weight:900">${n}</div><div style="font-size:40px;font-weight:900;letter-spacing:-.03em;margin-top:14px">${esc(t)}</div><div style="font-size:22px;line-height:1.35;margin-top:10px;color:#4a4331">${esc(d)}</div></div>`).join("")}</div>`),
  closing: s => page("radial-gradient(ellipse at 50% 42%,#1c1c24 0,#09090c 72%)", `
    ${s.art ? `<div style="position:absolute;inset:0;opacity:.55">${(findPhoto(s.id) ? `<img src="file://${findPhoto(s.id)}" style="width:1280px;height:720px;object-fit:cover">` : ART[s.art]())}</div><div style="position:absolute;inset:0;background:rgba(6,6,10,.62)"></div>` : ""}
    <div class="center"><div style="position:relative"><div style="position:absolute;left:6px;top:-62px;font-size:70px;font-weight:700;color:#f093e6">${esc(s.dev)}</div><div style="font-size:210px;font-weight:900;letter-spacing:-.075em;color:#fff;line-height:.9">${esc(s.big)}</div></div>
    <div class="serif" style="font-size:40px;color:#e9e2d4;margin-top:34px">${esc(s.small)}</div></div>`),
};
const subHtml = c => `<div class="sub">${esc(c.text)}${c.text2 ? `<small>${esc(c.text2)}</small>` : ""}</div>`;

// ───────────────────────────── Chrome renderer (CDP) ─────────────────────────────
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "kamai-render-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--allow-file-access-from-files", "--hide-scrollbars", "--no-first-run", "--disable-gpu", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });
let ws, mid = 0; const pend = new Map();
async function chromeReady() { for (let i = 0; i < 60; i++) { try { const l = await (await fetch(`http://localhost:${PORT}/json/list`)).json(); const p = l.find(t => t.type === "page"); if (p) return p.webSocketDebuggerUrl; } catch { /* starting */ } await sleep(400); } throw new Error("Chrome did not start"); }
const cdp = (method, params = {}) => new Promise((res, rej) => { const i = ++mid; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
async function render(html, outPng) {
  const f = outPng.replace(/\.png$/, ".html"); fs.writeFileSync(f, html);
  await cdp("Page.navigate", { url: "file://" + f });
  for (let i = 0; i < 40; i++) { const r = await cdp("Runtime.evaluate", { expression: "document.readyState==='complete' && [...document.images].every(i=>i.complete)", returnByValue: true }); if (r.result.value) break; await sleep(150); }
  await sleep(120);
  const r = await cdp("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1280, height: 720, scale: 1 } });
  fs.writeFileSync(outPng, Buffer.from(r.data, "base64"));
}

// ───────────────────────────── narration + captions ─────────────────────────────
const VOICES = { en: ["Rishi", "166"], hi: ["Lekha", "165"], hiName: ["Lekha", "135"] };
function silence(sec, file) { if (!fs.existsSync(file)) sh("ffmpeg", ["-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(sec), file]); return file; }
function chunk(text) { // caption chunks of <= ~105 chars at sentence/clause boundaries
  const out = []; let cur = "";
  for (const s of text.split(/(?<=[.?!])\s+/)) { if (cur && (cur + " " + s).length > 105) { out.push(cur); cur = s; } else cur = cur ? cur + " " + s : s; }
  if (cur) out.push(cur);
  return out.flatMap(c => { if (c.length <= 125) return [c]; const m = c.search(/,\s|\sand\s|:\s/); const mid = c.length / 2; let best = -1, bd = 1e9; for (const x of c.matchAll(/,\s|\sand\s|:\s/g)) { const d = Math.abs(x.index - mid); if (d < bd) { bd = d; best = x.index + (x[0].startsWith(",") || x[0].startsWith(":") ? 1 : 0); } } return best > 0 ? [c.slice(0, best).trim(), c.slice(best).trim()] : [c]; });
}

// Speak a string. "‹hi:कमाई›" spans are spoken by the Hindi voice so the product name is pronounced correctly.
function synth(voiceKey, text, base) {
  const say1 = (vk, t, out) => { const [voice, rate] = VOICES[vk]; sh("say", ["-v", voice, "-r", rate, "-o", out + ".aiff", "--", t]); sh("ffmpeg", ["-y", "-i", out + ".aiff", "-ar", "44100", "-ac", "1", out + ".wav"]); return out + ".wav"; };
  if (!text.includes("‹hi:")) return say1(voiceKey, text, base);
  const pieces = text.split(/‹hi:([^›]+)›/), list = [];
  pieces.forEach((p, i) => { if (!p.trim()) return; list.push(say1(i % 2 ? "hiName" : voiceKey, p.trim(), `${base}_p${i}`)); list.push(silence(0.04, `${AU}/sil_0.04.wav`)); });
  list.pop();
  fs.writeFileSync(`${base}_p.txt`, list.map(p => `file '${p}'`).join("\n"));
  sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", `${base}_p.txt`, "-c", "copy", `${base}.wav`]);
  return `${base}.wav`;
}

async function buildScene(sc) {
  const lead = 0.5, gap = 0.3, tail = 0.7, parts = [], timeline = []; let t = 0;
  parts.push(silence(lead, `${AU}/sil_${lead}.wav`)); t += lead;
  sc.segs.forEach((seg, i) => {
    const wav = synth(seg.voice, seg.say || seg.text, `${AU}/${sc.id}_${i}`);
    const d = dur(wav); parts.push(wav);
    const chunks = seg.voice === "hi" ? [{ text: seg.text, text2: seg.text2 }] : chunk(seg.text).map(text => ({ text }));
    const total = chunks.reduce((a, c) => a + c.text.length, 0); let ct = t;
    for (const c of chunks) { const cd = d * c.text.length / total; timeline.push({ start: ct, end: ct + cd, ...c }); ct += cd; }
    t += d;
    if (i < sc.segs.length - 1) { parts.push(silence(gap, `${AU}/sil_${gap}.wav`)); t += gap; }
  });
  parts.push(silence(tail, `${AU}/sil_${tail}.wav`)); t += tail;
  fs.writeFileSync(`${AU}/${sc.id}.txt`, parts.map(p => `file '${p}'`).join("\n"));
  const audio = `${AU}/${sc.id}.wav`; sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", `${AU}/${sc.id}.txt`, "-c", "copy", audio]);
  const D = dur(audio);

  // frames: base (no caption) + one per caption chunk
  const base = `${FR}/${sc.id}_base.png`; await render(L[sc.layout](sc).replace("<body>", "<body>"), base);
  const frames = []; let cursor = 0;
  timeline.forEach((c, i) => {
    if (c.start > cursor + 0.02) frames.push({ img: base, d: c.start - cursor });
    frames.push({ img: `${FR}/${sc.id}_c${i}.png`, d: c.end - c.start, html: L[sc.layout](sc).replace(/<\/body>|$/, "") + subHtml(c) , c });
    cursor = c.end;
  });
  if (D > cursor + 0.02) frames.push({ img: base, d: D - cursor });
  for (const f of frames) if (f.html) await render(f.html, f.img);

  const list = frames.map(f => `file '${f.img}'\nduration ${f.d.toFixed(3)}`).join("\n") + `\nfile '${frames[frames.length - 1].img}'`;
  fs.writeFileSync(`${CL}/${sc.id}.txt`, list);
  const fade = 0.3, out = `${CL}/${sc.id}.mp4`;
  sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", `${CL}/${sc.id}.txt`, "-i", audio, "-vf", `scale=1280:720,fps=30,format=yuv420p,fade=t=in:st=0:d=${fade},fade=t=out:st=${(D - fade).toFixed(3)}:d=${fade}`, "-af", `afade=t=in:st=0:d=0.15,afade=t=out:st=${(D - 0.3).toFixed(3)}:d=0.3`, "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-c:a", "aac", "-b:a", "160k", "-t", D.toFixed(3), out]);
  console.log(`  ${sc.id}  ${D.toFixed(1)}s  ${frames.length} frames`);
  return { D, timeline };
}

// ───────────────────────────── main ─────────────────────────────
ws = new WebSocket(await chromeReady()); await new Promise(r => (ws.onopen = r));
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } };
await cdp("Page.enable"); await cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });

try {
  const todo = scenes.filter(s => !ONLY.length || ONLY.includes(s.id)), info = {};
  console.log("building", todo.length, "scenes");
  for (const sc of todo) info[sc.id] = await buildScene(sc);
  if (!ONLY.length) {
    fs.writeFileSync(`${CL}/all.txt`, scenes.map(s => `file '${CL}/${s.id}.mp4'`).join("\n"));
    const mp4 = path.join(OUT, "kamai-demo.mp4");
    sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", `${CL}/all.txt`, "-c", "copy", "-movflags", "+faststart", mp4]);
    // SRT for upload platforms
    let off = 0, n = 1, srt = ""; const ts = x => { const h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = Math.floor(x % 60), ms = Math.round((x % 1) * 1000); return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`; };
    for (const s of scenes) { for (const c of info[s.id].timeline) srt += `${n++}\n${ts(off + c.start)} --> ${ts(off + c.end)}\n${c.text}${c.text2 ? "\n" + c.text2 : ""}\n\n`; off += info[s.id].D; }
    fs.writeFileSync(path.join(OUT, "kamai-demo.srt"), srt);
    console.log(`done: ${mp4}  total ${off.toFixed(1)}s (${Math.floor(off / 60)}:${String(Math.round(off % 60)).padStart(2, "0")})`);
  }
} finally { ws.close(); chrome.kill(); setTimeout(() => process.exit(), 300); }
