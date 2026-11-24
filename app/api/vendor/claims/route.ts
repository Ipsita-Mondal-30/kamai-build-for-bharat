import { db } from "@/lib/server/db";
import { evaluateUser } from "@/lib/server/ledger";
import { fail, json, requireRole } from "@/lib/server/http";

export async function POST() {
  const a = await requireRole("vendor"); if ("res" in a) return a.res;
  const ev = await evaluateUser(a.user);
  if (!ev.chain.ok) return fail("Your ledger failed its integrity check, so claims are on hold.", 409);
  const ins = db().prepare("INSERT OR IGNORE INTO claims (user_id, date, rain, expected, actual, payout, status, filed_at) VALUES (?,?,?,?,?,?,'filed',?)"), now = new Date().toISOString();
  let filed = 0, total = 0;
  for (const c of ev.claims.items) { const r = ins.run(a.user.id, c.date, c.rain, c.expected, c.actual, c.payout, now); if (r.changes) { filed++; total += c.payout; } }
  return json({ ok: true, filed, total, already: ev.claims.items.length - filed });
}
