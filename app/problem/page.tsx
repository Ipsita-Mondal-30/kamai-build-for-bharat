"use client";
import Link from "next/link";
import { useState } from "react";
import { rs } from "@/lib/catalog";

// Standard EMI: principal P, monthly rate r, n months.
const emi = (P: number, r: number, n: number) => (r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n)));

const SRC = {
  svanidhi: "https://eparlib.sansad.in/bitstream/123456789/3018433/1/AU3010_uAj8qs.pdf",
  svaExt: "https://www.businesstoday.in/latest/economy/story/cabinet-extends-pm-svanidhi-scheme-till-2030-approves-rs-7332-crore-outlay-491294-2025-08-27",
  msme: "https://www.entrepreneur.com/en-in/news-and-trends/indias-inr-80-lakh-crore-credit-problem-for-msmes/491098",
  policy: "https://PRSINDIA.org/files/bills_acts/bills_parliament/2005/bill82_2006123082_National_Policy_for_Urban_Street_Vendors.pdf",
  ifc: "https://www.ifc.org/en/insights-reports/2019/financing-indias-msmes-estimation-of-debt-requirement-of-msmes-in-india",
};

const GAPS: [string, string, string][] = [
  ["Bank loan", "Wants income proof, bank statements, a credit history. A cash vendor has none, so the answer is no.", "A record built from her own voice that a lender can verify."],
  ["PM SVANidhi", "A small first loan for vendors the municipality recognises, with a flat amount that does not depend on how the business actually performs. No cover when the rains empty the stall.", "Grows with a verified record, and adds rain-out cover. Complements SVANidhi: a record can support the next, larger tranche."],
  ["Digital ledger apps", "Record sales, but entries are typically editable by the user, so a lender cannot tell a real record from an invented one.", "Every entry is hash-chained on the server; edits are detectable; fraud checks flag inflated books."],
  ["Local moneylender", "Always available, no paperwork, but expensive and open-ended.", "A formal, priced loan the vendor qualifies for through her own record."],
  ["Crop / weather insurance", "Built for farms, with assessors and forms. Nothing sized for a stall that loses a day's sales to rain.", "Parametric: real rainfall + a verified sales drop pays out automatically. No assessor, no bills."],
];

export default function Problem() {
  const [loan, setLoan] = useState(33000);
  const [mrate, setMrate] = useState(3); // illustrative, editable
  const n = 12, bank = emi(loan, 0.18 / 12, n) * n - loan, lender = emi(loan, mrate / 100, n) * n - loan;
  const save = Math.max(0, lender - bank);

  return (
    <div className="app" style={{ maxWidth: 940 }}>
      <span className="kick">The problem</span>
      <h1 style={{ textAlign: "center", fontSize: "clamp(32px,5vw,54px)", lineHeight: 1.05 }}>Millions of small sellers earn every day and have nothing a bank can read.</h1>
      <p className="lead">No paper trail means no loan, no insurance, and no way to grow. Here is who is affected, what they do today, and where the existing options stop short.</p>

      <div className="stats">
        <div className="card"><b>~1 crore</b><span>street vendors nationwide, per the 2009 National Policy (estimates vary widely by source) <a href={SRC.policy}>[1]</a></span></div>
        <div className="card"><b>~19%</b><span>of MSME credit demand was met formally by FY21 (secondary coverage of a NITI/IFC-linked study) <a href={SRC.msme}>[2]</a></span></div>
        <div className="card"><b>~75%</b><span>of MSMEs still rely on informal credit, per the same coverage <a href={SRC.msme}>[2]</a></span></div>
        <div className="card"><b>68.9 lakh</b><span>vendors reached by PM SVANidhi by Nov 2025, ₹14,595 crore across 99 lakh loans <a href={SRC.svanidhi}>[3]</a></span></div>
      </div>
      <p className="fine">SVANidhi is real progress. It was extended to 2030 with first-tranche loans raised to ₹15,000 <a href={SRC.svaExt}>[4]</a>. Kamai is not a replacement. It targets what stays out of reach: loans sized to the business, and protection when a day&apos;s income disappears.</p>

      <h2 style={{ marginTop: 40 }}>Who we built this for</h2>
      <div className="card"><b>Savitri sells tea and snacks in Gorakhpur.</b> ₹1,500 on a good day, all cash, nothing written down. Banks cannot underwrite her. When the monsoon empties her stall for a week she still owes her supplier. Her story is the demo; the users are tea stalls, vegetable and fruit carts, flower sellers, chaat vendors and tiny kirana shops in tier-2 and tier-3 cities.</div>

      <h2 style={{ marginTop: 40 }}>Why existing options fall short</h2>
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Option</th><th>Where it stops short</th><th>What Kamai does</th></tr></thead>
          <tbody>{GAPS.map(([a, b, c]) => <tr key={a} style={{ cursor: "default" }}><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>)}</tbody>
        </table>
        <p className="fine">The comparison with ledger apps and moneylenders is our own analysis, not a measured study.</p>
      </div>

      <h2 style={{ marginTop: 40 }}>What the value looks like</h2>
      <p className="lead" style={{ margin: "0 auto 14px" }}>A formal loan at the demo rate (18% a year) against an informal one. Move the sliders. The moneylender rate is an <b>illustrative assumption</b>, not a sourced figure: set it to what vendors you know actually pay.</p>
      <div className="card">
        <div className="row2" style={{ gap: 24 }}>
          <label style={{ flex: 1, minWidth: 220 }}><b>Loan: {rs(loan)}</b><input type="range" min={5000} max={50000} step={1000} value={loan} onChange={e => setLoan(+e.target.value)} style={{ width: "100%" }} /></label>
          <label style={{ flex: 1, minWidth: 220 }}><b>Moneylender rate: {mrate}% per month (assumed)</b><input type="range" min={0} max={10} step={0.5} value={mrate} onChange={e => setMrate(+e.target.value)} style={{ width: "100%" }} /></label>
        </div>
        <div className="stats" style={{ margin: "14px 0 0" }}>
          <div className="card"><b>{rs(bank)}</b><span>total interest over 12 months at 18% a year</span></div>
          <div className="card"><b>{rs(lender)}</b><span>total interest at {mrate}% a month</span></div>
          <div className="card" style={{ background: "var(--deep, #0e3a28)", color: "#fff" }}><b>{rs(save)}</b><span style={{ color: "#cfe" }}>interest saved on this one loan</span></div>
          <div className="card"><b>₹9,570</b><span>rain-out payouts for the sample stall in one monsoon season (simulated, real rainfall)</span></div>
        </div>
      </div>

      <h2 style={{ marginTop: 40 }}>Path to real adoption</h2>
      <div className="how">
        <div className="card"><h3 style={{ fontSize: 26 }}>1 · Pilot</h3><p>A few hundred vendors in two cities, with one NBFC or microfinance partner. Goal: prove the score predicts repayment and calibrate it.</p></div>
        <div className="card"><h3 style={{ fontSize: 26 }}>2 · Connect</h3><p>Bank data through an Account Aggregator, supplier receipts read from photos, and a licensed insurer for the rain cover. Verification moves from self-reported to independent.</p></div>
        <div className="card"><h3 style={{ fontSize: 26 }}>3 · Scale</h3><p>Reach vendors where they already are: WhatsApp and phone calls in their language. Lenders pay a small fee per verified application; vendors stay free. A verified record can also help a vendor graduate to larger SVANidhi tranches.</p></div>
      </div>

      <div className="row" style={{ justifyContent: "center", margin: "34px 0 10px" }}>
        <Link className="btn" href="/join">Try it as a vendor</Link>
        <Link className="btn ghost" href="/join">Explore sample data</Link>
      </div>
      <h3 style={{ marginTop: 30 }}>Sources</h3>
      <ol className="fine">
        <li><a href={SRC.policy}>National Policy for Urban Street Vendors (2009)</a>, ~1 crore estimate; counts vary by source and registration is far lower.</li>
        <li><a href={SRC.msme}>Entrepreneur India coverage</a> of formal credit coverage for MSMEs (secondary source; verify against NITI Aayog / IFC originals, e.g. the <a href={SRC.ifc}>IFC 2019 report</a>).</li>
        <li><a href={SRC.svanidhi}>Parliamentary reply (Lok Sabha) on PM SVANidhi</a>, figures as on 19 Nov 2025.</li>
        <li><a href={SRC.svaExt}>Business Today</a>: Cabinet extends PM SVANidhi to 2030.</li>
      </ol>
    </div>
  );
}
