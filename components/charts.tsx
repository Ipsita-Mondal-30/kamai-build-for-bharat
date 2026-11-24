import { fmtD } from "@/lib/catalog";

export function Ring({ score, band, size = 170 }: { score: number; band: string; size?: number }) {
  const c = 2 * Math.PI * 52, f = (score - 300) / 600;
  const col = band === "Not lendable" ? "#d6361f" : score >= 650 ? "#1f9d55" : "#e08a00";
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <circle cx="60" cy="60" r="52" fill="none" stroke="#efe3bf" strokeWidth="12" />
        <circle cx="60" cy="60" r="52" fill="none" stroke={col} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${c * f} ${c}`} transform="rotate(-90 60 60)" />
      </svg>
      <b style={{ fontSize: size * 0.29 }}>{score}</b>
    </div>
  );
}

export function Factors({ score }: { score: any }) {
  return (
    <>
      {score.factors.map((f: any) => (
        <div className="fac" key={f.key}>
          <div className="t"><span>{f.label}</span><small>{f.note}</small></div>
          <div className="bar"><i style={{ width: Math.round(f.v * 100) + "%" }} /></div>
        </div>
      ))}
    </>
  );
}

// Daily sales bars (orange on rain-out days) with real rainfall hanging from the top.
export function SalesChart({ daily: days, rain, claimDates, height = 260, upto = Infinity }: { daily: any[]; rain: any[]; claimDates?: Set<string>; height?: number; upto?: number }) {
  const W = 960, H = height, L = 46, R = 8, T = 54, B = 26, n = rain.length;
  const X = (i: number) => L + (i * (W - L - R)) / Math.max(1, n - 1);
  const mx = Math.max(...days.map((x: any) => x.sales), 1) * 1.1;
  const Y = (v: number) => H - B - (v / mx) * (H - B - T);
  const bw = ((W - L - R) / n) * 0.72, rmax = Math.max(...rain.map((r: any) => r.rain), 10);
  const byDate: Record<string, any> = Object.fromEntries(days.map((d: any) => [d.date, d]));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Daily sales and real rainfall">
      {[0, 1, 2, 3].map(g => { const v = (mx * g) / 3; return (
        <g key={g}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="#eee1b8" /><text x={L - 6} y={Y(v) + 4} fontSize="11" textAnchor="end" fill="#777">{Math.round(v / 100) * 100}</text></g>
      ); })}
      {rain.map((r: any, i: number) => {
        if (i > upto) return null;
        const d = byDate[r.date];
        return (
          <g key={r.date}>
            {r.rain > 0.5 && <rect x={X(i) - bw / 2} y={T - 46} width={bw} height={(r.rain / rmax) * 42} fill="#7fb3ea" />}
            {d && <rect x={X(i) - bw / 2} y={Y(d.sales)} width={bw} height={H - B - Y(d.sales)} fill={claimDates?.has(r.date) ? "#ff7a00" : "#1d1a14"} rx="1.5" />}
          </g>
        );
      })}
      {rain.map((r: any, i: number) => i % 15 === 0 && <text key={"t" + i} x={X(i)} y={H - 8} fontSize="11" fill="#777" textAnchor="middle">{fmtD(r.date)}</text>)}
    </svg>
  );
}
