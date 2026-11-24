// Browser voice helpers: Hindi speech out, Hindi speech in (Chrome).
export function speak(t: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.lang = "hi-IN"; speechSynthesis.speak(u);
}
export function listen(onText: (t: string) => void, onState: (on: boolean) => void) {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) { alert("Voice input works in Chrome. You can type instead."); return; }
  const r = new SR(); r.lang = "hi-IN"; onState(true);
  r.onresult = (e: any) => onText(e.results[0][0].transcript);
  r.onend = () => onState(false);
  r.start();
}
