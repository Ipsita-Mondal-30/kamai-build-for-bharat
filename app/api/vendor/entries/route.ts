import * as K from "@/lib/engine.ts";
import { addEntries } from "@/lib/server/ledger";
import { userToday } from "@/lib/server/rain";
import { fail, json, readJson, requireRole } from "@/lib/server/http";

export async function POST(req: Request) {
  const a = await requireRole("vendor"); if ("res" in a) return a.res;
  const b = await readJson(req), text = String(b.text || "").slice(0, 300), today = userToday(a.user);
  const date = b.date ? String(b.date) : today;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today || date < K.addDays(today, -60)) return fail("Pick a date from the last 60 days.");
  const items = K.parseVoice(text).filter((i: any) => i.amt > 0 && i.amt <= 1_000_000).slice(0, 10);
  if (!items.length) return fail("I could not find an amount. Try: 1800 ki bikri aur 1100 ka maal.");
  const added = addEntries(a.user.id, items.map((i: any) => ({ type: i.type, amt: i.amt })), date, today);
  return json({ ok: true, added, parsed: items });
}
