import { db } from "@/lib/server/db";
import { checkPin, clearTries, startSession, tooManyTries } from "@/lib/server/auth";
import { boot, fail, json, readJson } from "@/lib/server/http";

export async function POST(req: Request) {
  await boot();
  const b = await readJson(req), phone = String(b.phone || "").replace(/\s|\+91|^0/g, ""), pin = String(b.pin || "");
  if (tooManyTries("login:" + phone)) return fail("Too many attempts. Try again in a few minutes.", 429);
  const u = db().prepare("SELECT id, role, pin_salt, pin_hash FROM users WHERE phone = ?").get(phone) as any;
  if (!u || !checkPin(pin, u.pin_salt, u.pin_hash)) return fail("Wrong number or PIN.", 401);
  clearTries("login:" + phone);
  await startSession(u.id);
  return json({ ok: true, role: u.role });
}
