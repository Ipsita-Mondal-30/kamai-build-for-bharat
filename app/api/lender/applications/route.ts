import { db } from "@/lib/server/db";
import { evaluateUser } from "@/lib/server/ledger";
import { json, requireRole } from "@/lib/server/http";
import { BIZ } from "@/lib/catalog";

// A lender only ever sees vendors who chose to apply.
export async function GET() {
  const a = await requireRole("lender"); if ("res" in a) return a.res;
  const rows = db().prepare(`SELECT a.id, a.amount, a.status, a.created_at, u.id AS uid, u.name, u.city, u.biz, u.demo, u.vouches, u.util
    FROM applications a JOIN users u ON u.id = a.user_id ORDER BY a.id DESC`).all() as any[];
  const out = await Promise.all(rows.map(async r => {
    const ev = await evaluateUser({ id: r.uid, city: r.city, biz: r.biz, demo: r.demo, vouches: r.vouches, util: r.util }), s = ev.sc;
    return {
      id: r.id, status: r.status, askedAt: r.created_at, demo: !!r.demo,
      applicant: { name: r.name, city: r.city, biz: BIZ[r.biz]?.label || r.biz },
      score: { score: s.score, band: s.band, factors: s.factors, flags: s.flags, stats: s.stats, loan: s.loan }, baseLoanAmount: ev.base.loan.amount, chain: ev.chain,
      ready: ev.ready, daysLogged: ev.daysLogged, latest: ev.win.slice(-6).reverse(),
    };
  }));
  return json({ applications: out });
}
