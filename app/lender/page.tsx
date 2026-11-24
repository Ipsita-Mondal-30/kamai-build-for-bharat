"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { fmtD, rs } from "@/lib/catalog";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { Factors } from "@/components/charts";

const flagged = (a: any) => !a.chain.ok || a.score.flags.some((f: any) => f.sev === "high");
const label = (a: any) => a.status === "approved" ? "Approved" : a.status === "declined" ? "Declined" : flagged(a) ? "Flagged" : a.score.loan.amount ? "Eligible" : "Needs more data";
const pillCls: Record<string, string> = { Approved: "p-ok", Eligible: "p-ok", Declined: "p-grey", Flagged: "p-bad", "Needs more data": "p-warn" };

export default function Lender() {
  const { data, error, reload } = useApi<{ applications: any[] }>("/api/lender/applications");
  const { toast, toastNode } = useToast();
  const [selId, setSelId] = useState<number | null>(null);
  const list = useMemo(() => (data?.applications ?? []).slice().sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1) || (a.demo ? 1 : 0) - (b.demo ? 1 : 0) || b.score.score - a.score.score), [data]);

  if (error) return <div className="app"><div className="err" style={{ display: "block" }}>{error} <Link href="/join">Log in</Link></div></div>;
  if (!data) return <div className="app"><div className="fine" style={{ textAlign: "center", padding: 60 }}>Loading applications…</div></div>;

  const v = list.find(a => a.id === selId) ?? list[0];
  async function decide(id: number, decision: string, msg: string) { try { await api("/api/lender/decide", { id, decision }); toast(msg); await reload(); } catch (e: any) { toast(e.message); } }

  return (
    <div className="app">
      <h1>Lender dashboard</h1>
      <div className="fine" style={{ color: "#3d3624" }}>Applications from vendors who chose to share their records. Every record is re-verified when you open it: chain integrity and fraud tests.</div>
      <div className="stats">
        <div className="card"><b>{list.length}</b><span>applications</span></div>
        <div className="card"><b>{list.filter(a => a.status === "pending" && label(a) === "Eligible").length}</b><span>eligible, awaiting decision</span></div>
        <div className="card"><b>{list.filter(flagged).length}</b><span>flagged for fraud or tampering</span></div>
        <div className="card"><b>{rs(list.filter(a => a.status === "approved").reduce((t, a) => t + a.score.loan.amount, 0))}</b><span>approved</span></div>
      </div>
      {!list.length ? <div className="card">No applications yet. Vendors appear here when they tap &ldquo;Apply&rdquo; in their app.</div> : (
        <div className="split">
          <div className="card">
            <table>
              <thead><tr><th>Applicant</th><th>Score</th><th>Offer</th><th>Verified</th><th>Status</th></tr></thead>
              <tbody>
                {list.map(a => (
                  <tr key={a.id} className={a.id === v.id ? "sel" : ""} onClick={() => setSelId(a.id)}>
                    <td><b>{a.applicant.name}</b> {a.demo ? <span className="pill p-grey">Sample</span> : <span className="pill p-new">Real</span>}<div className="fine">{a.applicant.biz} · {a.applicant.city}</div></td>
                    <td><span className={"sc " + (flagged(a) ? "r" : a.score.score >= 650 ? "g" : "y")}>{a.score.score}</span></td>
                    <td><b>{a.score.loan.amount ? rs(a.score.loan.amount) : "–"}</b></td>
                    <td>{Math.round(a.score.stats.coverage * 100)}%</td>
                    <td><span className={"pill " + pillCls[label(a)]}>{label(a)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Detail a={v} decide={decide} toast={toast} />
        </div>
      )}
      {toastNode}
    </div>
  );
}

function Detail({ a, decide, toast }: { a: any; decide: (id: number, d: string, m: string) => void; toast: (m: string) => void }) {
  const s = a.score, L = s.loan, bad = flagged(a), done = a.status !== "pending", col = L.amount && !bad ? "var(--green)" : "var(--red)";
  return (
    <div className="paper" style={{ position: "sticky", top: 76 }}>
      <div style={{ position: "absolute", right: 18, top: 16, border: `3px solid ${col}`, color: col, padding: "2px 10px", fontWeight: 900, letterSpacing: 2, transform: "rotate(6deg)", borderRadius: 8, background: "#fff", fontSize: 14 }}>
        {bad ? "DO NOT LEND" : L.amount ? "ELIGIBLE" : "NOT YET"}
      </div>
      <h3 style={{ fontSize: 24 }}>{a.applicant.name}</h3>
      <div className="fine">{a.applicant.biz} · {a.applicant.city} · {a.daysLogged} days of records{a.demo ? " · sample data" : ""}</div>
      <div className="kv">
        <div><b>{s.score}</b><span>Kamai score · {s.band}</span></div>
        <div><b>{L.amount ? rs(L.amount) : "₹0"}</b><span>loan offer · 12 mo @ 18%</span></div>
        <div><b>{L.amount ? rs(L.emi) : "–"}</b><span>EMI (≤35% stressed income)</span></div>
      </div>
      <div className="chk"><i>{a.chain.ok ? "✅" : "❌"}</i><div><b>Ledger integrity</b> {a.chain.ok ? <>all {a.chain.length} entries chain · head <span className="fp">{a.chain.head.slice(0, 10)}</span></> : <span style={{ color: "var(--red)" }}>broken at entry #{a.chain.brokenAt} ({a.chain.date})</span>}</div></div>
      {s.flags.filter((f: any) => f.name !== "Ledger tampered").map((f: any) => <div className="chk" key={f.name}><i>{f.sev === "high" ? "❌" : "⚠️"}</i><div><b>{f.name}</b> · {f.detail}</div></div>)}
      {!s.flags.length && <div className="chk"><i>✅</i><div><b>Plausibility checks</b> cost-to-sales, copy-paste, back-fill all passed</div></div>}
      <div className="chk"><i>ℹ️</i><div><b>Verification</b> {Math.round(s.stats.coverage * 100)}% of money is independently verified (UPI / receipts). {a.demo ? "" : "Real vendors are self-reported until a bank link is connected."}</div></div>
      {a.baseLoanAmount !== L.amount && !bad && <div className="chk"><i>🌧️</i><div><b>Insured against rain-outs</b> · offer {rs(a.baseLoanAmount)} → {rs(L.amount)} because payouts lift the weakest weeks</div></div>}
      <div style={{ marginTop: 12 }}><Factors score={s} /></div>
      <details style={{ marginTop: 10 }}>
        <summary className="fine" style={{ cursor: "pointer" }}>Latest ledger entries</summary>
        {a.latest.map((e: any) => <div className="ent" key={e.id}><span className={"tag " + e.type}>{e.type}</span><div>{fmtD(e.date)} · {rs(e.amt)} <span className="fine">{e.src}</span></div><span className="fp">#{e.id} {e.hash.slice(0, 8)}</span></div>)}
      </details>
      <div className="row2" style={{ marginTop: 16 }}>
        <button className="btn sm" disabled={done || bad || !L.amount} onClick={() => decide(a.id, "approved", `Approved ${rs(L.amount)} for ${a.applicant.name}. Disbursal to UPI (simulated).`)}>Approve {L.amount ? rs(L.amount) : ""}</button>
        <button className="btn sm ghost" disabled={done} onClick={() => decide(a.id, "declined", "Declined")}>Decline</button>
        <button className="btn sm pink" onClick={() => toast(a.chain.ok ? `Verified: all ${a.chain.length} entries intact` : `FAILED at entry #${a.chain.brokenAt} (${fmtD(a.chain.date)})`)}>Verify ledger</button>
      </div>
    </div>
  );
}
