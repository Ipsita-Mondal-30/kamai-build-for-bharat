// Integration test: starts a throwaway production server on its own temp database and exercises auth, privacy,
// role checks, ledger integrity and the vendor -> lender -> insurer flow.
// Needs: `npm run build` first, and internet once (sample data uses real rainfall).
import assert from "node:assert";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = 3100, BASE = `http://localhost:${PORT}`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kamai-test-"));
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env: { ...process.env, KAMAI_DATA_DIR: dir, KAMAI_INSECURE_COOKIES: "1", NODE_ENV: "production" }, stdio: "ignore" });

class Client {
  cookie = "";
  async call(method: string, url: string, body?: unknown) {
    const r = await fetch(BASE + url, { method, headers: { "content-type": "application/json", ...(this.cookie ? { cookie: this.cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const sc = r.headers.getSetCookie?.() ?? []; if (sc.length) this.cookie = sc.map(c => c.split(";")[0]).join("; ");
    return { status: r.status, body: await r.json().catch(() => ({})) as any };
  }
  get = (u: string) => this.call("GET", u);
  post = (u: string, b: unknown = {}) => this.call("POST", u, b);
}

let passed = 0;
const ok = (name: string, fn: () => void | Promise<void>) => Promise.resolve(fn()).then(() => { passed++; console.log("  ✓ " + name); });

async function waitReady() {
  for (let i = 0; i < 120; i++) {
    try { const r = await fetch(BASE + "/api/stats"); const j = await r.json(); if (j.vendors === 8) return; } catch { /* starting */ }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("server did not become ready (needs internet for sample rainfall)");
}

async function main() {
  await waitReady();
  const phone = "98" + String(Date.now()).slice(-8), anon = new Client(), v = new Client();

  console.log("auth & validation");
  await ok("rejects a short PIN", async () => assert.equal((await anon.post("/api/auth/register", { role: "vendor", name: "T Vendor", phone, pin: "12", city: "Patna", biz: "tea" })).status, 400));
  await ok("rejects a bad phone number", async () => assert.equal((await anon.post("/api/auth/register", { role: "vendor", name: "T Vendor", phone: "12345", pin: "1234", city: "Patna", biz: "tea" })).status, 400));
  await ok("rejects unknown city", async () => assert.equal((await anon.post("/api/auth/register", { role: "vendor", name: "T Vendor", phone, pin: "1234", city: "Atlantis", biz: "tea" })).status, 400));
  await ok("lender sign-up needs the access code", async () => assert.equal((await anon.post("/api/auth/register", { role: "lender", name: "Bank", phone: "97" + phone.slice(2), pin: "1234", code: "wrong" })).status, 403));
  await ok("registers a vendor", async () => assert.equal((await v.post("/api/auth/register", { role: "vendor", name: "T Vendor", phone, pin: "4321", city: "Patna", biz: "tea" })).status, 200));
  await ok("rejects duplicate number", async () => assert.equal((await anon.post("/api/auth/register", { role: "vendor", name: "Dup", phone, pin: "4321", city: "Patna", biz: "tea" })).status, 409));
  await ok("wrong PIN is refused", async () => assert.equal((await new Client().post("/api/auth/login", { phone, pin: "0000" })).status, 401));
  await ok("right PIN logs in", async () => assert.equal((await new Client().post("/api/auth/login", { phone, pin: "4321" })).status, 200));
  await ok("brute-force guard kicks in", async () => { const c = new Client(); let last = 0; for (let i = 0; i < 9; i++) last = (await c.post("/api/auth/login", { phone: "9000099999", pin: "0000" })).status; assert.equal(last, 429); });

  console.log("access control");
  await ok("no cookie → 401", async () => assert.equal((await anon.get("/api/vendor/summary")).status, 401));
  await ok("forged cookie → 401", async () => { const c = new Client(); c.cookie = "kamai_session=1.9999999999999.deadbeef"; assert.equal((await c.get("/api/vendor/summary")).status, 401); });
  await ok("vendor cannot use lender/insurer APIs", async () => { assert.equal((await v.get("/api/lender/applications")).status, 403); assert.equal((await v.get("/api/insurer/claims")).status, 403); });

  console.log("ledger");
  await ok("voice text becomes chained entries", async () => {
    const r = await v.post("/api/vendor/entries", { text: "aaj 1800 ki bikri aur 1100 ka maal" });
    assert.equal(r.status, 200); assert.equal(r.body.added.length, 2); assert.equal(r.body.added[0].prev, "GENESIS"); assert.equal(r.body.added[1].prev, r.body.added[0].hash);
  });
  await ok("text with no amount is rejected", async () => assert.equal((await v.post("/api/vendor/entries", { text: "kuch nahi" })).status, 400));
  await ok("future and too-old dates are rejected", async () => {
    assert.equal((await v.post("/api/vendor/entries", { text: "500 ki bikri", date: "2099-01-01" })).status, 400);
    assert.equal((await v.post("/api/vendor/entries", { text: "500 ki bikri", date: "2020-01-01" })).status, 400);
  });
  await ok("a new vendor is honest: no loan before 14 days", async () => {
    const s = (await v.get("/api/vendor/summary")).body; assert.equal(s.ready, false); assert.equal(s.score.loan.amount, 0); assert.equal(s.chain.ok, true); assert.equal(s.totalEntries, 2);
    assert.equal((await v.post("/api/vendor/apply")).status, 400);
  });

  console.log("privacy");
  const lender = new Client(), insurer = new Client(), sv = new Client();
  await lender.post("/api/auth/demo", { role: "lender" }); await insurer.post("/api/auth/demo", { role: "insurer" }); await sv.post("/api/auth/demo", { role: "vendor" });
  await ok("lender does not see a vendor who has not applied", async () => { const a = (await lender.get("/api/lender/applications")).body.applications; assert.ok(a.length >= 7); assert.ok(!a.some((x: any) => x.applicant.name === "T Vendor")); });

  console.log("vendor → lender → insurer");
  await ok("sample vendor applies once", async () => { assert.equal((await sv.post("/api/vendor/apply")).status, 200); assert.equal((await sv.post("/api/vendor/apply")).status, 409); });
  const apps = (await lender.get("/api/lender/applications")).body.applications;
  await ok("lender sees the application and approves it", async () => { const a = apps.find((x: any) => x.applicant.name === "Savitri Devi"); assert.ok(a); assert.equal((await lender.post("/api/lender/decide", { id: a.id, decision: "approved" })).status, 200); assert.equal((await lender.post("/api/lender/decide", { id: a.id, decision: "declined" })).status, 409); });
  await ok("server refuses to approve a tampered ledger", async () => { const r = apps.find((x: any) => x.applicant.name === "Raju Sahani"); assert.equal(r.chain.ok, false); assert.equal((await lender.post("/api/lender/decide", { id: r.id, decision: "approved" })).status, 409); });
  await ok("fraud checks flag the inflated ledger", async () => { const i = apps.find((x: any) => x.applicant.name === "Imran Ali"); assert.ok(i.score.flags.some((f: any) => /Margin/.test(f.name))); assert.equal(i.score.loan.amount, 0); });
  await ok("vendor sees the decision", async () => assert.equal((await sv.get("/api/vendor/summary")).body.application.status, "approved"));
  await ok("claims file once, idempotently", async () => { const a = await sv.post("/api/vendor/claims"); assert.ok(a.body.filed > 0); const b = await sv.post("/api/vendor/claims"); assert.equal(b.body.filed, 0); });
  await ok("insurer holds tampered claims and pays the rest", async () => {
    const before = (await insurer.get("/api/insurer/claims")).body.claims; assert.ok(before.some((c: any) => c.held));
    const p = await insurer.post("/api/insurer/pay"); assert.ok(p.body.paid > 0);
    const after = (await insurer.get("/api/insurer/claims")).body.claims; assert.ok(after.filter((c: any) => c.held).every((c: any) => c.status === "filed")); assert.ok(after.filter((c: any) => !c.held).every((c: any) => c.status === "paid"));
  });
  await ok("SQL-looking input is stored as plain text", async () => { const c = new Client(); assert.equal((await c.post("/api/auth/register", { role: "vendor", name: "x'); DROP TABLE users;--", phone: "96" + phone.slice(2), pin: "1234", city: "Patna", biz: "tea" })).status, 200); assert.equal((await anon.get("/api/stats")).body.vendors >= 9, true); });
}

main().then(() => { console.log(`\nAPI tests passed (${passed})`); }).catch(e => { console.error("\nFAILED:", e.message); process.exitCode = 1; }).finally(() => { server.kill("SIGTERM"); setTimeout(() => { fs.rmSync(dir, { recursive: true, force: true }); process.exit(); }, 500); });
