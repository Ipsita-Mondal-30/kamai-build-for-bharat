import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { DATA_DIR, db } from "./db";

export type User = { id: number; role: "vendor" | "lender" | "insurer"; name: string; phone: string; city: string | null; biz: string | null; demo: number; vouches: number; util: number };

function secret(): string {
  if (process.env.KAMAI_SECRET) return process.env.KAMAI_SECRET;
  const f = path.join(DATA_DIR, "secret");
  try { return fs.readFileSync(f, "utf8"); } catch { /* create below */ }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const s = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(f, s, { mode: 0o600 });
  return s;
}

export function hashPin(pin: string, salt = crypto.randomBytes(16).toString("hex")) {
  return { salt, hash: crypto.scryptSync(pin, salt, 32).toString("hex") };
}
export function checkPin(pin: string, salt: string, hash: string) {
  const a = Buffer.from(crypto.scryptSync(pin, salt, 32).toString("hex")), b = Buffer.from(hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const sign = (v: string) => crypto.createHmac("sha256", secret()).update(v).digest("hex");
const COOKIE = "kamai_session";

export async function startSession(userId: number) {
  const exp = Date.now() + 30 * 864e5, v = `${userId}.${exp}`;
  (await cookies()).set(COOKIE, `${v}.${sign(v)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.KAMAI_INSECURE_COOKIES !== "1", path: "/", maxAge: 30 * 86400 });
}
export async function endSession() { (await cookies()).delete(COOKIE); }

export async function currentUser(): Promise<User | null> {
  const raw = (await cookies()).get(COOKIE)?.value; if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  const ok = sig && crypto.timingSafeEqual(Buffer.from(sign(`${id}.${exp}`)), Buffer.from(sig.padEnd(64, "0").slice(0, 64)));
  if (!ok || Date.now() > Number(exp)) return null;
  return (db().prepare("SELECT id, role, name, phone, city, biz, demo, vouches, util FROM users WHERE id = ?").get(Number(id)) as User) || null;
}

// Very small in-memory brute-force guard: 6 attempts per phone per 10 minutes.
const tries = new Map<string, { n: number; t: number }>();
export function tooManyTries(phone: string) {
  const now = Date.now(), r = tries.get(phone);
  if (!r || now - r.t > 6e5) { tries.set(phone, { n: 1, t: now }); return false; }
  r.n++; return r.n > 6;
}
export function clearTries(phone: string) { tries.delete(phone); }
