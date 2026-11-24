// Scene script for the Kamai demo video. `say` is what is spoken (phonetic spellings allowed);
// `text` is what the viewer reads as the caption. voice: "en" (Rishi) or "hi" (Lekha).
// Every number here was checked against the running app (see build notes).
const K = "‹hi:कमाई›"; // the Hindi voice says the product name correctly (ka-maa-ee); captions still show "Kamai"

export const scenes = [
  // ───────────── ACT 1 · STORY ─────────────
  { id: "s01", layout: "story", art: "dawn", big: "Savitri", small: "Tea stall · Gorakhpur · eleven years", note: "Savitri is a fictional vendor, based on typical street vendors.",
    segs: [{ voice: "en", text: "This is Savitri. She sells tea in Gorakhpur. Every morning, before the city wakes, she lights her stove." }] },
  { id: "s02", layout: "story", art: "cash", big: "₹1,500 a day", small: "All cash. Nothing written down.",
    segs: [{ voice: "en", say: "By night, she has earned about fifteen hundred rupees. All cash. None of it written down. Eleven years, and this is how she has raised her family.", text: "By night, she has earned about ₹1,500. All cash. None of it written down. Eleven years, and this is how she has raised her family." }] },
  { id: "s03", layout: "story", art: "rain", big: "Then the rains came.", small: "Real rainfall at her stall · Gorakhpur · July to September 2026", chart: true,
    segs: [{ voice: "en", text: "Last monsoon, the rains came and did not stop. For days, almost nobody stopped for tea. The stock she had bought was wasted. The supplier still wanted his money." }] },
  { id: "s04", layout: "story", art: "bank", big: "“No records. No loan.”", small: "The bank asked for proof of income. She had none.",
    segs: [{ voice: "en", text: "She went to the bank. They asked for proof of income. She had none. No statements, no history, nothing in writing. The answer was no. So, like millions, she borrowed from whoever would lend." }] },

  // ───────────── ACT 2 · PROBLEM ─────────────
  { id: "s05", layout: "stats", kicker: "The problem",
    cards: [["~1 crore", "street vendors in India, per the 2009 National Policy (estimates vary)"], ["~75%", "of small businesses still rely on informal credit, by one estimate"], ["68.9 lakh", "vendors reached by PM SVANidhi as of Nov 2025: a real start"]],
    foot: "Sources: National Policy for Urban Street Vendors (2009) · Entrepreneur India coverage of MSME credit (secondary source) · Lok Sabha reply on PM SVANidhi, 19 Nov 2025",
    segs: [{ voice: "en", say: "Savitri is not alone. India has an estimated one crore street vendors. By one estimate, three in four small businesses rely on informal credit. P M Swanidhi has reached sixty-nine lakh vendors, a real start. But loans are small and fixed, and nothing protects a vendor when the rain takes her income.", text: "Savitri is not alone. India has an estimated one crore street vendors. By one estimate, three in four small businesses rely on informal credit. PM SVANidhi has reached 69 lakh vendors, a real start. But loans are small and fixed, and nothing protects a vendor when the rain takes her income." }] },
  { id: "s06", layout: "gap", big: "The gap is not willingness to repay.", big2: "It is evidence.",
    rows: [["Banks", "can’t see her income"], ["Insurers", "can’t see her loss"], ["A notebook, or an app anyone can edit,", "proves nothing to a lender"]],
    segs: [{ voice: "en", text: "The gap is not willingness to repay. It is evidence. Banks cannot see her income. Insurers cannot see her loss. And a notebook, or an app anyone can edit, proves nothing to a lender." }] },

  // ───────────── ACT 3 · SOLUTION ─────────────
  { id: "s07", layout: "solution", big: "What if her voice was her paperwork?",
    cards: [["🎤", "Speak", "Her day, in her own language"], ["🔒", "Prove", "A record that can’t be quietly changed"], ["🌧️", "Protect", "Rain-outs paid from the same record"]],
    segs: [{ voice: "en", say: `What if her voice was her paperwork? This is ${K}. She speaks her day in her own language. ${K} turns it into a record that cannot be quietly changed, one a lender can trust and an insurer can use.`, text: "What if her voice was her paperwork? This is Kamai. She speaks her day in her own language. Kamai turns it into a record that cannot be quietly changed, one a lender can trust and an insurer can use." }] },

  // ───────────── ACT 4 · PRODUCT ─────────────
  { id: "s08", layout: "phone", shot: "join-hi", label: "Sign up in Hindi or English", points: ["Mobile number and a PIN", "No app to learn, no forms", "Her records stay private"],
    segs: [{ voice: "en", text: "She signs up with her mobile number and a PIN, in Hindi or English. No app to learn. No forms to fill." }] },
  { id: "s09", layout: "phone", shot: "v3-saved", label: "She just says her day", points: ["Hindi, Hinglish or English", "Each line is sealed to the one before it", "History can’t be quietly edited"],
    segs: [{ voice: "hi", say: "आज अठारह सौ की बिक्री हुई और ग्यारह सौ का माल लिया।", text: "आज 1800 की बिक्री हुई और 1100 का माल लिया।", text2: "“Today I sold ₹1,800 and bought ₹1,100 of stock.”" },
           { voice: "en", say: `She says what she sold and what she bought. ${K} writes it down and seals every line to the one before, so history cannot be quietly edited.`, text: "She says what she sold and what she bought. Kamai writes it down and seals every line to the one before, so history cannot be quietly edited." }] },
  { id: "s10", layout: "phone", shot: "v4-score", label: "A score from her own record", points: ["Daily earnings", "How steady her weeks are", "How much is independently verified", "Any red flags"],
    segs: [{ voice: "en", text: "Over weeks, a score builds from her own record: her earnings, how steady her weeks are, how much is verified, and any red flags. Nothing is hidden from her." }] },
  { id: "s11", layout: "phone", shot: "v4b-chart", label: "Real rainfall, real rain-outs", points: ["Blue: real rainfall in her city", "Orange: days sales collapsed"],
    segs: [{ voice: "en", say: `The orange days are real rain-outs. ${K} reads real rainfall for her city, and sees her sales fall on the days it poured.`, text: "The orange days are real rain-outs. Kamai reads real rainfall for her city, and sees her sales fall on the days it poured." }] },
  { id: "s12", layout: "phone", shot: "v6-applied", label: "One tap to apply", points: ["₹33,000 offer", "Sized on her weakest weeks, not her best", "Nothing shared until she taps"],
    segs: [{ voice: "en", text: "The offer is sized on her weakest weeks, not her best. Thirty-three thousand rupees. One tap sends her summary to the lender. Nothing is shared until she taps." }] },
  { id: "s13", layout: "desktop", shot: "l1-savitri", label: "Lender dashboard",
    segs: [{ voice: "en", text: "The lender sees only people who applied. Every record is re-verified each time it is opened." }] },
  { id: "s14", layout: "desktop", shot: "l2-raju", label: "Tampering caught · “Do not lend”",
    segs: [{ voice: "en", text: "Here, a vendor edited his past entries. The chain no longer matches, and the server refuses to approve him, even if the lender clicks approve." }] },
  { id: "s15", layout: "desktop", shot: "l3-imran", label: "Inflated sales caught",
    segs: [{ voice: "en", text: "Another inflated his sales and re-signed the whole ledger. The cost check still catches him: his stock cost is far too low for a tea stall." }] },
  { id: "s16", layout: "phone", shot: "v8-claims", label: "Rain cover files itself", points: ["Real rainfall + her own ledger", "No assessor. No bills.", "12 rain-out days · ₹9,570"],
    segs: [{ voice: "en", text: "And when the rains come? Her ledger plus the real rainfall record builds the claim. No assessor, no bills. For Savitri, twelve rain-out days, about ninety-five hundred rupees." }] },
  { id: "s17", layout: "desktop", shot: "i1-claims", label: "Insurer console · tampered claims held, not paid",
    segs: [{ voice: "en", text: "The insurer sees every claim, re-verified. Tampered ledgers are held, not paid. And we are honest about cost: this is the worst quarter, and the premium needed is far more than a vendor can pay. A pilot would fund it through the loan, or a subsidy." }] },

  { id: "s17a", layout: "features", big: "What makes Kamai powerful",
    segs: [{ voice: "en", say: `Here is what makes ${K} powerful. Her record cannot be quietly changed. Five fraud checks run on every book. Loans are sized on her weakest weeks. Claims follow her own verified losses. And cover raises what she can borrow: from seventeen to thirty-three thousand rupees, in our sample.`, text: "Here is what makes Kamai powerful. Her record cannot be quietly changed. Five fraud checks run on every book. Loans are sized on her weakest weeks. Claims follow her own verified losses. And cover raises what she can borrow: from ₹17,000 to ₹33,000, in our sample." }] },
  { id: "s17b", layout: "matrix", big: "Pieces exist. We found nothing that ties them together.",
    segs: [{ voice: "en", say: `Pieces of this exist. Ledger apps let vendors speak their entries. Pilots pay street vendors on rain and heat. P M Swanidhi gives small loans. We found no product that ties them together: a verifiable record, claims that follow her own loss, and cover that raises her loan. That is the gap ${K} fills.`, text: "Pieces of this exist. Ledger apps let vendors speak their entries. Pilots pay street vendors on rain and heat. PM SVANidhi gives small loans. We found no product that ties them together: a verifiable record, claims that follow her own loss, and cover that raises her loan. That is the gap Kamai fills." }] },

  // ───────────── ACT 5 · FUTURE ─────────────
  { id: "s18", layout: "real",
    left: ["Working today", ["Real accounts and a real database", "Real rainfall data", "Rules enforced on the server", "25 automated API tests, plus engine tests", "Hindi and English, keyboard and screen-reader friendly"]],
    right: ["Not yet", ["Real vendors: the demo vendors are samples", "UPI and bank data (needs an Account Aggregator)", "A partner lender and a licensed insurer", "SMS one-time codes", "A score calibrated on real repayment"]],
    segs: [{ voice: "en", text: "Today, this is a working product: real accounts, a real database, real rainfall, and rules enforced and tested on the server. The vendors in the demo are samples. We have not yet put it in front of real vendors." }] },
  { id: "s19", layout: "roadmap", big: "What comes next",
    steps: [["1", "Pilot", "One lender, a few hundred vendors. Does the score predict repayment?"], ["2", "Connect", "Bank data via Account Aggregator. Supplier receipts read from photos."], ["3", "Insure", "A licensed insurer. Cover bundled into the loan, or subsidised."], ["4", "Reach", "WhatsApp and phone calls, in more languages. Nothing to install."]],
    segs: [{ voice: "en", text: "Next: a pilot with one lender and a few hundred vendors, to see if the score predicts repayment. Then bank data through an Account Aggregator, receipts read from photos, a licensed insurer, and WhatsApp and phone calls in more languages. So no one has to install anything." }] },
  { id: "s20", layout: "closing", art: "dawn", big: "kamai", dev: "कमाई", small: "A passbook for people banks ignore.",
    segs: [{ voice: "en", say: `Savitri has worked eleven years without a single line on paper. ${K} gives her the first line. A passbook, for people banks ignore.`, text: "Savitri has worked eleven years without a single line on paper. Kamai gives her the first line. A passbook, for people banks ignore." }] },
];
