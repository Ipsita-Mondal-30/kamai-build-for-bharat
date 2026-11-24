# Kamai · कमाई
**Track 1 (Fintech & Inclusion), combining all three prompts.** A street vendor's *voice* becomes a verifiable credit passport, and the same ledger files her micro-insurance claims automatically.

| Prompt | What Kamai does |
|---|---|
| Credit for cash micro-businesses | Hash-chained ledger + UPI/receipt cross-checks + fraud checks -> 300-900 score, MUDRA-style loan sized on *stressed* income |
| Vernacular & voice | Hindi/Hinglish/English voice entry ("आज 1800 की बिक्री और 1100 का माल"), answers spoken back in Hindi |
| Micro-insurance claims | Parametric rain-out cover: real rainfall + ledger sales drop = pre-validated claim, no bills or forms |

**The combination matters:** on real Gorakhpur monsoon 2026 rainfall, the simulated stall qualifies for a ₹17,000 loan alone, **₹33,000 once rain-out payouts count toward her stressed income**.

Run: `python3 -m http.server 8030` then open http://localhost:8030 (needs internet for the real rain data). Tests: `node test.js`.

Real: rainfall data (Open-Meteo), parser, chain, scoring, fraud checks, loan and claim logic. Simulated: the vendor's ledger, UPI and receipts. See the page's last section.
