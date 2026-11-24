# Kamai · कमाई

**Track 1 (Fintech & Financial Inclusion), combining all three prompts.** A street vendor's *voice* becomes a verifiable credit passport, and the same ledger proves her micro-insurance claims.

| App | For | What it does |
|---|---|---|
| `vendor.html` | Cash vendor | Speak the day in Hindi/Hinglish/English; see score, loan offer, rain cover; apply in one tap |
| `lender.html` | Loan officer | Queue of applicants with verified records; chain re-verification; spots inflated and tampered ledgers |
| `insurer.html` | Insurer | Rain-out claims auto-validated from real rainfall + ledger proof; payout by city; honest break-even premium |

| Prompt | How Kamai covers it |
|---|---|
| Credit for cash micro-businesses | Hash-chained ledger, UPI/receipt cross-checks, fraud checks, 300-900 score, loan sized on *stressed* income |
| Vernacular & voice | Hindi/Hinglish/English voice entry, answers spoken in Hindi |
| Micro-insurance claims | Parametric rain-out cover: real rainfall + verified sales drop = pre-validated claim, no bills |

**Why together:** on real Gorakhpur monsoon rainfall the simulated stall qualifies for ₹17,000 alone, **₹33,000 once rain-out payouts count** toward her stressed income.

## Run
```
python3 -m http.server 8030     # then open http://localhost:8030 (internet needed for rainfall data)
node test.js                    # engine tests
```

## Files
`engine.js` parser, ledger chain, scoring, fraud checks, loan and claims logic · `app.js` shared data (8 vendors, 8 cities) and charts · `style.css` · `DEMO.md` demo script.

## Real vs simulated
Real: rainfall (Open-Meteo/ERA5, Jul-Sep 2026) and all logic. Simulated: the vendors and their sales, UPI and receipts. Production would use Account Aggregator UPI data, OCR of supplier slips, and SHA-256 anchoring. Policy terms are illustrative; the break-even premium on the insurer page shows the cover needs a loan-bundled or subsidised funding model.
