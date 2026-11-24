import { db } from "@/lib/server/db";
import { evaluateUser } from "@/lib/server/ledger";
import { fail, json, requireRole } from "@/lib/server/http";

export async function POST() {
  const a = await requireRole("vendor"); if ("res" in a) return a.res;
  const ev = await evaluateUser(a.user), d = db();
  if (!ev.ready) return fail("Keep logging for a few more days first.");
  if (!ev.sc.loan.amount) return fail("No loan offer yet.");
  if (d.prepare("SELECT 1 FROM applications WHERE user_id = ? AND status = 'pending'").get(a.user.id)) return fail("Your application is already with the lender.", 409);
  d.prepare("INSERT INTO applications (user_id, amount, status, created_at) VALUES (?,?,'pending',?)").run(a.user.id, ev.sc.loan.amount, new Date().toISOString());
  return json({ ok: true, amount: ev.sc.loan.amount });
}
