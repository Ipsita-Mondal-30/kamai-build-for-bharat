# Kamai demo script (about 2 minutes)

**Setup:** `python3 -m http.server 8030` in this folder, open http://localhost:8030 in Chrome (internet on: real rainfall loads live). Keep three tabs ready: `vendor.html`, `lender.html`, `insurer.html`.

**One line:** "Savitri sells ₹1,500 of chai a day and the bank says she doesn't exist. Kamai turns her voice into a record that a lender and an insurer can both trust."

| Time | Where | Do | Say |
|---|---|---|---|
| 0:00 | Home | Show hero | "Cash vendors have no paper trail, so no loan and no insurance. Three apps fix this from one verified ledger." |
| 0:15 | **Vendor app** → Today | Tap the Hindi chip (or speak into the mic) | "Savitri just talks. Hindi in, ledger entries out, each sealed with a fingerprint chained to the last." |
| 0:35 | Vendor → Score tab | Show ring + factors + chart | "Ninety days of the real Gorakhpur monsoon. Orange bars are days the rain emptied her stall." |
| 0:50 | Vendor → Loan tab | Tap **Apply with one tap** | "She sees a ₹33,000 offer, sized on her weakest weeks. Without rain cover it would be ₹17,000. One tap applies." |
| 1:05 | **Lender** | Savitri is at the top marked NEW. Click her, then click **Imran Ali** and **Raju Sahani** | "The loan officer sees her application, verified. Now two others: Imran inflated his sales and re-signed the ledger, caught by the cost-to-sales check. Raju edited past entries, the chain breaks at the edited entry." Press **Approve** on Savitri. |
| 1:35 | **Insurer** | Show queue, then **Approve & pay all validated** | "68 rain-out claims across 8 cities, validated from real rainfall plus ledger proof. No assessor. Claims from the tampered ledger are held, not paid." |
| 1:55 | Insurer note | Point at break-even premium | "We are honest about cost: this is the worst quarter and covering it costs about ₹2,200 per vendor per month. A pilot funds it through the loan or a subsidy." |

## Judging criteria
- **Problem understanding:** the gap is *evidence*, not willingness to repay. Banks can't verify cash, insurers can't see losses.
- **Working solution:** three connected apps, 8 vendors in 8 cities on real rainfall, live voice parsing, chain verification, fraud checks, 20+ tests.
- **Innovation:** the tracks reinforce each other. Insurance raises creditworthiness; the ledger proves insurance claims.
- **Value:** ₹17k to ₹33k for Savitri; rain-out payouts with no paperwork.
- **UX:** Hindi voice first, no forms.

## Likely questions
- **Is the data real?** Rainfall is real (Open-Meteo/ERA5). Vendors, sales, UPI and receipts are simulated. Production: UPI via Account Aggregator, receipts via OCR, SHA-256 chain with external anchoring.
- **Can she fake it?** Edit history: chain breaks. Rewrite it: cost-to-sales, UPI share, back-fill and copy-paste checks catch it.
- **Who pays for insurance?** Not the vendor alone. See the break-even note: bundle it into the loan or use a subsidy.
- **Is the score a trained model?** No, a transparent weighted model with visible factors. It becomes trained once repayment data exists.
