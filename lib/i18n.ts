"use client";
import { useCallback, useEffect, useState } from "react";

export type Lang = "en" | "hi";

const D = {
  en: {
    hello: "Hello, {n} 🙏", sampleAcct: " · sample account", sayPrompt: 'Say: "Today 1800 sales and 1100 stock"', ph: "or type here…", save: "Save", forDay: "For day:",
    backfilled: "Earlier days are marked as back-filled.", today: "Today", sales: "sales", stock: "stock", earned: "earned",
    nothing: "Nothing recorded yet. Tap the mic and say your day.", entriesLine: "{n} entries · ledger ", intact: "✅ intact", failedChain: "❌ failed its integrity check",
    tabToday: "Today", tabScore: "Score", tabLoan: "Loan", tabRain: "Rain cover", mic: "Speak your day",
    building: "Building your record", progress: "{d} of {m} days logged. {l} more days unlocks your score and a loan offer. Log a little every day.",
    yourSales: "Your sales & real rainfall", orangeNote: "Orange = rain-out day (real rainfall in {c})",
    aaNote: "UPI and receipt checks need a bank link (Account Aggregator), which is not connected yet. Until then your entries count as self-reported.",
    canBorrow: "You can borrow", loanDesc: "12 months · 18% a year · based on your weakest weeks, not your best",
    loanNoReady: "Your record does not support a loan yet. Keep logging honestly.", unlocks: "Unlocks after {m} days of records ({l} to go).",
    emi: "monthly EMI", verified: "independently verified", rainAdds: "🌧️ Your rain cover adds {a} to this offer (it would be {b} without it).",
    apply: "Apply with one tap", sent: "Application sent", shareNote: "Applying shares your ledger summary and score with the lender. Nothing is shared until you tap.",
    approved: "✅ Approved", declined: "Declined", withLender: "⏳ With the lender", decisionDone: "Decision recorded. The lender will contact you.", sentOn: "Sent {d}.", openSampleLender: "Open the sample lender to decide.",
    rainTitle: "Barish Suraksha · rain cover", rainNone: "A rain-out day is heavy rain (15 mm+) when your sales fall below half of normal. None yet in {c}.", rainSome: "{n} rain-out days in your record",
    soldUsually: "Sold {a}, usually {b}", filed: "✅ filed", fileAll: 'बोलिए "हाँ" · file all claims', claimNote: "The claim is built from real rainfall and your own ledger. No bills or forms. (Payouts are simulated until an insurer partner is connected.)",
    loading: "Loading your ledger…", lang: "हिन्दी",
    // join
    createAcct: "Create your account", welcome: "Welcome back", signUp: "Sign up", logIn: "Log in", iAm: "I am a", rVendor: "🛒 Street vendor / small shop", rLender: "🏦 Lender", rInsurer: "🌧️ Insurer",
    yourName: "Your name", mobile: "Mobile number", pin: "PIN (4 to 6 digits)", city: "City", chooseCity: "Choose your city", sell: "What do you sell?", choose: "Choose", code: "Access code",
    wait: "Please wait…", create: "Create account", privacy: "Your records stay private. Lenders and insurers only see what you choose to send: a loan application or a claim. Your PIN is stored hashed.",
    exploring: "Just exploring?", exploringNote: "Open the sample accounts. They hold fictional vendors (on real rainfall) so you can see every screen filled in.", sVendor: "Sample vendor", sLender: "Sample lender", sInsurer: "Sample insurer",
  },
  hi: {
    hello: "नमस्ते, {n} 🙏", sampleAcct: " · नमूना खाता", sayPrompt: 'बोलिए: "आज 1800 की बिक्री और 1100 का माल"', ph: "या यहाँ लिखिए…", save: "सहेजें", forDay: "किस दिन का:",
    backfilled: "पुराने दिनों की एंट्री “बाद में भरी गई” मानी जाती है।", today: "आज", sales: "बिक्री", stock: "माल", earned: "कमाई",
    nothing: "अभी कुछ दर्ज नहीं है। माइक दबाकर अपना दिन बोलिए।", entriesLine: "{n} एंट्री · बही ", intact: "✅ सुरक्षित", failedChain: "❌ जाँच में फेल",
    tabToday: "आज", tabScore: "स्कोर", tabLoan: "लोन", tabRain: "बारिश बीमा", mic: "अपना दिन बोलिए",
    building: "आपका रिकॉर्ड बन रहा है", progress: "{d}/{m} दिन दर्ज हुए। {l} और दिन में स्कोर और लोन ऑफ़र खुलेगा। रोज़ थोड़ा-थोड़ा दर्ज करें।",
    yourSales: "आपकी बिक्री और असली बारिश", orangeNote: "नारंगी = बारिश से बंद दिन ({c} की असली बारिश)",
    aaNote: "UPI और रसीद की जाँच के लिए बैंक लिंक (Account Aggregator) चाहिए, जो अभी जुड़ा नहीं है। तब तक आपकी एंट्री आपके अपने बताए अनुसार मानी जाती हैं।",
    canBorrow: "आप उधार ले सकते हैं", loanDesc: "12 महीने · 18% सालाना · आपके सबसे कमज़ोर हफ़्तों के आधार पर",
    loanNoReady: "आपके रिकॉर्ड पर अभी लोन नहीं बनता। ईमानदारी से दर्ज करते रहिए।", unlocks: "{m} दिन के रिकॉर्ड के बाद खुलेगा ({l} बाकी)।",
    emi: "मासिक किस्त", verified: "स्वतंत्र रूप से जाँचा", rainAdds: "🌧️ आपका बारिश बीमा इस ऑफ़र में {a} जोड़ता है (इसके बिना {b} होता)।",
    apply: "एक टैप में आवेदन करें", sent: "आवेदन भेजा गया", shareNote: "आवेदन करने पर आपकी बही का सार और स्कोर लेनदार को दिखेगा। टैप करने से पहले कुछ साझा नहीं होता।",
    approved: "✅ मंज़ूर", declined: "अस्वीकृत", withLender: "⏳ लेनदार के पास", decisionDone: "फ़ैसला दर्ज हुआ। लेनदार आपसे संपर्क करेगा।", sentOn: "{d} को भेजा गया।", openSampleLender: "फ़ैसला देखने के लिए नमूना लेनदार खोलिए।",
    rainTitle: "बारिश सुरक्षा · बारिश बीमा", rainNone: "बारिश से बंद दिन वह है जब 15 मिमी+ बारिश हो और आपकी बिक्री सामान्य की आधी से कम रहे। {c} में अभी कोई नहीं।", rainSome: "आपके रिकॉर्ड में {n} बारिश से बंद दिन",
    soldUsually: "बिक्री {a}, आमतौर पर {b}", filed: "✅ दर्ज", fileAll: 'बोलिए "हाँ" · सभी दावे दर्ज करें', claimNote: "दावा असली बारिश और आपकी अपनी बही से बनता है। कोई बिल या फ़ॉर्म नहीं। (बीमा साझेदार जुड़ने तक भुगतान नकली हैं।)",
    loading: "आपकी बही खुल रही है…", lang: "English",
    createAcct: "अपना खाता बनाइए", welcome: "वापस स्वागत है", signUp: "नया खाता", logIn: "लॉग इन", iAm: "मैं हूँ", rVendor: "🛒 ठेला / छोटी दुकान", rLender: "🏦 लेनदार", rInsurer: "🌧️ बीमा कंपनी",
    yourName: "आपका नाम", mobile: "मोबाइल नंबर", pin: "पिन (4 से 6 अंक)", city: "शहर", chooseCity: "अपना शहर चुनें", sell: "आप क्या बेचते हैं?", choose: "चुनें", code: "एक्सेस कोड",
    wait: "कृपया रुकिए…", create: "खाता बनाएँ", privacy: "आपके रिकॉर्ड निजी रहते हैं। लेनदार और बीमा कंपनी वही देखते हैं जो आप भेजते हैं: लोन का आवेदन या दावा। आपका पिन सुरक्षित (हैश) रखा जाता है।",
    exploring: "बस देखना चाहते हैं?", exploringNote: "नमूना खाते खोलिए। इनमें काल्पनिक विक्रेता (असली बारिश पर) हैं, ताकि हर स्क्रीन भरी दिखे।", sVendor: "नमूना विक्रेता", sLender: "नमूना लेनदार", sInsurer: "नमूना बीमाकर्ता",
  },
} as const;

export type Key = keyof typeof D.en;

export function useLang() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => { const s = localStorage.getItem("kamai.lang"); if (s === "hi" || s === "en") setLang(s); }, []);
  useEffect(() => { document.documentElement.lang = lang === "hi" ? "hi" : "en"; }, [lang]);
  const toggle = useCallback(() => setLang(l => { const n = l === "en" ? "hi" : "en"; localStorage.setItem("kamai.lang", n); return n; }), []);
  const t = useCallback((k: Key, v?: Record<string, string | number>) => {
    let s: string = D[lang][k] ?? D.en[k];
    if (v) for (const [a, b] of Object.entries(v)) s = s.replaceAll("{" + a + "}", String(b));
    return s;
  }, [lang]);
  return { lang, t, toggle };
}
