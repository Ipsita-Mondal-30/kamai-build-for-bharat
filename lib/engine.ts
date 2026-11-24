// Kamai: voice ledger -> verifiable credit passport -> parametric rain-out insurance claim.
// Pure functions, runs in browser and Node. Weather data is real (Open-Meteo archive); the vendor's ledger is simulated.
// ---------- small utils ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(str) { // cyrb53: fast sync hash for the demo chain (production: SHA-256 + signed anchors)
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
}
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const median = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const addDays = (s, n) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const dow = s => new Date(s + "T00:00:00Z").getUTCDay();

// ---------- voice / text parser (Hindi, Hinglish, English) ----------
const DEV = { "०": 0, "१": 1, "२": 2, "३": 3, "४": 4, "५": 5, "६": 6, "७": 7, "८": 8, "९": 9 };
const WORDS = { "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पाँच": 5, "पांच": 5, "छह": 6, "छः": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10, "पंद्रह": 15, "बीस": 20, "पच्चीस": 25, "तीस": 30, "चालीस": 40, "पचास": 50, "साठ": 60, "सत्तर": 70, "अस्सी": 80, "नब्बे": 90,
  ek: 1, do: 2, teen: 3, char: 4, paanch: 5, panch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10, pandrah: 15, bees: 20, pachchees: 25, tees: 30, chalis: 40, pachas: 50, saath: 60, sattar: 70, assi: 80, nabbe: 90,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twenty: 20, thirty: 30, forty: 40, fifty: 50 };
const MULT = { "सौ": 100, sau: 100, hundred: 100, "हज़ार": 1000, "हजार": 1000, hazaar: 1000, hazar: 1000, thousand: 1000, "k": 1000 };
const KEYS: [string, RegExp][] = [
  ["sale", /बिका|बिक्री|बेचा|बिकी|कमाई|कमाया|bika|bikri|becha|bik gaya|sale|sold|kamai|कलेक्शन/i],
  ["purchase", /माल|खरीद|ख़रीद|खरीदा|लिया|दूध|चीनी|चायपत्ती|आटा|सामान|maal|khareed|kharida|liya|bought|purchase|doodh|cheeni|samaan/i],
  ["expense", /किराया|बिजली|गैस|सिलेंडर|मज़दूरी|मजदूरी|kiraya|bijli|gas|cylinder|rent|labour|expense|kharcha|खर्चा|खर्च/i],
];
function norm(t) { return String(t || "").replace(/[०-९]/g, c => DEV[c]).replace(/[,।]/g, " ").replace(/₹|rs\.?|rupaye|rupees|रुपये|रुपए|रुपया/gi, " ").replace(/\s+/g, " ").trim(); }
// returns [{type, amt, text}]; splits on "aur / और / , / then", finds one amount per clause
function parseVoice(text) {
  const clauses = norm(text).split(/\s*(?:\band\b|\baur\b|और|फिर|\bphir\b|;|\.(?=\s|$)|\bthen\b)\s*/i).filter(Boolean);
  const out = [];
  for (const cl of clauses) {
    const toks = cl.toLowerCase().split(" ");
    let amt = 0, cur = 0, found = false;
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (/^\d+(\.\d+)?k?$/.test(t)) { const k = t.endsWith("k"); cur = parseFloat(t) * (k ? 1000 : 1); found = true; if (toks[i + 1] in MULT || MULT[toks[i + 1]]) { cur *= MULT[toks[i + 1]]; i++; } amt = cur; }
      else if (WORDS[t] != null) { cur = WORDS[t]; found = true; if (MULT[toks[i + 1]]) { cur *= MULT[toks[i + 1]]; i++; } amt = cur; }
      else if (MULT[t] && !found) { amt = MULT[t]; found = true; }
    }
    if (!found || amt <= 0) continue;
    let type = null; for (const [k, re] of KEYS) if (re.test(cl)) { type = k; break; }
    if (!type) type = "sale";
    out.push({ type, amt: Math.round(amt), text: cl });
  }
  return out;
}

// ---------- ledger: hash-chained entries ----------
const entryStr = e => [e.id, e.date, e.type, e.amt, e.src, e.logDate, e.prev].join("|");
function chain(entries) {
  let prev = "GENESIS";
  entries.forEach((e, i) => { e.id = i + 1; e.prev = prev; e.hash = hash(entryStr(e)); prev = e.hash; });
  return entries;
}
function verifyChain(entries) {
  let prev = "GENESIS";
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.prev !== prev || e.hash !== hash(entryStr(e))) return { ok: false, brokenAt: e.id, date: e.date };
    prev = e.hash;
  }
  return { ok: true, length: entries.length, head: prev };
}
function append(entries, e) { // add a live entry and re-link
  const last = entries[entries.length - 1], x = { ...e, id: entries.length + 1, prev: last ? last.hash : "GENESIS" };
  x.hash = hash(entryStr(x)); entries.push(x); return x;
}

// ---------- simulated vendor ledger on REAL rain ----------
// rain: [{date, rain}] real daily rainfall. Persona: tea & snacks stall.
function genLedger(rain, seed?, o?) {
  o = o || {}; const BASE = o.base || 1500, BUYR = o.buyR || 0.54, UPI = o.upi || 0.3;
  const R = mulberry32(seed || 7), out = [];
  for (let i = 0; i < rain.length; i++) {
    const { date, rain: mm } = rain[i], d = dow(date);
    if (R() < 0.07) continue; // missed day: real people forget
    const dayF = [1.2, 0.95, 0.95, 1.0, 1.0, 1.1, 1.25][d], growth = 1 + 0.0035 * i; // business slowly grows
    const base = BASE * dayF * growth * (0.9 + R() * 0.2);
    const wx = mm >= 15 ? 0.2 + R() * 0.12 : mm >= 5 ? 0.72 : 1;
    const sales = Math.round(base * wx / 10) * 10;
    const upi = Math.round(sales * (UPI + R() * 0.1) / 10) * 10, cash = sales - upi;
    const bf = mm >= 15 ? 0.6 + R() * 0.15 : mm >= 5 ? 0.88 : 1; // buys less when the sky looks bad, but the forecast is never perfect
    const buy = Math.round(BASE * dayF * BUYR * growth * (0.92 + R() * 0.16) * bf / 10) * 10;
    const logDate = date;
    out.push({ date, type: "sale", amt: cash, src: "cash", logDate });
    out.push({ date, type: "sale", amt: upi, src: "upi", logDate });
    out.push({ date, type: "purchase", amt: buy, src: R() < 0.6 ? "receipt" : "cash", logDate });
    if (i % 12 === 5) out.push({ date, type: "expense", amt: 1150, src: "receipt", logDate }); // gas cylinder
  }
  return chain(out);
}

// ---------- scoring ----------
const CATEGORY = { name: "Tea & snack stall", marginBand: [0.38, 0.72] }; // purchases/sales
function daily(entries) {
  const m: Record<string, any> = {};
  for (const e of entries) { const d = (m[e.date] = m[e.date] || { date: e.date, sales: 0, purchases: 0, expenses: 0, upi: 0, receipt: 0 }); if (e.type === "sale") { d.sales += e.amt; if (e.src === "upi") d.upi += e.amt; } else if (e.type === "purchase") { d.purchases += e.amt; if (e.src === "receipt") d.receipt += e.amt; } else { d.expenses += e.amt; if (e.src === "receipt") d.receipt += e.amt; } }
  return Object.values(m).sort((a, b) => a.date < b.date ? -1 : 1).map(d => ({ ...d, net: d.sales - d.purchases - d.expenses }));
}
function emiPV(emi, apr, months) { const r = apr / 12; return emi * (1 - Math.pow(1 + r, -months)) / r; }

// ctx: { totalDays, vouches (0..3), utilityOnTime (bool) }
function score(entries, ctx) {
  const ch = ctx.chain || verifyChain(entries), days = daily(entries).map(d => ({ ...d, net: d.net + ((ctx.payouts || {})[d.date] || 0) })), N = ctx.totalDays || days.length || 1;
  const sales = days.reduce((a, d) => a + d.sales, 0), purch = days.reduce((a, d) => a + d.purchases, 0), exp = days.reduce((a, d) => a + d.expenses, 0);
  const net = days.reduce((a, d) => a + d.net, 0), avgNet = days.length ? net / days.length : 0;
  // weekly net stability
  const t0 = days.length ? days[0].date : null, weeks: Record<number, number> = {};
  if (t0) for (const d of days) { const w = Math.floor((new Date(d.date).getTime() - new Date(t0).getTime()) / 864e5 / 7); weeks[w] = (weeks[w] || 0) + d.net; }
  const wk = Object.values(weeks).slice(0, -1).filter(v => v != null), mean = wk.reduce((a, b) => a + b, 0) / (wk.length || 1);
  const sd = Math.sqrt(wk.reduce((a, b) => a + (b - mean) ** 2, 0) / (wk.length || 1)), cv = mean > 0 ? sd / mean : 1;
  // verification coverage
  const verified = days.reduce((a, d) => a + d.upi + d.receipt, 0), total = sales + purch + exp, coverage = total ? verified / total : 0;
  // flags
  const flags = [];
  if (!ch.ok) flags.push({ sev: "high", name: "Ledger tampered", detail: `Entry #${ch.brokenAt} (${ch.date}) no longer matches its fingerprint` });
  const ratio = sales ? purch / sales : 0;
  const recent = days.slice(-30), rs = recent.reduce((a, d) => a + d.sales, 0), rp = recent.reduce((a, d) => a + d.purchases, 0), rRatio = rs ? rp / rs : 0;
  const MB = ctx.marginBand || CATEGORY.marginBand;
  if (days.length && (ratio < MB[0] || rRatio < MB[0])) flags.push({ sev: "high", name: "Margin too good to be true", detail: `Stock cost is only ${Math.round(Math.min(ratio, rRatio) * 100)}% of sales; stalls like this run ${MB.map(x => Math.round(x * 100)).join("–")}%` });
  const upiShare = sales ? days.reduce((a, d) => a + d.upi, 0) / sales : 0, upiRecent = rs ? recent.reduce((a, d) => a + d.upi, 0) / rs : 0;
  if (days.length > 40 && upiRecent < upiShare * 0.6) flags.push({ sev: "med", name: "Cash jumped, UPI didn't", detail: `UPI share fell from ${Math.round(upiShare * 100)}% to ${Math.round(upiRecent * 100)}% in the last 30 days` });
  const back = entries.filter(e => e.logDate && e.logDate > addDays(e.date, 2)).length / (entries.length || 1);
  if (back > 0.2) flags.push({ sev: "med", name: "Back-filled entries", detail: `${Math.round(back * 100)}% of entries were typed days after the sale` });
  let streak = 1, maxStreak = 1; for (let i = 1; i < days.length; i++) { streak = days[i].sales === days[i - 1].sales ? streak + 1 : 1; maxStreak = Math.max(maxStreak, streak); }
  if (maxStreak >= 4) flags.push({ sev: "med", name: "Copy-paste sales", detail: `${maxStreak} days in a row with identical sales` });
  const band_ = ctx.marginBand || CATEGORY.marginBand;
  const hi = flags.some(f => f.sev === "high");
  // factors (0..1), weights sum 1
  const f = [
    { key: "consistency", label: "Logs the shop every day", w: 0.25, v: clamp((days.length / N - 0.4) / 0.55), note: `${days.length} of ${N} days logged` },
    { key: "income", label: "Daily earnings", w: 0.2, v: clamp(avgNet / 800), note: `₹${Math.round(avgNet)} net per day` },
    { key: "stability", label: "Steady week to week", w: 0.2, v: 1 - clamp(cv / 0.9), note: `weekly swing ${Math.round(cv * 100)}%` },
    { key: "verify", label: "Backed by UPI & receipts", w: 0.2, v: clamp(coverage / 0.6), note: `${Math.round(coverage * 100)}% of value independently verified` },
    { key: "trust", label: "Neighbours & bills", w: 0.1, v: clamp(((ctx.vouches || 0) / 3) * 0.6 + (ctx.utilityOnTime ? 0.4 : 0)), note: `${ctx.vouches || 0} vouches${ctx.utilityOnTime ? ", electricity bills on time" : ""}` },
    { key: "clean", label: "No red flags", w: 0.05, v: flags.length ? 0 : 1, note: flags.length ? `${flags.length} flag(s)` : "all checks passed" },
  ];
  let s = 300 + 600 * f.reduce((a, x) => a + x.w * x.v, 0);
  if (hi) s = Math.min(s, 450);
  s = Math.round(s);
  const band = hi ? "Not lendable" : s >= 750 ? "Prime" : s >= 650 ? "Good" : s >= 550 ? "Fair" : s >= 450 ? "Building" : "Not lendable";
  // loan: stressed income = 20th percentile week x 4.3, 35% for EMI, 12 months @ 18% APR, MUDRA-Shishu cap 50k
  const stressedMonthly = wk.length ? Math.max(0, pct(wk, 0.2) * 4.3) : 0, emi = stressedMonthly * 0.35;
  let loan = Math.floor(Math.min(50000, emiPV(emi, 0.18, 12)) / 1000) * 1000;
  if (s < 550 || hi) loan = 0;
  return { score: s, band, factors: f, flags, chain: ch, stats: { days: days.length, N, sales, purch, net, avgNet, coverage, cv, ratio, upiShare }, loan: { amount: loan, emi: loan ? Math.round(emiPV.length && loan / (emiPV(1, 0.18, 12))) : 0, months: 12, apr: 18, stressedMonthly: Math.round(stressedMonthly) }, daily: days };
}

// ---------- parametric rain-out claims ----------
const POLICY = { name: "Barish Suraksha", premiumPerMonth: 20, rainTrigger: 15, payoutShare: 0.7, perDayCap: 800, maxDaysPerMonth: 4 };
// rain: [{date, rain}] real. Uses ledger as proof of loss.
function claims(entries, rain) {
  const days = daily(entries), byDate = Object.fromEntries(days.map(d => [d.date, d])), ch = verifyChain(entries), out = [], paid = {};
  for (const r of rain) {
    if (r.rain < POLICY.rainTrigger) continue;
    const d = byDate[r.date]; if (!d) continue;
    const prior = days.filter(x => x.date < r.date && dow(x.date) === dow(r.date) && (rain.find(q => q.date === x.date) || { rain: 0 }).rain < 5).slice(-4).map(x => x.sales);
    let basis = prior.length + " comparable " + ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow(r.date)] + "s";
    if (prior.length < 2) { const dry = days.filter(x => x.date < r.date && (rain.find(q => q.date === x.date) || { rain: 0 }).rain < 5).slice(-10).map(x => x.sales); if (dry.length < 3) continue; prior.splice(0, prior.length, ...dry); basis = "last " + dry.length + " dry days"; }
    const expected = median(prior), loss = Math.max(0, expected - d.sales);
    if (d.sales > expected * 0.5) continue; // not a rain-out
    const month = r.date.slice(0, 7); paid[month] = paid[month] || 0; if (paid[month] >= POLICY.maxDaysPerMonth) continue;
    const payout = Math.min(POLICY.perDayCap, Math.round(loss * POLICY.payoutShare / 10) * 10); paid[month]++;
    const hs = entries.filter(e => e.date === r.date).map(e => ({ id: e.id, hash: e.hash }));
    out.push({ date: r.date, rain: r.rain, expected: Math.round(expected), actual: d.sales, loss: Math.round(loss), payout, ledgerRefs: hs, chainOk: ch.ok, basis });
  }
  return { items: out, total: out.reduce((a, c) => a + c.payout, 0), premiumPaid: Math.round(POLICY.premiumPerMonth * (rain.length / 30)) };
}


export const entryHash = (e) => hash(entryStr(e));
export { parseVoice, genLedger, chain, verifyChain, append, daily, score, claims, POLICY, CATEGORY, hash, addDays };
