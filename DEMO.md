# Kamai demo script (90 seconds + Q&A)

**Setup (before you present):** `python3 -m http.server 8030` in this folder, open http://localhost:8030 in Chrome, internet on (it loads real rainfall). Reload once so the replay starts fresh. Allow the microphone if you want the live voice moment. Keep a typed fallback ready (tap the sample chip).

## The story in one line
> "Savitri sells ₹1,500 of chai a day and the bank says she doesn't exist. Kamai gives her a financial identity from her own voice, and protects it when the rains come."

## Run of show

| Time | Do | Say |
|---|---|---|
| 0:00 | Hero is on screen | "Meet Savitri. Chai stall, Gorakhpur, 11 years. ₹1,500 a day, all in cash, all in her head. Bank today: ₹0 loan. No records, no loan." |
| 0:12 | Scroll to **Speak your day**. Tap the Hindi chip *"आज 1800 की बिक्री…"* (or say it into the mic) | "She doesn't type. She talks, in Hindi. Kamai hears 1,800 sales and 1,100 of stock, writes both down, and replies in Hindi. Each line gets a fingerprint chained to the one before it." (point at the 🔒 codes) |
| 0:30 | Scroll to **Ninety days, one score**. Press **Replay** | "Ninety days of the real Gorakhpur monsoon. The blue bars at the top are actual rainfall. Watch her score build as the record grows, and see the sales fall on the orange rain-out days." |
| 0:48 | Scroll to **What the lender sees** | "This is the loan officer's view. 763, Prime. ₹33,000 offer. The loan is sized on her *worst* weeks, not her average, and 51% of the money is backed by UPI and supplier receipts." |
| 1:00 | Click **😈 Edit past entries** then **😈 Rewrite the whole ledger** | "Now she tries to cheat. Edit history: the chain breaks at the first edited entry. Rewrite everything cleanly: still caught, because nobody's stock costs 30% of sales. Score 450. Not lendable." Click **Restore**. |
| 1:15 | Scroll to **When the rain comes**. Click **Say "हाँ"** | "And the twist. Look at the lender card: with rain cover her loan is ₹33,000, not ₹17,000, because payouts lift her weakest weeks. Twelve rain-out days, ₹9,570. The claim needs no bills: real rainfall plus her own ledger is the proof. One word, and the package is built." |
| 1:28 | Close | "Voice in. Verified credit out. Insurance that files itself. One identity for the people banks ignore." |

## Why this wins (map to the judging criteria)
- **Problem understanding (25%):** 6 crore+ micro-enterprises run on cash; the gap is *evidence*, not willingness. Banks can't verify, insurers can't see losses. One ledger fixes both.
- **Working solution (25%):** Everything on screen is computed live: voice parsing, hash chain, scoring, fraud checks, loan sizing, claims. Real weather data, 20+ tests.
- **Innovation (20%):** The three tracks are not three features. Insurance *raises* creditworthiness, and credit evidence *proves* insurance claims. Same ledger, both directions.
- **Value & impact (20%):** ₹17k to ₹33k on real monsoon data; ₹9.5k of rain-out payouts in one season, with zero paperwork.
- **User experience (10%):** Hindi voice first; she never fills a form.

## Likely questions
- **Is the ledger real?** The vendor's sales, UPI and receipts are simulated; the rainfall is real. Production: UPI inflows via Account Aggregator, receipts via OCR of supplier slips, SHA-256 chain anchored externally.
- **Why trust the score?** It's a transparent weighted model with visible factors and fraud checks, not a black box. It becomes a trained model once repayment data exists; lenders get to see *why*.
- **Can't she just invent sales?** Cash sales are cross-checked against UPI share, stock costs vs category norms, back-filling and copy-paste patterns. Inflating the ledger drops the score to 450 in the demo.
- **Why parametric insurance?** No assessor visit, no photos. Trigger = verified rain + verified sales drop, so claims settle in a day.
- **Business model?** Small fee from lenders per verified application and from insurers per auto-validated claim. Free for vendors.
- **Languages?** Hindi/Hinglish/English parsing today; the parser is rule-based and extends to Bhojpuri/Tamil/etc with a number-word table (or Bhashini).

## If something breaks
- No internet: the page shows an error banner (rain data comes from Open-Meteo). Reconnect and reload.
- Mic blocked: tap the sample chips instead; behaviour is identical.
