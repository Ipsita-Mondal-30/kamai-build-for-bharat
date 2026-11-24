const assert = require("assert");
const K = require("./engine.js");

// --- voice parser ---
const p = t => K.parseVoice(t).map(x => x.type + ":" + x.amt).join(",");
assert.strictEqual(p("आज 1800 की बिक्री हुई और 1100 का माल लिया"), "sale:1800,purchase:1100");
assert.strictEqual(p("aaj das hazaar bika"), "sale:10000");
assert.strictEqual(p("aaj 2 hazaar ki bikri aur 800 ka doodh liya"), "sale:2000,purchase:800");
assert.strictEqual(p("बिजली का बिल १२०० रुपये"), "expense:1200");
assert.strictEqual(p("gas cylinder 1150"), "expense:1150");
assert.strictEqual(p("nothing here"), "");
assert.strictEqual(p("sold 1.5k"), "sale:1500");

// --- ledger on synthetic rain with some heavy days ---
const rain = Array.from({ length: 90 }, (_, i) => ({ date: K.addDays("2026-07-01", i), rain: [12, 33, 5, 0, 48, 0, 2, 0, 21][i % 9] === undefined ? 0 : [0, 33, 5, 0, 48, 0, 2, 0, 21][i % 9] }));
const led = K.genLedger(rain, 7);
assert.ok(K.verifyChain(led).ok, "fresh ledger verifies");

const ctx = { totalDays: 90, vouches: 3, utilityOnTime: true };
const s = K.score(led, ctx);
console.log("score", s.score, s.band, "loan", s.loan, "flags", s.flags.map(f => f.name), "coverage", Math.round(s.stats.coverage * 100) + "%");
assert.ok(s.score >= 650 && s.score <= 900, "honest vendor scores well: " + s.score);
assert.strictEqual(s.flags.length, 0, "honest vendor has no flags: " + JSON.stringify(s.flags));
assert.ok(s.loan.amount > 0 && s.loan.amount <= 50000);

// --- cheating: inflate recent cash sales without re-linking the chain ---
const cheat = JSON.parse(JSON.stringify(led));
cheat.slice(-90).forEach(e => { if (e.type === "sale" && e.src === "cash") e.amt = e.amt * 3; });
const cs = K.score(cheat, ctx);
console.log("cheat score", cs.score, cs.band, cs.flags.map(f => f.name));
assert.ok(cs.score <= 450 && cs.loan.amount === 0, "tampered ledger is not lendable");
assert.ok(cs.flags.some(f => f.name === "Ledger tampered"));
// even a re-chained inflated ledger is caught by plausibility checks
const rechained = K.chain(JSON.parse(JSON.stringify(cheat)).map(e => { delete e.hash; return e; }));
const rs = K.score(rechained, ctx);
console.log("re-chained cheat", rs.score, rs.flags.map(f => f.name));
assert.ok(rs.flags.some(f => /Margin|UPI/.test(f.name)), "inflated sales caught by plausibility");
assert.ok(rs.score < s.score - 80);

// --- live entry append keeps chain valid ---
const l2 = JSON.parse(JSON.stringify(led)); K.append(l2, { date: "2026-09-29", type: "sale", amt: 1800, src: "cash", logDate: "2026-09-29" });
assert.ok(K.verifyChain(l2).ok);

// --- claims ---
const cl = K.claims(led, rain);
console.log("claims", cl.items.length, "total", cl.total);
assert.ok(cl.items.length > 0 && cl.total > 0);
assert.ok(cl.items.every(c => c.rain >= 15 && c.actual <= c.expected * 0.5 && c.payout <= 800 && c.chainOk));
assert.strictEqual(K.claims(cheat, rain).items.every(c => !c.chainOk), true, "claims on tampered ledger flag chain failure");
console.log("tests passed");
