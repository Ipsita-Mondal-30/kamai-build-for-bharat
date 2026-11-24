// Sample data so judges (and the first visitor) see a populated system. All sample accounts are flagged demo=1.
import * as K from "../engine.ts";
import { db, tx } from "./db";
import { hashPin } from "./auth";
import { getRain } from "./rain";
import { evaluateUser } from "./ledger";

const START = "2026-07-01", N = 90, END = K.addDays(START, N - 1);
export const DEMO_PIN = "1234";
export const DEMO_PHONES = { vendor: "9000000001", lender: "9100000001", insurer: "9200000001" };

type Sample = { name: string; biz: string; city: string; o: { base: number; buyR: number; upi: number }; vouches: number; util: number; seed: number; mode: "honest" | "fraud" | "tamper" | "thin" };
const SAMPLES: Sample[] = [
  { name: "Savitri Devi", biz: "tea", city: "Gorakhpur", o: { base: 1500, buyR: 0.54, upi: 0.3 }, vouches: 3, util: 1, seed: 7, mode: "honest" },
  { name: "Ramesh Yadav", biz: "veg", city: "Varanasi", o: { base: 1900, buyR: 0.68, upi: 0.2 }, vouches: 2, util: 1, seed: 11, mode: "honest" },
  { name: "Fatima Khatoon", biz: "fruit", city: "Lucknow", o: { base: 2200, buyR: 0.7, upi: 0.35 }, vouches: 3, util: 1, seed: 23, mode: "honest" },
  { name: "Mohan Lal", biz: "chaat", city: "Patna", o: { base: 1300, buyR: 0.45, upi: 0.4 }, vouches: 2, util: 0, seed: 31, mode: "honest" },
  { name: "Geeta Devi", biz: "flower", city: "Kanpur", o: { base: 950, buyR: 0.5, upi: 0.25 }, vouches: 1, util: 1, seed: 41, mode: "honest" },
  { name: "Imran Ali", biz: "tea", city: "Prayagraj", o: { base: 1400, buyR: 0.54, upi: 0.3 }, vouches: 2, util: 1, seed: 53, mode: "fraud" },
  { name: "Sunita Kumari", biz: "veg", city: "Gaya", o: { base: 1600, buyR: 0.68, upi: 0.2 }, vouches: 1, util: 0, seed: 61, mode: "thin" },
  { name: "Raju Sahani", biz: "tea", city: "Muzaffarpur", o: { base: 1450, buyR: 0.54, upi: 0.3 }, vouches: 2, util: 1, seed: 71, mode: "tamper" },
];

let running: Promise<void> | null = null;
export function ensureSeed(): Promise<void> {
  const d = db();
  if ((d.prepare("SELECT v FROM meta WHERE k = 'seeded'").get() as any)?.v === "1") return Promise.resolve();
  if (!running) running = seed().catch(e => { console.error("seed failed:", e.message); throw e; }).finally(() => { running = null; });
  return running;
}

async function seed() {
  const d = db(), now = new Date().toISOString();
  const rains: Record<string, any[]> = {};
  for (const s of SAMPLES) rains[s.city] = await getRain(s.city, START, END); // network first, then one transaction
  const pin = hashPin(DEMO_PIN), ids: number[] = [];
  tx(() => {
    const user = d.prepare("INSERT INTO users (role, name, phone, pin_salt, pin_hash, city, biz, demo, vouches, util, created_at) VALUES (?,?,?,?,?,?,?,1,?,?,?)");
    const ins = d.prepare("INSERT INTO entries (user_id, seq, date, type, amt, src, log_date, prev, hash) VALUES (?,?,?,?,?,?,?,?,?)");
    SAMPLES.forEach((s, i) => {
      const phone = String(9000000001 + i);
      const uid = Number(user.run("vendor", s.name, phone, pin.salt, pin.hash, s.city, s.biz, s.vouches, s.util, now).lastInsertRowid); ids.push(uid);
      const win = s.mode === "thin" ? rains[s.city].slice(55) : rains[s.city];
      let led: any[] = K.genLedger(win, s.seed, s.o);
      if (s.mode === "fraud") { led.slice(-120).forEach(e => { if (e.type === "sale" && e.src === "cash") e.amt *= 3; }); led.forEach(e => delete e.hash); led = K.chain(led); }
      for (const e of led) ins.run(uid, e.id, e.date, e.type, e.amt, e.src, e.logDate, e.prev, e.hash);
      if (s.mode === "tamper") { // edit history AFTER it was chained: the chain no longer verifies
        d.prepare("UPDATE entries SET amt = amt * 3 WHERE user_id = ? AND type = 'sale' AND src = 'cash' AND seq > ?").run(uid, led.length - 100);
      }
    });
    d.prepare("INSERT INTO users (role, name, phone, pin_salt, pin_hash, city, biz, demo, created_at) VALUES ('lender','Kamai Partner Bank (sample)',?,?,?,NULL,NULL,1,?)").run(DEMO_PHONES.lender, pin.salt, pin.hash, now);
    d.prepare("INSERT INTO users (role, name, phone, pin_salt, pin_hash, city, biz, demo, created_at) VALUES ('insurer','Barish Suraksha Insurer (sample)',?,?,?,NULL,NULL,1,?)").run(DEMO_PHONES.insurer, pin.salt, pin.hash, now);
  });
  // sample applications and claims (Savitri starts clean so the live demo flow works)
  for (let i = 1; i < SAMPLES.length; i++) {
    const u = d.prepare("SELECT id, city, biz, demo, vouches, util FROM users WHERE id = ?").get(ids[i]) as any, ev = await evaluateUser(u);
    d.prepare("INSERT INTO applications (user_id, amount, status, created_at) VALUES (?,?,'pending',?)").run(u.id, ev.sc.loan.amount, now);
    const ins = d.prepare("INSERT OR IGNORE INTO claims (user_id, date, rain, expected, actual, payout, status, filed_at) VALUES (?,?,?,?,?,?,'filed',?)");
    for (const c of ev.claims.items) ins.run(u.id, c.date, c.rain, c.expected, c.actual, c.payout, now);
  }
  d.prepare("INSERT OR REPLACE INTO meta (k, v) VALUES ('seeded','1')").run();
}
