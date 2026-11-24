# Problem Brief: Kamai

**Track 1 · Fintech & Financial Inclusion** (combines: credit assessment for cash micro-businesses, vernacular & voice financial services, micro-insurance claim assistance)

## The problem
Small cash-based sellers (tea stalls, vegetable and fruit carts, flower sellers, chaat vendors, tiny kirana shops) earn every day but leave no financial footprint. Without records a bank cannot underwrite them, so they borrow informally or not at all. And when the monsoon empties their stall they have no protection: insurance is built for farms and factories, with assessors and paperwork they cannot meet.

## Who is affected
Street vendors and micro-retailers in tier-2 and tier-3 cities. The 2009 National Policy on Urban Street Vendors put street vendors at around 1 crore nationally, though estimates vary widely by source and official registrations are far lower [1]. Coverage of an MSME credit study reports only ~19% of MSME credit demand met formally by FY21 and ~75% of MSMEs relying on informal credit [2] (secondary source; verify against the NITI Aayog / IFC originals).

## What they do today
- Borrow from local moneylenders: fast, no paperwork, expensive and open-ended.
- Use PM SVANidhi where the municipality recognises them. It has reached 68.9 lakh vendors (₹14,595 crore across 99 lakh loans, Nov 2025) [3] and was extended to 2030 with first-tranche loans of up to ₹15,000 [4]. It is real progress, but loans are small and fixed, and nothing covers a lost day of income.
- Keep sales in their heads or in notebooks no lender can verify.

## Why existing solutions fall short (our analysis)
| Option | Gap |
|---|---|
| Bank loan | Needs income proof and credit history that cash vendors do not have |
| PM SVANidhi | Small flat tranches for recognised vendors; not sized to the business; no income protection |
| Digital ledger apps | Good at recording sales, with voice notes and regional languages already available (e.g. OkCredit [5]). Built for the merchant's own use, not as evidence a lender can verify (our reading) |
| Moneylender | Expensive, open-ended |
| Weather-index cover | Parametric rain/heat cover for informal workers is being piloted (e.g. SEWA [6]). It pays on the index alone, so a payout may not match a given vendor's real loss: the "basis risk" known from rainfall-index insurance [7] |

## What exists, and what we add
Pieces of this exist: voice entry in ledger apps, rain and heat payouts in pilot programmes, small loans through PM SVANidhi. **We found no single product that ties together** (a) a record a lender can verify, (b) claims that follow the vendor's own verified loss, and (c) cover that raises what she can borrow. That combination is Kamai. This is our reading of public sources, not a product-by-product audit; the full capability grid is on the app's `/problem` page.

## Our approach
1. **Voice → ledger.** The vendor speaks her day in Hindi/Hinglish. The server records it and chains each entry's hash to the previous one, so history cannot be quietly edited.
2. **Ledger → credit passport.** A transparent score and fraud checks (broken chain, stock cost implausible for the trade, copy-paste sales, back-filled entries). The loan is sized on *stressed* income (weakest 20% of weeks), capped at the MUDRA-Shishu limit (₹50,000).
3. **Same ledger → insurance.** Real rainfall at the vendor's city plus a verified sales drop forms a pre-validated parametric claim. No assessor, no bills.

What makes it powerful: a record that cannot be quietly changed (server-side hash chain); five fraud checks; loans sized on stressed income; claims triggered by real rainfall AND her own verified sales drop (narrowing basis risk); and one record read by vendor, lender and insurer, re-verified each time. The tracks reinforce each other: rain-out cover raises the income a lender can count on (sample stall: ₹17,000 alone, ₹33,000 with cover), and the ledger is the proof insurers need.

## Sources
1. National Policy for Urban Street Vendors (2009): https://PRSINDIA.org/files/bills_acts/bills_parliament/2005/bill82_2006123082_National_Policy_for_Urban_Street_Vendors.pdf
2. Entrepreneur India, MSME credit coverage: https://www.entrepreneur.com/en-in/news-and-trends/indias-inr-80-lakh-crore-credit-problem-for-msmes/491098
3. Lok Sabha reply on PM SVANidhi (figures as on 19 Nov 2025): https://eparlib.sansad.in/bitstream/123456789/3018433/1/AU3010_uAj8qs.pdf
4. Business Today, Cabinet extends PM SVANidhi to 2030: https://www.businesstoday.in/latest/economy/story/cabinet-extends-pm-svanidhi-scheme-till-2030-approves-rs-7332-crore-outlay-491294-2025-08-27
5. YourStory on OkCredit (voice notes, regional languages; press coverage): https://yourstory.com/smbstory/free-business-accounting-app-india-okcredit-msme
6. SEWA parametric insurance report: https://www.sewafederation.org/wp-content/uploads/2025/12/Parametric-Insurance-report.pdf
7. Rainfall-index insurance case study (basis risk, mainly farmers): https://economics.mit.edu/sites/default/files/2022-09/Microinsurance%20%20-%20A%20Case%20Study%20of%20the%20Indian%20Rainfall%20Index%20Insurance%20Market%20-%20WP_0.pdf
