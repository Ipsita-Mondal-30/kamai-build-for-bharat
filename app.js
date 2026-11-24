// Shared layer for all Kamai apps: world of 8 vendors on real rain, nav, helpers, charts, voice.
const K = Kamai;
const START = "2026-07-01", N = 90;
const rs = n => "₹" + Math.round(n).toLocaleString("en-IN");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const $ = s => document.querySelector(s);
const fmtD = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

// Fictional vendors. mode: honest | fraud (inflated + re-signed) | tamper (edited, chain broken) | thin (new, 35 days)
const VENDORS = [
  { id: "savitri", name: "Savitri Devi", biz: "Tea & snack stall", city: "Gorakhpur", ll: [26.76, 83.37], o: { base: 1500, buyR: 0.54, upi: 0.3 }, band: [0.38, 0.72], vouches: 3, util: true, seed: 7, mode: "honest" },
  { id: "ramesh", name: "Ramesh Yadav", biz: "Vegetable cart", city: "Varanasi", ll: [25.32, 82.99], o: { base: 1900, buyR: 0.68, upi: 0.2 }, band: [0.55, 0.82], vouches: 2, util: true, seed: 11, mode: "honest" },
  { id: "fatima", name: "Fatima Khatoon", biz: "Fruit stall", city: "Lucknow", ll: [26.85, 80.95], o: { base: 2200, buyR: 0.7, upi: 0.35 }, band: [0.55, 0.85], vouches: 3, util: true, seed: 23, mode: "honest" },
  { id: "mohan", name: "Mohan Lal", biz: "Chaat cart", city: "Patna", ll: [25.6, 85.14], o: { base: 1300, buyR: 0.45, upi: 0.4 }, band: [0.32, 0.62], vouches: 2, util: false, seed: 31, mode: "honest" },
  { id: "geeta", name: "Geeta Devi", biz: "Flower seller", city: "Kanpur", ll: [26.45, 80.35], o: { base: 950, buyR: 0.5, upi: 0.25 }, band: [0.35, 0.7], vouches: 1, util: true, seed: 41, mode: "honest" },
  { id: "imran", name: "Imran Ali", biz: "Tea stall", city: "Prayagraj", ll: [25.43, 81.85], o: { base: 1400, buyR: 0.54, upi: 0.3 }, band: [0.38, 0.72], vouches: 2, util: true, seed: 53, mode: "fraud" },
  { id: "sunita", name: "Sunita Kumari", biz: "Vegetable cart", city: "Gaya", ll: [24.8, 85.0], o: { base: 1600, buyR: 0.68, upi: 0.2 }, band: [0.55, 0.82], vouches: 1, util: false, seed: 61, mode: "thin" },
  { id: "raju", name: "Raju Sahani", biz: "Tea stall", city: "Muzaffarpur", ll: [26.12, 85.39], o: { base: 1450, buyR: 0.54, upi: 0.3 }, band: [0.38, 0.72], vouches: 2, util: true, seed: 71, mode: "tamper" },
];

const clone = x => JSON.parse(JSON.stringify(x));
const payMap = c => Object.fromEntries(c.items.map(x => [x.date, x.payout]));

function buildVendor(v, rainAll) {
  const win = v.mode === "thin" ? rainAll.slice(55) : rainAll;
  let led = K.genLedger(win, v.seed, v.o);
  if (v.mode === "fraud") { led = clone(led); led.slice(-120).forEach(e => { if (e.type === "sale" && e.src === "cash") e.amt *= 3; }); led.forEach(e => delete e.hash); led = K.chain(led); }
  if (v.mode === "tamper") { led = clone(led); led.slice(-100).forEach(e => { if (e.type === "sale" && e.src === "cash") e.amt *= 3; }); }
  return { ...v, rain: win, ledger: led, ctx: { totalDays: win.length, vouches: v.vouches, utilityOnTime: v.util, marginBand: v.band } };
}
function evaluate(v) {
  v.claims = K.claims(v.ledger, v.rain);
  v.base = K.score(v.ledger, v.ctx);
  v.sc = K.score(v.ledger, { ...v.ctx, payouts: payMap(v.claims) });
  return v;
}

// Live entries Savitri adds in the vendor app persist across pages.
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem("kamai." + k)) ?? d; } catch { return d; } }, set: (k, v) => localStorage.setItem("kamai." + k, JSON.stringify(v)) };
function applyLive(v) { for (const e of store.get("entries", [])) K.append(v.ledger, { date: e.date, type: e.type, amt: e.amt, src: "cash", logDate: e.date }); return v; }

async function loadWorld() {
  const end = K.addDays(START, N - 1);
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${VENDORS.map(v => v.ll[0]).join(",")}&longitude=${VENDORS.map(v => v.ll[1]).join(",")}&start_date=${START}&end_date=${end}&daily=precipitation_sum&timezone=Asia%2FKolkata`;
  const r = await fetch(url); if (!r.ok) throw new Error("rain service " + r.status);
  const j = await r.json(), arr = Array.isArray(j) ? j : [j];
  const vendors = VENDORS.map((v, i) => { const d = arr[i].daily, rain = d.time.map((t, k) => ({ date: t, rain: d.precipitation_sum[k] || 0 })); return evaluate(applyLive(buildVendor(v, rain))); });
  return { vendors, end };
}

// ---------- nav + footer ----------
function mountNav(active) {
  const L = [["index.html", "Home"], ["vendor.html", "Vendor app"], ["lender.html", "Lender"], ["insurer.html", "Insurer"]];
  document.body.insertAdjacentHTML("afterbegin", `<nav><div class="wrap"><a href="index.html" style="margin:0;font-weight:800;font-size:18px">Kamai · कमाई</a><div>${L.map(([h, t]) => `<a href="${h}" ${h === active ? 'style="text-decoration:underline;text-underline-offset:6px"' : ""}>${t}</a>`).join("")}</div></div></nav>`);
  document.body.insertAdjacentHTML("beforeend", `<div style="text-align:center;font-size:12px;opacity:.7;padding:18px 0 26px">Weather data: Open-Meteo.com (CC BY 4.0)</div>`);
}

// ---------- charts ----------
function chartSales(led, rain, upto, claimDates, H) {
  const d = K.daily(led).filter(x => x.date <= K.addDays(START, N - 1)), W = 960; H = H || 260;
  const L = 46, R = 8, T = 54, B = 26, n = rain.length, X = i => L + i * (W - L - R) / Math.max(1, n - 1), mx = Math.max(...d.map(x => x.sales), 1) * 1.1, Y = v => H - B - v / mx * (H - B - T), bw = (W - L - R) / n * 0.72, rmax = Math.max(...rain.map(r => r.rain), 10);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%">`;
  for (let g = 0; g <= 3; g++) { const v = mx * g / 3; s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#eee1b8"/><text x="${L - 6}" y="${Y(v) + 4}" font-size="11" text-anchor="end" fill="#777">${Math.round(v / 100) * 100}</text>`; }
  for (let i = 0; i < n; i++) { if (i > upto) break; const day = rain[i].date, r = rain[i]; if (r.rain > 0.5) s += `<rect x="${X(i) - bw / 2}" y="${T - 46}" width="${bw}" height="${r.rain / rmax * 42}" fill="#7fb3ea"/>`; const x = d.find(q => q.date === day); if (x) s += `<rect x="${X(i) - bw / 2}" y="${Y(x.sales)}" width="${bw}" height="${H - B - Y(x.sales)}" fill="${claimDates && claimDates.has(day) ? "#ff7a00" : "#1d1a14"}" rx="1.5"/>`; }
  for (let i = 0; i < n; i += 15) s += `<text x="${X(i)}" y="${H - 8}" font-size="11" fill="#777" text-anchor="middle">${fmtD(rain[i].date)}</text>`;
  return s + "</svg>";
}
function ring(score, band, size) {
  const c = 2 * Math.PI * 52, f = (score - 300) / 600, col = band === "Not lendable" ? "#d6361f" : score >= 650 ? "#1f9d55" : "#e08a00";
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 120 120" width="${size}" height="${size}"><circle cx="60" cy="60" r="52" fill="none" stroke="#efe3bf" stroke-width="12"/><circle cx="60" cy="60" r="52" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c * f} ${c}" transform="rotate(-90 60 60)"/></svg><b style="font-size:${size * 0.29}px">${score}</b></div>`;
}
const factorsHTML = s => s.factors.map(f => `<div class="fac"><div class="t"><span>${f.label}</span><small>${f.note}</small></div><div class="bar"><i style="width:${Math.round(f.v * 100)}%"></i></div></div>`).join("");

// ---------- voice ----------
function speak(t) { if (!("speechSynthesis" in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "hi-IN"; speechSynthesis.speak(u); }
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listen(btn, cb) { if (!SR) return alert("Voice input works in Chrome. You can type instead."); const r = new SR(); r.lang = "hi-IN"; btn.classList.add("rec"); r.onresult = e => cb(e.results[0][0].transcript); r.onend = () => btn.classList.remove("rec"); r.start(); }
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 3200); }
