// Shared by the Problem page and the demo video so both always tell the same story.
// Marks: "y" yes · "p" partly · "x" not found in public sources. Our analysis of public sources; may be out of date.
export const COLS = ["Bank loan", "PM SVANidhi", "Ledger apps", "Rain / heat cover pilots", "Kamai"];

export const ROWS: [string, string[]][] = [
  ["Works for a cash vendor with no paperwork", ["x", "p", "y", "y", "y"]],
  ["Entries in her own language, by voice", ["x", "x", "y", "x", "y"]],
  ["A record a lender can verify", ["x", "x", "p", "x", "y"]],
  ["Fraud checks on the books", ["x", "x", "x", "x", "y"]],
  ["Loan sized on her own stressed income", ["p", "x", "x", "x", "y"]],
  ["Pays automatically on rain-out days", ["x", "x", "x", "y", "y"]],
  ["Payout follows her own verified loss", ["x", "x", "x", "p", "y"]],
  ["Cover raises what she can borrow", ["x", "x", "x", "x", "y"]],
];

export const COMPARE_NOTE =
  "Ledger apps: e.g. OkCredit (voice notes, regional languages) and Khatabook. Cover pilots: e.g. SEWA's parametric rain and heat cover for informal workers. Our reading of public sources, not a product-by-product audit: a mark of ✕ means we did not find it, not that it is impossible.";

export const FEATURES: [string, string, string][] = [
  ["🔒", "A record that can't be quietly changed", "Hash-chained on the server. Edit one entry and every later fingerprint breaks."],
  ["🕵️", "Five fraud checks run on every book", "Broken chain · stock cost too low for the trade · copy-paste sales · back-filled entries · cash up, UPI flat."],
  ["⚖️", "Loans sized on her weakest weeks", "Stressed income, not her best days. EMI capped at 35% of it."],
  ["🌧️", "Claims from her own verified loss", "Real rainfall plus a sales drop in her ledger. Not just a weather index."],
  ["📈", "Cover that raises what she can borrow", "In the sample, rain cover lifts the offer from ₹17,000 to ₹33,000."],
  ["🤝", "One record, three trusted users", "Vendor, lender and insurer read the same ledger, re-verified every time it is opened."],
];
