"use client";
import Link from "next/link";
import CartArt from "@/components/CartArt";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const WAVE = "M0,34 Q60,6 120,34 T240,34 T360,34 T480,34 T600,34 T720,34 T840,34 T960,34 T1080,34 T1200,34 T1320,34 T1440,34";
const stroke = { stroke: "#1d1a14", strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export default function Home() {
  const [st, setSt] = useState<{ vendors: number; entries: number; claims: number; applications: number } | null>(null);
  useEffect(() => { api("/api/stats").then(setSt).catch(() => {}); }, []);
  const stats = [
    [st ? String(st.vendors) : "–", "vendors on Kamai (sample + real)"],
    [st ? st.entries.toLocaleString("en-IN") : "–", "ledger entries, each hash-chained"],
    [st ? String(st.applications) : "–", "loan applications"],
    [st ? String(st.claims) : "–", "rain-out claims filed"],
  ];

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div>
            <div className="word"><span className="top">कमाई</span><span className="big">kamai</span></div>
            <h1>A passbook for people banks ignore....kinda.</h1>
            <p>Speak your day in Hindi. Get a score a lender can trust, a loan offer, and rain-out insurance that files itself.</p>
            <div className="row">
              <Link className="btn" href="/join">Get started free</Link>
              <Link className="btn ghost" href="/problem">Why Kamai?</Link>
            </div>
          </div>
          <div className="art"><CartArt /></div>
        </div>
        <div className="wave"><svg viewBox="0 0 1440 70" preserveAspectRatio="none"><path d={`${WAVE} L1440,70 L0,70 Z`} fill="#f7c948" /><path d={WAVE} fill="none" stroke="#1d1a14" strokeWidth="2.5" /></svg></div>
      </header>

      <main>
        <section id="roles"><div className="wrap">
          <h2>Three apps. One verified ledger.</h2>
          <p className="lead">Savitri&apos;s voice goes in. A lender and an insurer both read the same tamper-proof record.</p>
          <div className="roles">
            <div className="card"><div style={{ fontSize: 44 }}>🎤</div><h3>Vendor app</h3><p>Speak the day in Hindi. See your score, your loan offer and your rain cover. Apply with one tap.</p><Link className="btn" href="/join">Sign up →</Link></div>
            <div className="card"><div style={{ fontSize: 44 }}>🏦</div><h3>Lender dashboard</h3><p>A queue of applicants with verified records. Spot the vendor who edited their ledger. Approve with confidence.</p><Link className="btn" href="/join">Sign up →</Link></div>
            <div className="card"><div style={{ fontSize: 44 }}>🌧️</div><h3>Insurer console</h3><p>Rain-out claims validated automatically from real rainfall plus ledger proof. Pay in one click.</p><Link className="btn" href="/join">Sign up →</Link></div>
          </div>
          <div className="stats" style={{ marginTop: 26 }}>
            {stats.map(([b, s]) => <div className="card" key={s}><b>{b}</b><span>{s}</span></div>)}
          </div>
        </div></section>

        <section id="how"><div className="wrap">
          <h2>How it works</h2>
          <div className="how">
            <div className="card"><div className="pan"><svg width="120" height="110" viewBox="0 0 120 110" {...stroke}><path d="M0 55h28M92 55h28" fill="none" /><rect x="44" y="14" width="32" height="54" rx="16" fill="#fdf5e0" /><path d="M32 52a28 28 0 0 0 56 0M60 80v16M46 96h28" fill="none" /></svg></div><h3>Speak</h3><p>&ldquo;आज 1800 की बिक्री और 1100 का माल.&rdquo; Hindi, Hinglish or English. Each line is understood and sealed into her ledger.</p></div>
            <div className="card"><div className="pan"><svg width="150" height="110" viewBox="0 0 150 110" {...stroke}><path d="M0 55h26M124 55h26" fill="none" /><rect x="30" y="36" width="52" height="38" rx="19" fill="#fdf5e0" /><rect x="68" y="36" width="52" height="38" rx="19" fill="#ffd23f" /></svg></div><h3>Prove</h3><p>Every entry is chained to the last. UPI and receipts cross-check it. A lender can verify; Savitri can&apos;t fake it.</p></div>
            <div className="card"><div className="pan"><svg width="130" height="110" viewBox="0 0 130 110" {...stroke}><path d="M0 60h20M110 60h20" fill="none" /><path d="M22 60a43 43 0 0 1 86 0z" fill="#4aa3df" /><path d="M65 60v28a8 8 0 0 1-16 0" fill="none" /><path d="M65 12v6" fill="none" /></svg></div><h3>Protect</h3><p>When real rain empties her stall, her own ledger plus the rainfall record files the insurance claim. No bills. No forms.</p></div>
          </div>
        </div></section>

        <section><div className="wrap">
          <h2>Honest about what&apos;s real</h2>
          <div className="two" style={{ marginTop: 20 }}>
            <div className="card"><b style={{ fontSize: 20 }}>Real</b><ul className="fine"><li>Daily rainfall at each vendor&apos;s coordinates (Open-Meteo / ERA5, Jul–Sep 2026).</li><li>Hindi/Hinglish voice parsing, tamper-evident hash chain, scoring, fraud checks, loan sizing and claim logic, all in <code>lib/engine.ts</code> and tested.</li><li>Loan modelled on MUDRA-Shishu (up to ₹50,000), EMI ≤ 35% of a <i>stressed</i> income (weakest 20% of weeks).</li></ul></div>
            <div className="card"><b style={{ fontSize: 20 }}>Simulated, and how production differs</b><ul className="fine"><li>The vendors&apos; sales, UPI and receipts are generated. Production: UPI inflows via Account Aggregator, receipts via OCR of supplier slips.</li><li>Fingerprints use a fast demo hash. Production: SHA-256 with periodic anchoring so even Kamai can&apos;t rewrite history.</li><li>Policy terms are illustrative. Score is a transparent weighted model until repayment data exists to train one.</li></ul></div>
          </div>
        </div></section>
      </main>
    </>
  );
}
