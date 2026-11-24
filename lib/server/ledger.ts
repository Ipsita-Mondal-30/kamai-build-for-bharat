import * as K from "../engine.ts";
import { BIZ } from "../catalog";
import { db, tx } from "./db";
import { getRain, userToday } from "./rain";
import type { User } from "./auth";

const toEntry = (r: any) => ({ id: r.seq, date: r.date, type: r.type, amt: r.amt, src: r.src, logDate: r.log_date, prev: r.prev, hash: r.hash });

export function getEntries(userId: number) {
  return (db().prepare("SELECT seq, date, type, amt, src, log_date, prev, hash FROM entries WHERE user_id = ? ORDER BY seq").all(userId) as any[]).map(toEntry);
}

// Server-side append: the chain is built here, so a vendor cannot edit or reorder history from the browser.
export function addEntries(userId: number, items: { type: string; amt: number }[], date: string, logDate: string) {
  return tx(() => {
    const d = db(), last = d.prepare("SELECT seq, hash FROM entries WHERE user_id = ? ORDER BY seq DESC LIMIT 1").get(userId) as any;
    let seq = last ? last.seq : 0, prev = last ? last.hash : "GENESIS";
    const ins = d.prepare("INSERT INTO entries (user_id, seq, date, type, amt, src, log_date, prev, hash) VALUES (?,?,?,?,?,?,?,?,?)"), added: any[] = [];
    for (const it of items) {
      seq++;
      const e: any = { id: seq, date, type: it.type, amt: it.amt, src: "cash", logDate, prev };
      e.hash = K.entryHash(e); prev = e.hash;
      ins.run(userId, seq, e.date, e.type, e.amt, e.src, e.logDate, e.prev, e.hash); added.push(e);
    }
    return added;
  });
}

const ev0 = (chain: any) => chain.ok; // a broken chain keeps its 'Not lendable' label even when the file is new
export const MIN_DAYS = 14; // days of records before a loan offer is shown

// Everything the apps show about one vendor, computed from their stored entries + real rainfall at their city.
export async function evaluateUser(u: Pick<User, "id" | "city" | "biz" | "demo" | "vouches" | "util">) {
  const all = getEntries(u.id), chain = K.verifyChain(all);
  const empty = !all.length;
  const end = userToday(u);
  const first = empty ? end : all[0].date, start = first > K.addDays(end, -89) ? first : K.addDays(end, -89);
  const rain = await getRain(u.city || "Delhi", start, end);
  const win = all.filter(e => e.date >= start && e.date <= end);
  const band = (BIZ[u.biz || "other"] || BIZ.other).band;
  const span = Math.round((Date.parse(end) - Date.parse(start)) / 864e5) + 1;
  const ctx: any = { totalDays: Math.max(MIN_DAYS, span), vouches: u.vouches, utilityOnTime: !!u.util, marginBand: band, chain };
  const claims = K.claims(win, rain), pay = Object.fromEntries(claims.items.map((c: any) => [c.date, c.payout]));
  const base = K.score(win, ctx), sc = K.score(win, { ...ctx, payouts: pay });
  const daysLogged = K.daily(win).length, ready = daysLogged >= MIN_DAYS;
  if (!ready) { sc.loan = { ...sc.loan, amount: 0, emi: 0 }; base.loan = { ...base.loan, amount: 0, emi: 0 }; if (ev0(chain)) sc.band = "Getting started"; }
  return { entries: all, win, chain, rain, claims, base, sc, daysLogged, ready, start, end, daily: K.daily(win) };
}
