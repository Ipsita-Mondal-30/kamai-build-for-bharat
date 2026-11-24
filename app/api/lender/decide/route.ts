import { db } from "@/lib/server/db";
import { evaluateUser } from "@/lib/server/ledger";
import { fail, json, readJson, requireRole } from "@/lib/server/http";

export async function POST(req: Request) {
  const a = await requireRole("lender"); if ("res" in a) return a.res;
  const b = await readJson(req), d = db();
  if (!["approved", "declined"].includes(b.decision)) return fail("Bad decision.");
  const row = d.prepare(`SELECT a.id, a.status, u.id AS uid, u.city, u.biz, u.demo, u.vouches, u.util FROM applications a JOIN users u ON u.id = a.user_id WHERE a.id = ?`).get(Number(b.id)) as any;
  if (!row) return fail("Application not found.", 404);
  if (row.status !== "pending") return fail("Already decided.", 409);
  if (b.decision === "approved") { // re-check at decision time: never approve a ledger that fails verification
    const ev = await evaluateUser({ id: row.uid, city: row.city, biz: row.biz, demo: row.demo, vouches: row.vouches, util: row.util });
    if (!ev.chain.ok || ev.sc.flags.some((f: any) => f.sev === "high") || !ev.sc.loan.amount) return fail("This record fails verification and cannot be approved.", 409);
  }
  d.prepare("UPDATE applications SET status = ?, decided_at = ? WHERE id = ?").run(b.decision, new Date().toISOString(), row.id);
  return json({ ok: true });
}
