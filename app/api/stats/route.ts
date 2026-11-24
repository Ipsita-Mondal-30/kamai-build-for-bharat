import { db } from "@/lib/server/db";
import { boot, json } from "@/lib/server/http";

export async function GET() {
  await boot();
  const d = db(), n = (q: string) => (d.prepare(q).get() as any).n;
  return json({ vendors: n("SELECT COUNT(*) n FROM users WHERE role='vendor'"), entries: n("SELECT COUNT(*) n FROM entries"), claims: n("SELECT COUNT(*) n FROM claims"), applications: n("SELECT COUNT(*) n FROM applications") });
}
