import * as K from "@/lib/engine.ts";
import { db } from "@/lib/server/db";
import { getEntries } from "@/lib/server/ledger";
import { json, requireRole } from "@/lib/server/http";

export async function GET() {
  const a = await requireRole("insurer"); if ("res" in a) return a.res;
  const d = db();
  const rows = d.prepare(`SELECT c.id, c.date, c.rain, c.expected, c.actual, c.payout, c.status, u.id AS uid, u.name, u.city, u.demo
    FROM claims c JOIN users u ON u.id = c.user_id ORDER BY c.date DESC, c.id DESC`).all() as any[];
  const chainOk: Record<number, boolean> = {};
  for (const r of rows) if (!(r.uid in chainOk)) chainOk[r.uid] = K.verifyChain(getEntries(r.uid)).ok; // re-verified at read time
  const vendors = (d.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'vendor'").get() as any).n;
  return json({ vendors, claims: rows.map(r => ({ id: r.id, date: r.date, rain: r.rain, expected: r.expected, actual: r.actual, payout: r.payout, vendor: r.name, city: r.city, demo: !!r.demo, held: !chainOk[r.uid], status: r.status })) });
}
