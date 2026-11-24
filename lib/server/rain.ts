// Real rainfall (Open-Meteo: ERA5 archive + recent forecast-model analysis), cached in SQLite.
import { CITIES } from "../catalog";
import { addDays } from "../engine.ts";
import { db } from "./db";

export const todayIST = () => new Date(Date.now() + 5.5 * 36e5).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

async function fetchRange(lat: number, lon: number, s: string, e: string): Promise<{ date: string; mm: number }[]> {
  const out: { date: string; mm: number }[] = [], today = todayIST();
  const q = "&daily=precipitation_sum&timezone=Asia%2FKolkata";
  const get = async (url: string) => {
    const r = await fetch(url, { cache: "no-store" }); if (!r.ok) throw new Error("Rain service " + r.status);
    const j = await r.json(); j.daily.time.forEach((t: string, i: number) => out.push({ date: t, mm: j.daily.precipitation_sum[i] ?? 0 }));
  };
  const archiveEnd = e < addDays(today, -7) ? e : addDays(today, -7);
  if (s <= archiveEnd) await get(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${s}&end_date=${archiveEnd}${q}`);
  if (e > archiveEnd) {
    const from = addDays(archiveEnd, 1), past = Math.min(92, Math.max(0, daysBetween(from, today)));
    const before = out.length;
    await get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&past_days=${past}&forecast_days=1${q}`);
    // keep only what we asked for from the forecast response
    const keep = out.slice(before).filter(x => x.date >= from && x.date <= e); out.length = before; out.push(...keep);
  }
  return out;
}

// Returns one {date, rain} per day in [start, end]; missing days (offline) are 0.
export async function getRain(cityName: string, start: string, end: string): Promise<{ date: string; rain: number }[]> {
  const city = CITIES.find(c => c.name === cityName); if (!city) throw new Error("Unknown city " + cityName);
  const d = db(), have = new Map<string, number>();
  for (const r of d.prepare("SELECT date, mm FROM rain WHERE city = ? AND date BETWEEN ? AND ?").all(cityName, start, end) as any[]) have.set(r.date, r.mm);
  const need: string[] = []; for (let t = start; t <= end; t = addDays(t, 1)) if (!have.has(t)) need.push(t);
  if (need.length) {
    try {
      const got = await fetchRange(city.lat, city.lon, need[0], end), today = todayIST(), ins = d.prepare("INSERT OR REPLACE INTO rain (city, date, mm) VALUES (?, ?, ?)");
      for (const g of got) { have.set(g.date, g.mm); if (g.date < today) ins.run(cityName, g.date, g.mm); } // today's value is still changing: don't persist
    } catch (e) { console.error("rain fetch failed:", (e as Error).message); }
  }
  const out = []; for (let t = start; t <= end; t = addDays(t, 1)) out.push({ date: t, rain: have.get(t) ?? 0 });
  return out;
}
