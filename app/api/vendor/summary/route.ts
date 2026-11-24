import { db } from "@/lib/server/db";
import { evaluateUser, MIN_DAYS } from "@/lib/server/ledger";
import { userToday } from "@/lib/server/rain";
import { json, requireRole } from "@/lib/server/http";
import { BIZ } from "@/lib/catalog";

export async function GET() {
  const a = await requireRole("vendor"); if ("res" in a) return a.res;
  const u = a.user, ev = await evaluateUser(u), d = db();
  const app = d.prepare("SELECT id, amount, status, created_at FROM applications WHERE user_id = ? ORDER BY id DESC LIMIT 1").get(u.id) as any;
  const filed = (d.prepare("SELECT date FROM claims WHERE user_id = ?").all(u.id) as any[]).map(r => r.date);
  const today = userToday(u), s = ev.sc;
  return json({
    user: { name: u.name, city: u.city, biz: BIZ[u.biz || "other"]?.label, demo: !!u.demo },
    today, minDays: MIN_DAYS, ready: ev.ready, daysLogged: ev.daysLogged,
    score: { score: s.score, band: s.band, factors: s.factors, flags: s.flags, stats: s.stats, loan: s.loan },
    baseLoanAmount: ev.base.loan.amount,
    claims: { items: ev.claims.items, total: ev.claims.total, premiumPaid: ev.claims.premiumPaid }, filedDates: filed,
    daily: ev.daily, rain: ev.rain, chain: ev.chain,
    recent: ev.entries.slice(-8).reverse(), totalEntries: ev.entries.length,
    application: app || null,
  });
}
