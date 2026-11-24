import { currentUser } from "@/lib/server/auth";
import { boot, json } from "@/lib/server/http";
import { BIZ } from "@/lib/catalog";

export async function GET() {
  await boot();
  const u = await currentUser();
  return json({ user: u ? { name: u.name, role: u.role, city: u.city, biz: u.biz ? BIZ[u.biz]?.label : null, demo: !!u.demo } : null });
}
