"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { fmtD, rs } from "@/lib/catalog";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";

export default function Insurer() {
  const { data, error, reload } = useApi<{ vendors: number; claims: any[] }>("/api/insurer/claims");
  const { toast, toastNode } = useToast();
  const [shown, setShown] = useState(12);

  if (error) return <div className="app"><div className="err" style={{ display: "block" }}>{error} <Link href="/join">Log in</Link></div></div>;
  if (!data) return <div className="app"><div className="fine" style={{ textAlign: "center", padding: 60 }}>Loading claims…</div></div>;

  const rows = data.claims, ok = rows.filter(r => !r.held), held = rows.filter(r => r.held);
  const open = ok.filter(r => r.status === "filed"), due = open.reduce((a, r) => a + r.payout, 0);
  const allPay = ok.reduce((a, r) => a + r.payout, 0), breakEven = data.vendors ? allPay / data.vendors / 3 : 0;
  const byCity: Record<string, number> = {}; for (const r of ok) byCity[r.city] = (byCity[r.city] || 0) + r.payout;
  const mx = Math.max(...Object.values(byCity), 1);

  async function payAll() { try { const r = await api("/api/insurer/pay", {}); toast(`Paid ${r.paid} claims · ${rs(r.total)} to vendors' UPI (simulated). Held claims stay for review.`); await reload(); } catch (e: any) { toast(e.message); } }

  return (
    <div className="app">
      <h1>Insurer console · Barish Suraksha</h1>
      <div className="fine" style={{ color: "#3d3624" }}>Parametric rain-out cover for street vendors. A claim is valid only when real rainfall at the vendor&apos;s location AND a sales drop in a verified ledger both hold. Chains are re-verified every time you open this page.</div>
      <div className="stats">
        <div className="card"><b>{open.length}</b><span>claims awaiting payment</span></div>
        <div className="card"><b>{rs(due)}</b><span>payout due</span></div>
        <div className="card"><b>{held.length}</b><span>held: ledger failed integrity</span></div>
        <div className="card"><b>{rs(breakEven)}</b><span>break-even premium / vendor / month</span></div>
      </div>
      {!rows.length ? <div className="card">No claims yet. They appear when a vendor files after a rain-out day.</div> : (
        <div className="split">
          <div className="card">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
              <b style={{ fontSize: 20 }}>Claims queue</b>
              <button className="btn sm" disabled={!open.length} onClick={payAll}>Approve &amp; pay all validated</button>
            </div>
            <table>
              <thead><tr><th>Date</th><th>Vendor</th><th>Rain</th><th>Sales vs usual</th><th>Payout</th><th>Status</th></tr></thead>
              <tbody>
                {rows.slice(0, shown).map(r => (
                  <tr key={r.id}>
                    <td>{fmtD(r.date)}</td>
                    <td><b>{r.vendor}</b> {r.demo ? <span className="pill p-grey">Sample</span> : <span className="pill p-new">Real</span>}<div className="fine">{r.city}</div></td>
                    <td><span className="pill" style={{ background: "#cfe8fb" }}>{r.rain.toFixed(0)} mm</span></td>
                    <td>{rs(r.actual)} <span className="fine">vs {rs(r.expected)}</span></td>
                    <td><b>{rs(r.payout)}</b></td>
                    <td><span className={"pill " + (r.held ? "p-bad" : r.status === "paid" ? "p-ok" : "p-warn")}>{r.held ? "Held" : r.status === "paid" ? "Paid" : "Validated"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown < rows.length && <div className="row" style={{ justifyContent: "center", marginTop: 10 }}><button className="btn sm ghost" onClick={() => setShown(shown + 15)}>Show more</button></div>}
          </div>
          <div>
            <div className="card">
              <b style={{ fontSize: 20 }}>Payout by city</b>
              <div style={{ marginTop: 10 }}>
                {Object.entries(byCity).sort((a, b) => b[1] - a[1]).map(([c, v]) => (
                  <div key={c} style={{ display: "grid", gridTemplateColumns: "96px 1fr 64px", gap: 8, alignItems: "center", margin: "6px 0", fontSize: 14 }}>
                    <span>{c}</span>
                    <div style={{ background: "#efe3bf", border: "2px solid var(--ink)", borderRadius: 8, height: 16, overflow: "hidden" }}><i style={{ display: "block", height: "100%", width: (v / mx) * 100 + "%", background: "var(--org)" }} /></div>
                    <b>{rs(v)}</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <b style={{ fontSize: 20 }}>Why no assessor?</b>
              <ul className="fine">
                <li>Rainfall is read from a public weather record at the vendor&apos;s coordinates, not self-reported.</li>
                <li>Sales loss comes from a hash-chained ledger. If the chain is broken the claim is held, not paid.</li>
                <li>Payout = 70% of the sales shortfall, max ₹800/day, 4 days/month.</li>
                <li><b>Honest note:</b> this is the monsoon quarter, the worst three months. The break-even premium above is far more than a vendor can pay, so a pilot would fund the cover through the loan (the lender benefits from lower defaults) or a subsidy, and average it over dry months too.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      {toastNode}
    </div>
  );
}
