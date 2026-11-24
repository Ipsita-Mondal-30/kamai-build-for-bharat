import * as K from "@/lib/engine.ts";
import { db } from "@/lib/server/db";
import { getEntries } from "@/lib/server/ledger";
import { json, requireRole } from "@/lib/server/http";

// Marks validated claims paid. (Simulation: no money moves. A real insurer would call its payout system here.)
export async function POST() {
  const a = await requireRole("insurer"); if ("res" in a) return a.res;
  const d = db(), rows = d.prepare("SELECT c.id, c.user_id, c.payout FROM claims c WHERE c.status = 'filed'").all() as any[];
  const ok: Record<number, boolean> = {}; let n = 0, total = 0;
  for (const r of rows) {
    if (!(r.user_id in ok)) ok[r.user_id] = K.verifyChain(getEntries(r.user_id)).ok;
    if (!ok[r.user_id]) continue;
    d.prepare("UPDATE claims SET status = 'paid' WHERE id = ?").run(r.id); n++; total += r.payout;
  }
  return json({ ok: true, paid: n, total });
}
