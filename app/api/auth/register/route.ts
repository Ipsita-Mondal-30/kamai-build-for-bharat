import { db } from "@/lib/server/db";
import { hashPin, startSession, tooManyTries } from "@/lib/server/auth";
import { boot, fail, json, readJson } from "@/lib/server/http";
import { BIZ, CITIES } from "@/lib/catalog";

const CODES = { lender: process.env.KAMAI_LENDER_CODE || "LENDER-DEMO", insurer: process.env.KAMAI_INSURER_CODE || "INSURER-DEMO" };

export async function POST(req: Request) {
  await boot();
  const b = await readJson(req);
  const role = b.role, name = String(b.name || "").trim(), phone = String(b.phone || "").replace(/\s|\+91|^0/g, ""), pin = String(b.pin || "");
  if (!["vendor", "lender", "insurer"].includes(role)) return fail("Choose who you are.");
  if (name.length < 2 || name.length > 60) return fail("Please enter your name.");
  if (!/^[6-9]\d{9}$/.test(phone)) return fail("Enter a 10-digit mobile number.");
  if (!/^\d{4,6}$/.test(pin)) return fail("PIN must be 4 to 6 digits.");
  if (tooManyTries("reg:" + phone)) return fail("Too many attempts. Try again in a few minutes.", 429);
  let city: string | null = null, biz: string | null = null;
  if (role === "vendor") {
    if (!CITIES.some(c => c.name === b.city)) return fail("Choose your city.");
    if (!BIZ[b.biz]) return fail("Choose your business.");
    city = b.city; biz = b.biz;
  } else if (String(b.code || "").trim() !== CODES[role as "lender" | "insurer"]) return fail("That access code is not valid.", 403);
  const d = db();
  if (d.prepare("SELECT 1 FROM users WHERE phone = ?").get(phone)) return fail("This number is already registered. Please log in.", 409);
  const { salt, hash } = hashPin(pin);
  const r = d.prepare("INSERT INTO users (role, name, phone, pin_salt, pin_hash, city, biz, demo, created_at) VALUES (?,?,?,?,?,?,?,0,?)").run(role, name, phone, salt, hash, city, biz, new Date().toISOString());
  await startSession(Number(r.lastInsertRowid));
  return json({ ok: true, role });
}
