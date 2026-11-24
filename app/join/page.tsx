"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { BIZ, CITIES } from "@/lib/catalog";
import { useLang } from "@/lib/i18n";

type Role = "vendor" | "lender" | "insurer";

function Join() {
  const router = useRouter(), next = useSearchParams().get("next");
  const { t, toggle } = useLang();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [role, setRole] = useState<Role>("vendor");
  const [f, setF] = useState({ name: "", phone: "", pin: "", city: "", biz: "", code: "" });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));
  const go = (r: string) => router.push(next && next.startsWith("/" + r) ? next : "/" + r);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setBusy(true);
    try { const r = await api(mode === "signup" ? "/api/auth/register" : "/api/auth/login", mode === "signup" ? { ...f, role } : { phone: f.phone, pin: f.pin }); go(r.role); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  async function demo(r: Role) { setErr(null); setBusy(true); try { await api("/api/auth/demo", { role: r }); go(r); } catch (e: any) { setErr(e.message); } finally { setBusy(false); } }

  return (
    <div className="app" style={{ maxWidth: 560 }}>
      <div style={{ textAlign: "right" }}><button className="btn sm ghost" onClick={toggle} aria-label="Switch language / भाषा बदलें">{t("lang")}</button></div>
      <h1 style={{ textAlign: "center" }}>{mode === "signup" ? t("createAcct") : t("welcome")}</h1>
      <div className="row" style={{ justifyContent: "center", margin: "10px 0 18px" }}>
        <button className={"btn sm " + (mode === "signup" ? "" : "ghost")} onClick={() => setMode("signup")}>{t("signUp")}</button>
        <button className={"btn sm " + (mode === "login" ? "" : "ghost")} onClick={() => setMode("login")}>{t("logIn")}</button>
      </div>
      <form className="card" onSubmit={submit}>
        {mode === "signup" && <>
          <label className="lab">{t("iAm")}</label>
          <div className="row2" style={{ marginBottom: 14 }}>
            {([["vendor", t("rVendor")], ["lender", t("rLender")], ["insurer", t("rInsurer")]] as const).map(([k, t]) =>
              <button type="button" key={k} className={"btn sm " + (role === k ? "" : "ghost")} onClick={() => setRole(k)}>{t}</button>)}
          </div>
          <label className="lab" htmlFor="f-name">{t("yourName")}</label>
          <input id="f-name" className="inp" value={f.name} onChange={e => set("name", e.target.value)} autoComplete="name" placeholder="e.g. Savitri Devi" required />
        </>}
        <label className="lab" htmlFor="f-phone">{t("mobile")}</label>
        <input id="f-phone" className="inp" value={f.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" placeholder="10-digit number" required />
        <label className="lab" htmlFor="f-pin">{t("pin")}</label>
        <input id="f-pin" className="inp" type="password" value={f.pin} onChange={e => set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="••••" required />
        {mode === "signup" && role === "vendor" && <>
          <label className="lab" htmlFor="f-city">{t("city")}</label>
          <select id="f-city" className="inp" value={f.city} onChange={e => set("city", e.target.value)} required><option value="">{t("chooseCity")}</option>{CITIES.map(c => <option key={c.name} value={c.name}>{c.name}, {c.state}</option>)}</select>
          <label className="lab" htmlFor="f-biz">{t("sell")}</label>
          <select id="f-biz" className="inp" value={f.biz} onChange={e => set("biz", e.target.value)} required><option value="">{t("choose")}</option>{Object.entries(BIZ).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}</select>
        </>}
        {mode === "signup" && role !== "vendor" && <>
          <label className="lab" htmlFor="f-code">{t("code")}</label>
          <input id="f-code" className="inp" value={f.code} onChange={e => set("code", e.target.value)} placeholder={role === "lender" ? "Given by Kamai (demo: LENDER-DEMO)" : "Given by Kamai (demo: INSURER-DEMO)"} required />
        </>}
        {err && <div className="err" role="alert" style={{ display: "block", marginBottom: 12 }}>{err}</div>}
        <button className="btn" style={{ width: "100%" }} disabled={busy}>{busy ? t("wait") : mode === "signup" ? t("create") : t("logIn")}</button>
        {mode === "signup" && <p className="fine" style={{ marginTop: 10 }}>{t("privacy")}</p>}
      </form>
      <div className="card" style={{ marginTop: 18, background: "#fff" }}>
        <b>{t("exploring")}</b>
        <p className="fine" style={{ margin: "4px 0 10px" }}>{t("exploringNote")}</p>
        <div className="row2">
          <button className="btn sm pink" disabled={busy} onClick={() => demo("vendor")}>{t("sVendor")}</button>
          <button className="btn sm pink" disabled={busy} onClick={() => demo("lender")}>{t("sLender")}</button>
          <button className="btn sm pink" disabled={busy} onClick={() => demo("insurer")}>{t("sInsurer")}</button>
        </div>
      </div>
    </div>
  );
}
export default function Page() { return <Suspense><Join /></Suspense>; }
