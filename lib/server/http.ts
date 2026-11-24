import { NextResponse } from "next/server";
import { currentUser, type User } from "./auth";
import { ensureSeed } from "./seed";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const fail = (msg: string, status = 400) => json({ error: msg }, status);

export async function boot() { try { await ensureSeed(); } catch { /* offline first run: sample data appears once rainfall can be fetched */ } }

// Returns the signed-in user if they have the right role, else a ready-made error response.
export async function requireRole(role: User["role"]): Promise<{ user: User } | { res: Response }> {
  await boot();
  const user = await currentUser();
  if (!user) return { res: fail("Please log in.", 401) };
  if (user.role !== role) return { res: fail("This page is for " + role + "s.", 403) };
  return { user };
}
export async function readJson(req: Request): Promise<any> { try { return await req.json(); } catch { return {}; } }
