# Explanation of Value: Kamai

## How it helps the people affected
| Who | Value |
|---|---|
| **Vendor** | Gets a loan offer from her own record (sample stall: ₹33,000), pays formal interest instead of informal, and gets paid automatically on rain-out days (sample: ₹9,570 in one monsoon season) with no forms. Speaks in Hindi; no app to learn. |
| **Lender** | Can say yes to people it used to reject, with a record it can verify. Tamper and inflation are caught before approval; the server refuses to approve a broken ledger. |
| **Insurer** | Claims arrive pre-validated from real rainfall and a verified ledger, with no assessor visits. |

Illustrative arithmetic is on the `/problem` page: a ₹33,000 loan over 12 months at 18% a year costs about ₹3,300 in interest, against about ₹6,800 at an *assumed* 3% a month: a saving of roughly ₹3,500. The moneylender rate is an editable assumption, not a sourced figure.

## Evidence we have, and what we do not
- **Have:** a working product with accounts, a database, server-enforced rules, tests (engine and API), real rainfall data, and sample data showing every case including fraud.
- **Do not have yet:** results from real vendors. Sample vendors' sales, UPI and receipts are simulated, and the score has not been calibrated on repayment data.

## How it could be adopted
1. **Pilot** with a few hundred vendors in two cities and one NBFC/microfinance partner; calibrate the score on repayment.
2. **Connect** an Account Aggregator (UPI/bank inflows), supplier-receipt scanning, and a licensed insurer. Verification becomes independent instead of self-reported.
3. **Reach** vendors on WhatsApp/voice calls in their language. Lenders pay a small fee per verified application; vendors stay free. A verified record may also help vendors graduate to larger PM SVANidhi tranches.

## Honest risks
- **Insurance economics:** in the sample monsoon quarter the break-even premium (~₹2,000 per vendor per month) is far more than a vendor can pay. A pilot would bundle cover into the loan or use a subsidy, and average over dry months.
- **Self-reporting:** until bank data is connected, real vendors' entries are self-reported; the integrity chain and plausibility checks make cheating detectable, not impossible.
- **Login:** mobile + PIN without an SMS OTP for now.
