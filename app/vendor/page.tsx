"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { fmtD, rs } from "@/lib/catalog";
import { listen, speak } from "@/lib/voice";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { Factors, Ring, SalesChart } from "@/components/charts";
import { useLang } from "@/lib/i18n";

const SAMPLES = ["आज 1800 की बिक्री हुई और 1100 का माल लिया", "aaj 2 hazaar ki bikri aur 800 ka doodh liya", "gas cylinder 1150"];
const HI: Record<string, string> = { sale: "बिक्री", purchase: "माल", expense: "ख़र्च" };
const TABS = [["today", "🎤", "tabToday"], ["score", "📊", "tabScore"], ["loan", "💰", "tabLoan"], ["rain", "🌧️", "tabRain"]] as const;
const addDays = (s: string, n: number) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export default function VendorApp() {
  const { data: S, error, reload } = useApi<any>("/api/vendor/summary");
  const { toast, toastNode } = useToast();
  const { t, toggle } = useLang();
  const [tab, setTab] = useState("today");
  const [say, setSay] = useState("");
  const [date, setDate] = useState("");
  const [rec, setRec] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pkg, setPkg] = useState<string | null>(null);

  async function record(text = say) {
    const t = text.trim(); if (!t || busy) return;
    setBusy(true);
    try {
      const r = await api("/api/vendor/entries", { text: t, date: date || undefined });
      speak(r.parsed.map((i: any) => `${i.amt} रुपये ${HI[i.type]} दर्ज किया`).join(", "));
      setSay(""); await reload();
    } catch (e: any) { toast(e.message); } finally { setBusy(false); }
  }
  async function apply() {
    try { const r = await api("/api/vendor/apply", {}); speak("आवेदन भेज दिया गया"); toast(`Application for ${rs(r.amount)} sent to lender`); await reload(); } catch (e: any) { toast(e.message); }
  }
  async function fileClaims() {
    try {
      const r = await api("/api/vendor/claims", {});
      const x = S.claims.items[0];
      setPkg(`CLAIM PACKAGE · Barish Suraksha\n${S.claims.items.length} rain-out days · ${rs(S.claims.total)}\n\nExample ${x.date}\n Rain (Open-Meteo)  ${x.rain.toFixed(1)} mm\n Usual sales        ${rs(x.expected)}\n Actual sales       ${rs(x.actual)}\n Payout             ${rs(x.payout)}\n Ledger proof       #${x.ledgerRefs.map((q: any) => q.id + ":" + q.hash.slice(0, 6)).join(" #")}\n\nStatus: PRE-VALIDATED · sent to insurer`);
      speak(`${r.filed + r.already} दावे भेज दिए गए`); toast(r.filed ? `${r.filed} new claims filed` : "Already filed"); await reload();
    } catch (e: any) { toast(e.message); }
  }

  if (error) return <div className="app"><div className="err" style={{ display: "block" }}>{error} <Link href="/join">Log in</Link></div></div>;
  if (!S) return <div className="app"><div className="fine" style={{ textAlign: "center", padding: 60 }}>{t("loading")}</div></div>;

  const s = S.score, L = s.loan, c = S.claims, today = S.today;
  const td = S.daily.find((x: any) => x.date === today) || { sales: 0, purchases: 0, expenses: 0 };
  const left = Math.max(0, S.minDays - S.daysLogged), app = S.application;
  const chain = S.chain.ok;

  return (
    <div className="app" style={{ maxWidth: 520, paddingBottom: 0 }}>
      <div className="phoneapp">
        <div className="bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}><div><b>{t("hello", { n: S.user.name.split(" ")[0] })}</b><small>{S.user.biz} · {S.user.city}{S.user.demo ? t("sampleAcct") : ""}</small></div><button className="btn sm ghost" onClick={toggle} aria-label="Switch language / भाषा बदलें">{t("lang")}</button></div>

        {tab === "today" && (
          <div className="page">
            <button className={"bigmic" + (rec ? " rec" : "")} title={t("mic")} aria-label={t("mic")} onClick={() => listen(t => { setSay(t); record(t); }, setRec)}>🎤</button>
            <p style={{ textAlign: "center", margin: "0 0 12px", fontWeight: 700 }}>{t("sayPrompt")}</p>
            <div className="row">
              <input type="text" aria-label={t("ph")} value={say} onChange={e => setSay(e.target.value)} onKeyDown={e => e.key === "Enter" && record()} placeholder={t("ph")} />
              <button className="btn sm" disabled={busy} onClick={() => record()}>{t("save")}</button>
            </div>
            <div className="row" style={{ marginTop: 10, gap: 8 }}>
              <label className="fine" htmlFor="forday">{t("forDay")}</label>
              <input id="forday" type="date" className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 15 }} value={date || today} max={today} min={addDays(today, -60)} onChange={e => setDate(e.target.value === today ? "" : e.target.value)} />
              {date && <span className="fine">{t("backfilled")}</span>}
            </div>
            <div className="chips">{SAMPLES.map(t => <button key={t} onClick={() => record(t)}>{t}</button>)}</div>
            <h3 style={{ margin: "22px 0 4px" }}>{t("today")} · {fmtD(today)}</h3>
            <div className="stats" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "8px 0" }}>
              <div className="card"><b>{rs(td.sales)}</b><span>{t("sales")}</span></div>
              <div className="card"><b>{rs(td.purchases + td.expenses)}</b><span>{t("stock")}</span></div>
              <div className="card"><b>{rs(td.sales - td.purchases - td.expenses)}</b><span>{t("earned")}</span></div>
            </div>
            {S.recent.length ? S.recent.map((e: any) => (
              <div className="ent" key={e.id}><span className={"tag " + e.type}>{HI[e.type]}</span><div><b>{rs(e.amt)}</b> <span className="fine">{fmtD(e.date)}</span></div><span className="fp">🔒 {e.hash.slice(0, 8)}</span></div>
            )) : <div className="fine" style={{ textAlign: "center", padding: 10 }}>{t("nothing")}</div>}
            <p className="fine" style={{ marginTop: 10 }}>{t("entriesLine", { n: S.totalEntries })}{chain ? t("intact") : t("failedChain")}</p>
          </div>
        )}

        {tab === "score" && (
          <div className="page">
            {!S.ready && <div className="card" style={{ background: "#fff", marginBottom: 14 }}><b>{t("building")}</b><div className="prog"><i style={{ width: (S.daysLogged / S.minDays) * 100 + "%" }} /></div><div className="fine">{t("progress", { d: S.daysLogged, m: S.minDays, l: left })}</div></div>}
            <div style={{ textAlign: "center" }}><Ring score={s.score} band={s.band} size={170} /></div>
            <div style={{ textAlign: "center", fontWeight: 800, fontSize: 20 }}>{s.band}</div>
            <div style={{ marginTop: 12 }}><Factors score={s} /></div>
            {s.flags.length > 0 && s.flags.map((f: any) => <div className="chk" key={f.name}><i>{f.sev === "high" ? "❌" : "⚠️"}</i><div><b>{f.name}</b> · {f.detail}</div></div>)}
            <h3 style={{ margin: "18px 0 0" }}>{t("yourSales")}</h3>
            <div className="fine" style={{ marginBottom: 4 }}>{t("orangeNote", { c: S.user.city })}</div>
            <SalesChart daily={S.daily} rain={S.rain} claimDates={new Set(c.items.map((x: any) => x.date))} height={230} />
            <p className="fine" style={{ marginTop: 8 }}>{t("aaNote")}</p>
          </div>
        )}

        {tab === "loan" && (
          <div className="page">
            <div className="card" style={{ background: "#fff" }}>
              <small style={{ textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, color: "var(--mut)" }}>{t("canBorrow")}</small>
              <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: "-.05em", color: S.ready && L.amount ? "var(--green)" : "var(--mut)", lineHeight: 1.1 }}>{L.amount ? rs(L.amount) : "₹0"}</div>
              <div className="fine">{L.amount ? t("loanDesc") : S.ready ? t("loanNoReady") : t("unlocks", { m: S.minDays, l: left })}</div>
            </div>
            {!S.ready && <div className="prog"><i style={{ width: (S.daysLogged / S.minDays) * 100 + "%" }} /></div>}
            {L.amount > 0 && <div className="stats" style={{ gridTemplateColumns: "1fr 1fr", margin: "14px 0" }}>
              <div className="card"><b>{rs(L.emi)}</b><span>{t("emi")}</span></div>
              <div className="card"><b>{Math.round(s.stats.coverage * 100)}%</b><span>{t("verified")}</span></div>
            </div>}
            {S.baseLoanAmount < L.amount && <div className="fine" style={{ marginBottom: 12 }}>{t("rainAdds", { a: rs(L.amount - S.baseLoanAmount), b: rs(S.baseLoanAmount) })}</div>}
            <button className="btn" style={{ width: "100%" }} disabled={!L.amount || app?.status === "pending"} onClick={apply}>{app?.status === "pending" ? t("sent") : t("apply")}</button>
            <p className="fine" style={{ marginTop: 8 }}>{t("shareNote")}</p>
            {app && <div className="card" style={{ marginTop: 14, background: app.status === "approved" ? "#e3f8e9" : app.status === "declined" ? "#fde8e1" : "#fff8dc" }}>
              <b>{app.status === "approved" ? t("approved") : app.status === "declined" ? t("declined") : t("withLender")}: {rs(app.amount)}</b>
              <div className="fine">{app.status === "pending" ? <>{t("sentOn", { d: fmtD(S.today) })}{S.user.demo && <> <Link href="/join">{t("openSampleLender")}</Link></>}</> : t("decisionDone")}</div>
            </div>}
          </div>
        )}

        {tab === "rain" && (
          <div className="page">
            <div className="card" style={{ background: "#fff" }}>
              <small style={{ textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, color: "var(--mut)" }}>{t("rainTitle")}</small>
              <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-.05em", color: "var(--green)", lineHeight: 1.1 }}>{rs(c.total)}</div>
              <div className="fine">{c.items.length ? t("rainSome", { n: c.items.length }) : t("rainNone", { c: S.user.city })}</div>
            </div>
            <div style={{ margin: "10px 0" }}>
              {c.items.map((x: any) => (
                <div className="cl" key={x.date}><div className="mm">{x.rain.toFixed(0)} mm<small>{fmtD(x.date)}</small></div><div style={{ fontSize: 14 }}>{t("soldUsually", { a: rs(x.actual), b: rs(x.expected) })}{S.filedDates.includes(x.date) && <div className="fine">{t("filed")}</div>}</div><div className="pay" style={{ fontSize: 18 }}>{rs(x.payout)}</div></div>
              ))}
            </div>
            <button className="btn" style={{ width: "100%" }} disabled={!c.items.length || c.items.every((x: any) => S.filedDates.includes(x.date))} onClick={fileClaims}>{t("fileAll")}</button>
            <p className="fine" style={{ marginTop: 8 }}>{t("claimNote")}</p>
            {pkg && <div className="pkg" style={{ fontSize: 12 }}>{pkg}</div>}
          </div>
        )}

        <div className="tabs" role="tablist">
          {TABS.map(([k, ic, label]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}><span aria-hidden="true">{ic}</span>{t(label)}</button>)}
        </div>
      </div>
      {toastNode}
    </div>
  );
}
