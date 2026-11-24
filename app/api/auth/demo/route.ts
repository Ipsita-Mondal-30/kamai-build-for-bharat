import { db } from "@/lib/server/db";
import { startSession } from "@/lib/server/auth";
import { DEMO_PHONES } from "@/lib/server/seed";
import { boot, fail, json, readJson } from "@/lib/server/http";

// One-click sign-in to the labelled SAMPLE accounts (fictional data), so anyone can explore without registering.
export async function POST(req: Request) {
  await boot();
  const role = (await readJson(req)).role as keyof typeof DEMO_PHONES;
  if (!DEMO_PHONES[role]) return fail("Unknown role.");
  const u = db().prepare("SELECT id FROM users WHERE phone = ? AND demo = 1").get(DEMO_PHONES[role]) as any;
  if (!u) return fail("Sample data is still loading (it needs internet for rainfall). Try again in a moment.", 503);
  await startSession(u.id);
  return json({ ok: true, role });
}
