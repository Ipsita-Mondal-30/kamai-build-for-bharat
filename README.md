# Kamai · कमाई

**Track 1 (Fintech & Financial Inclusion), combining all three prompts.** A street vendor speaks her day in Hindi; Kamai turns it into a tamper-proof ledger, a credit score a lender can trust, and rain-out insurance claims that file themselves. Next.js (App Router, TypeScript) + SQLite.

## Who uses it, and how
| Person | Where | What they do |
|---|---|---|
| **Vendor** (Savitri sells chai) | `/join` → `/vendor` (Hindi/English toggle, keyboard and screen-reader friendly) | Signs up with mobile number + PIN, picks city and business. Speaks or types the day ("आज 1800 की बिक्री और 1100 का माल"). After 14 days of records she gets a score and loan offer, applies with one tap, and files rain-out claims. |
| **Lender** | `/lender` | Sees only vendors who **applied**. Ledger is re-verified on every open; approval is refused by the server if the chain is broken or fraud checks fail. |
| **Insurer** | `/insurer` | Sees filed claims, re-verified at read time; tampered ledgers are held, valid ones are paid in one click. |

No data is shared with a lender or insurer until the vendor taps Apply / File claims. PINs are stored hashed (scrypt); sessions are signed HttpOnly cookies; all SQL is parameterised.

**Just exploring?** `/join` has one-click **sample** vendor / lender / insurer accounts: fictional vendors on real rainfall, including one who inflated sales and one who edited history.

## Submission documents
- [`docs/PROBLEM_BRIEF.md`](docs/PROBLEM_BRIEF.md): problem, people affected, why existing solutions fall short (sourced)
- [`docs/VALUE.md`](docs/VALUE.md): how it helps, how it could be adopted, honest risks
- [`DEMO.md`](DEMO.md): demo script · live in-app version at `/problem`

## How it works
- **Voice → ledger:** Hindi/Hinglish/English parser (`lib/engine.ts`). Entries are appended **on the server** and each hash is chained to the previous one, so history can't be edited from the browser.
- **Score (300-900):** transparent weighted factors (consistency, earnings, stability, verification, trust, red flags) plus fraud checks (broken chain, stock cost too low for the trade, copy-paste sales, back-filled entries). Loan sized on *stressed* income (weakest 20% of weeks), MUDRA-Shishu cap ₹50,000.
- **Rain cover:** real rainfall (Open-Meteo / ERA5) at the vendor's city + a verified sales drop = a pre-validated claim. Rainfall is cached in SQLite.
- **Together:** on the sample monsoon data a stall qualifies for ₹17,000 alone, **₹33,000 once rain-out payouts count** toward stressed income.

## Run
```bash
npm install
npm run dev                                   # http://localhost:3000, needs internet for rainfall
npm test                                      # engine unit tests (Node 22.13+)
npm run build && npm run test:api             # 25 API/security/flow tests on a throwaway server (needs internet once)
npm run build && KAMAI_INSECURE_COOKIES=1 npm start   # production mode over plain http
```
Data lives in `./data/kamai.db` (SQLite, created on first run).

## Deploy
Needs a Node host with a persistent disk (SQLite). `Dockerfile` included: mount a volume at `/data`.
Environment variables:
| Variable | Purpose |
|---|---|
| `KAMAI_DATA_DIR` | folder for the database (default `./data`; Docker uses `/data`) |
| `KAMAI_SECRET` | cookie-signing secret (auto-generated into the data dir if unset) |
| `KAMAI_LENDER_CODE`, `KAMAI_INSURER_CODE` | access codes for lender/insurer sign-up (defaults `LENDER-DEMO`, `INSURER-DEMO`: **change in production**) |
| `KAMAI_INSECURE_COOKIES=1` | only for running production mode over plain http locally |

## Honest limits (what is real, what is not yet)
- **Real:** accounts, persistence, hash-chained ledgers, scoring, fraud checks, rainfall data, role-based access, all rules enforced server-side.
- **Not connected yet:** UPI/bank data (needs an Account Aggregator) and supplier-receipt scanning. Until then a real vendor's entries are **self-reported**, so "independently verified" shows 0% for real accounts. Sample vendors simulate it.
- **No money moves.** Loan disbursal and claim payouts are simulated; they need a partner bank/NBFC and a licensed insurer.
- **Login** is mobile number + PIN without an SMS OTP (no SMS provider connected). Production should add OTP.
- The score is a transparent weighted model, not trained on repayment data yet; it needs a pilot to calibrate. Insurance is priced honestly on the insurer page: this is the worst quarter and the break-even premium is high, so it needs to be bundled with the loan or subsidised.

## Structure
```
app/               pages: / · /join · /vendor · /lender · /insurer   and   app/api/* (auth, vendor, lender, insurer)
components/        Nav, charts, CartArt
lib/engine.ts      parser, hash chain, scoring, fraud checks, loan + claims logic (tested)
lib/server/        db (SQLite), auth, rain cache, ledger, seed, http helpers
lib/catalog.ts     cities, business types
test.ts            engine tests
```
