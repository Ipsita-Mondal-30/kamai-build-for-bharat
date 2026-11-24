// Hand-drawn SVG illustrations for the story scenes (1280x720). Flat vector style, warm/cool palettes per mood.
// Focal elements sit on the right so the left third stays quiet for text.
const rnd = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647);

// A woman in a sari, drawn from the shoulders up (plus arms). cx = head centre x, hy = head centre y, s = scale.
function woman({ cx, hy, s = 1, sari = "#2e8b8b", pallu = "#d9772b", skin = "#c68a5e", look = 0, handOnCheek = false, sad = false, torsoTo = 40 }) {
  const r = 24 * s, sh = hy + r + 8 * s, by = sh + torsoTo * s; // shoulder y, bottom y
  return `<g>
    <ellipse cx="${cx}" cy="${hy - 2 * s}" rx="${r + 3 * s}" ry="${r + 5 * s}" fill="#1b1411"/>
    <circle cx="${cx + look * 8 * s}" cy="${hy - r - 6 * s}" r="${11 * s}" fill="#1b1411"/>
    <path d="M${cx - 30 * s} ${by} Q${cx - 34 * s} ${sh} ${cx - 10 * s} ${sh - 4 * s} L${cx + 10 * s} ${sh - 4 * s} Q${cx + 34 * s} ${sh} ${cx + 30 * s} ${by} Z" fill="${sari}"/>
    <path d="M${cx - 22 * s} ${sh - 2 * s} L${cx + 26 * s} ${sh + 6 * s} L${cx + 30 * s} ${by} L${cx + 4 * s} ${by} Z" fill="${pallu}" opacity=".95"/>
    <rect x="${cx - 6 * s}" y="${hy + r - 4 * s}" width="${12 * s}" height="${12 * s}" fill="${skin}"/>
    <circle cx="${cx}" cy="${hy}" r="${r}" fill="${skin}"/>
    <path d="M${cx - r} ${hy - 4 * s} Q${cx} ${hy - r - 10 * s} ${cx + r} ${hy - 4 * s} Q${cx} ${hy - 12 * s} ${cx - r} ${hy - 4 * s}Z" fill="#1b1411"/>
    <circle cx="${cx + look * 3 * s}" cy="${hy - 7 * s}" r="${2.2 * s}" fill="#b3261e"/>
    <circle cx="${cx - 8 * s + look * 3 * s}" cy="${hy - 1 * s}" r="${1.8 * s}" fill="#2a1a12"/><circle cx="${cx + 8 * s + look * 3 * s}" cy="${hy - 1 * s}" r="${1.8 * s}" fill="#2a1a12"/>
    <path d="M${cx - 6 * s + look * 3 * s} ${hy + (sad ? 12 : 10) * s} Q${cx + look * 3 * s} ${hy + (sad ? 7.5 : 12) * s} ${cx + 6 * s + look * 3 * s} ${hy + (sad ? 12 : 10) * s}" stroke="#7a3b2a" stroke-width="${1.6 * s}" fill="none" stroke-linecap="round"/>
    ${handOnCheek ? `<circle cx="${cx + 22 * s}" cy="${hy + 12 * s}" r="${9 * s}" fill="${skin}"/><path d="M${cx + 24 * s} ${hy + 18 * s} L${cx + 40 * s} ${by}" stroke="${pallu}" stroke-width="${12 * s}" stroke-linecap="round"/>` : ""}
  </g>`;
}

// The tea cart: counter, body, wheels, striped awning. (x,y) = top-left of counter slab.
function cart({ x, y, body = "#b5532a", counter = "#2f8f8a", a1 = "#d6457a", a2 = "#f5e6c8", awnTop = 255, dark = false }) {
  const w = 330, stripes = 9, sw = (w + 40) / stripes;
  let aw = ""; for (let i = 0; i < stripes; i++) aw += `<path d="M${x - 30 + i * sw} ${awnTop} L${x - 30 + (i + 1) * sw} ${awnTop} L${x - 40 + (i + 1) * sw + 4} ${awnTop + 46} L${x - 40 + i * sw + 4} ${awnTop + 46}Z" fill="${i % 2 ? a2 : a1}"/>`;
  return `<g>
    <ellipse cx="${x + w / 2}" cy="${y + 150}" rx="${w / 2 + 30}" ry="14" fill="#000" opacity=".35"/>
    <rect x="${x + 12}" y="${y + 20}" width="${w - 24}" height="110" rx="10" fill="${body}"/>
    <rect x="${x + 36}" y="${y + 44}" width="120" height="64" rx="8" fill="${dark ? "#c9b896" : "#f1e2c0"}" opacity=".9"/>
    <rect x="${x - 6}" y="${y}" width="${w + 12}" height="26" rx="9" fill="${counter}"/>
    <circle cx="${x + 70}" cy="${y + 134}" r="30" fill="#17131c"/><circle cx="${x + 70}" cy="${y + 134}" r="11" fill="#d9c9a8"/>
    <circle cx="${x + w - 70}" cy="${y + 134}" r="30" fill="#17131c"/><circle cx="${x + w - 70}" cy="${y + 134}" r="11" fill="#d9c9a8"/>
    <rect x="${x + 6}" y="${awnTop}" width="7" height="${y - awnTop}" fill="#2a2330"/><rect x="${x + w - 13}" y="${awnTop}" width="7" height="${y - awnTop}" fill="#2a2330"/>
    ${aw}
  </g>`;
}

const glow = (cx, cy, r, c, o = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#g${cx}_${cy})" opacity="${o}"/><defs><radialGradient id="g${cx}_${cy}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>`;
const kettle = (x, y, s = 1, steam = true) => `<g>
  <ellipse cx="${x}" cy="${y}" rx="${34 * s}" ry="${28 * s}" fill="#b9bec4"/><ellipse cx="${x - 10 * s}" cy="${y - 8 * s}" rx="${12 * s}" ry="${9 * s}" fill="#e6e9ec" opacity=".8"/>
  <path d="M${x + 28 * s} ${y - 4 * s} L${x + 62 * s} ${y - 28 * s}" stroke="#b9bec4" stroke-width="${9 * s}" stroke-linecap="round"/>
  <path d="M${x - 24 * s} ${y - 20 * s} Q${x} ${y - 62 * s} ${x + 24 * s} ${y - 20 * s}" stroke="#5a5f66" stroke-width="${5 * s}" fill="none"/>
  <circle cx="${x}" cy="${y - 28 * s}" r="${5 * s}" fill="#5a5f66"/>
  ${steam ? [0, 1, 2].map(i => `<path d="M${x + 62 * s + i * 6 * s} ${y - 34 * s} q${-10 * s} ${-18 * s} 0 ${-34 * s} t0 ${-34 * s}" stroke="#fff" stroke-opacity=".28" stroke-width="${5 * s}" fill="none" stroke-linecap="round"/>`).join("") : ""}
</g>`;

export const ART = {
  // S01 · dawn: the stall lit by one warm bulb before the city wakes
  dawn: () => {
    const R = rnd(11); let sky = "", win = "";
    for (let i = 0; i < 16; i++) { const x = 300 + i * 64 + R() * 20, h = 60 + R() * 150, w = 42 + R() * 34; sky += `<rect x="${x}" y="${470 - h}" width="${w}" height="${h + 4}" fill="${i % 3 ? "#2a2145" : "#352a55"}"/>`; for (let k = 0; k < 4; k++) if (R() > 0.6) win += `<rect x="${x + 6 + R() * (w - 16)}" y="${470 - h + 12 + R() * (h - 24)}" width="5" height="7" fill="#f6c76a" opacity=".85"/>`; }
    return `<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
      <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14152f"/><stop offset=".55" stop-color="#6a3d6e"/><stop offset="1" stop-color="#f4a259"/></linearGradient>
      <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2438"/><stop offset="1" stop-color="#120f19"/></linearGradient></defs>
      <rect width="1280" height="720" fill="url(#sk)"/>${glow(930, 470, 300, "#ffd28a", .75)}
      ${sky}${win}<rect y="470" width="1280" height="250" fill="url(#gr)"/>
      <ellipse cx="930" cy="566" rx="260" ry="26" fill="#f6c76a" opacity=".22"/>
      <rect x="610" y="250" width="8" height="222" fill="#1d1827"/><rect x="598" y="244" width="40" height="12" rx="5" fill="#1d1827"/>${glow(618, 262, 90, "#ffd78a", .8)}
      ${cart({ x: 770, y: 410, awnTop: 250 })}
      ${glow(930, 306, 120, "#ffd78a", .9)}<circle cx="930" cy="306" r="8" fill="#fff3c9"/><path d="M930 296 V258" stroke="#2a2330" stroke-width="2"/>
      ${woman({ cx: 960, hy: 352, s: 1.45, look: -0.6, torsoTo: 34 })}
      ${kettle(850, 392, 0.95)}
      <rect x="1010" y="392" width="22" height="28" rx="4" fill="#f4e4bf" opacity=".9"/><rect x="1040" y="392" width="22" height="28" rx="4" fill="#f4e4bf" opacity=".9"/>
    </svg>`;
  },

  // S02 · the cash tin and a blank notebook: money in cash, nothing written down
  cash: () => `<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
      <defs><linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241713"/><stop offset="1" stop-color="#4a2a1c"/></linearGradient></defs>
      <rect width="1280" height="720" fill="url(#wl)"/>${glow(860, 90, 360, "#ffc873", .55)}
      <path d="M860 0 V80" stroke="#1c120e" stroke-width="3"/><circle cx="860" cy="92" r="13" fill="#ffe3a0"/>
      <rect y="470" width="1280" height="250" fill="#6b3f22"/><rect y="470" width="1280" height="14" fill="#9a6236"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="0" x2="1280" y1="${520 + i * 40}" y2="${520 + i * 40}" stroke="#55301a" stroke-width="3"/>`).join("")}
      <rect x="640" y="400" width="250" height="72" rx="8" fill="#3a2418" opacity=".9"/>
      ${[0, 1, 2, 3, 4].map(i => `<g><rect x="${654 + i * 46}" y="${410}" width="34" height="62" rx="5" fill="#f1dcae" opacity=".75"/><rect x="${657 + i * 46}" y="${436}" width="28" height="33" rx="3" fill="#a8641c" opacity=".9"/></g>`).join("")}
      ${kettle(1010, 440, 1.25)}
      <rect x="690" y="520" width="260" height="96" rx="10" fill="#566470"/><rect x="690" y="520" width="260" height="14" rx="6" fill="#7d8b97"/>
      <path d="M700 520 L760 470 L940 470 L950 520Z" fill="#6c7a86"/>
      ${[[-12, "#7cae88"], [0, "#8bbf97"], [12, "#6f9f7b"], [24, "#8bbf97"]].map(([a, c], i) => `<rect x="${740 + i * 34}" y="${462 - i % 2 * 8}" width="120" height="58" rx="3" fill="${c}" transform="rotate(${a} ${800 + i * 34} 500)" stroke="#4d7a5a" stroke-width="2"/>`).join("")}
      ${[[720, 540], [756, 556], [796, 546], [840, 560], [884, 548]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#f0c24a" stroke="#b3861f" stroke-width="3"/>`).join("")}
      <g transform="translate(0 -66) rotate(-6 1090 600)"><rect x="990" y="548" width="220" height="140" rx="6" fill="#efe4c8"/><rect x="990" y="548" width="220" height="140" rx="6" fill="none" stroke="#c8b98f" stroke-width="3"/>
      <line x1="1100" x2="1100" y1="548" y2="688" stroke="#c8b98f" stroke-width="3"/>${[0, 1, 2, 3, 4].map(i => `<line x1="1010" x2="1088" y1="${580 + i * 24}" y2="${580 + i * 24}" stroke="#d9cdaa" stroke-width="2"/><line x1="1112" x2="1192" y1="${580 + i * 24}" y2="${580 + i * 24}" stroke="#d9cdaa" stroke-width="2"/>`).join("")}</g>
      <rect x="1060" y="574" width="170" height="9" rx="4" fill="#1d3a6b" transform="rotate(-14 1145 579)"/>
    </svg>`,

  // S03 · the rain: grey-blue, empty stools, Savitri under the awning with nobody coming
  rain: () => {
    const R = rnd(5); let rain = "", rip = "";
    for (let i = 0; i < 300; i++) { const x = R() * 1400 - 60, y = R() * 720; rain += `<line x1="${x}" y1="${y}" x2="${x - 16}" y2="${y + 52}" stroke="#bcd0e4" stroke-opacity="${0.18 + R() * 0.3}" stroke-width="${1 + R() * 1.4}"/>`; }
    for (const [x, y, w] of [[300, 600, 120], [560, 640, 150], [980, 618, 190], [1160, 660, 110], [760, 674, 130]]) rip += `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w / 8}" fill="#3a4b5c" opacity=".7"/><ellipse cx="${x + 10}" cy="${y}" rx="${w / 3}" ry="${w / 24}" fill="none" stroke="#9db4c8" stroke-opacity=".7" stroke-width="1.5"/><ellipse cx="${x + 10}" cy="${y}" rx="${w / 5}" ry="${w / 40}" fill="none" stroke="#9db4c8" stroke-opacity=".7" stroke-width="1.5"/>`;
    return `<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
      <defs><linearGradient id="rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18222d"/><stop offset="1" stop-color="#46596b"/></linearGradient><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3844"/><stop offset="1" stop-color="#121920"/></linearGradient></defs>
      <rect width="1280" height="720" fill="url(#rs)"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<rect x="${320 + i * 100}" y="${300 - (i * 37 % 90)}" width="84" height="${200 + (i * 37 % 90)}" fill="#26323f" opacity=".85"/>`).join("")}
      <rect y="470" width="1280" height="250" fill="url(#rg)"/>${rip}
      ${glow(700, 300, 100, "#cfe0ee", .22)}<rect x="696" y="260" width="8" height="215" fill="#151c24"/>
      ${cart({ x: 770, y: 410, body: "#6e3a24", counter: "#2a6666", a1: "#8a3558", a2: "#b9b2a0", awnTop: 250, dark: true })}
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<line x1="${752 + i * 29}" x2="${752 + i * 29}" y1="${296}" y2="${316 + (i * 13 % 26)}" stroke="#9db4c8" stroke-opacity=".6" stroke-width="2"/>`).join("")}
      ${woman({ cx: 950, hy: 352, s: 1.45, sari: "#2a6a72", pallu: "#8f5a2f", look: 0.5, handOnCheek: true, sad: true, torsoTo: 34 })}
      ${kettle(850, 392, 0.95, false)}
      <g fill="#2a2430"><rect x="650" y="540" width="46" height="8" rx="3"/><rect x="656" y="548" width="6" height="40"/><rect x="684" y="548" width="6" height="40"/>
      <rect x="570" y="590" width="46" height="8" rx="3"/><rect x="576" y="598" width="6" height="36"/><rect x="604" y="598" width="6" height="36"/></g>
      ${rain}
    </svg>`;
  },

  // S04 · the bank: a grille window, a clerk, a form stamped "no income proof"
  bank: () => `<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
      <defs><linearGradient id="bw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c725f"/><stop offset=".5" stop-color="#d4c8ac"/><stop offset="1" stop-color="#c6b996"/></linearGradient></defs>
      <rect width="1280" height="720" fill="url(#bw)"/>
      <rect y="600" width="1280" height="120" fill="#6f634d"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${i * 180}" x2="${i * 180 - 40}" y1="600" y2="720" stroke="#5d523f" stroke-width="3"/>`).join("")}
      <rect x="760" y="92" width="220" height="56" rx="6" fill="#1f4a39"/><text x="870" y="132" font-family="Helvetica,Arial,sans-serif" font-size="34" font-weight="800" fill="#f4efe0" text-anchor="middle" letter-spacing="3">LOANS</text>
      <circle cx="1090" cy="120" r="42" fill="#f1ead6" stroke="#3a3428" stroke-width="5"/><path d="M1090 120 V92 M1090 120 L1110 130" stroke="#3a3428" stroke-width="4" stroke-linecap="round"/>
      <rect x="640" y="180" width="520" height="300" rx="10" fill="#242630"/><rect x="652" y="192" width="496" height="276" fill="#3a4a58" opacity=".55"/>
      <circle cx="900" cy="300" r="34" fill="#b07a52"/><path d="M866 292 Q900 252 934 292 Q900 276 866 292Z" fill="#1d1612"/>
      <path d="M836 468 Q842 346 900 340 Q958 346 964 468Z" fill="#9fb7d1"/><path d="M900 346 L886 372 L900 440 L914 372Z" fill="#fff"/><path d="M900 362 L893 372 L900 430 L907 372Z" fill="#b3261e"/>
      ${Array.from({ length: 17 }, (_, i) => `<line x1="${668 + i * 29}" x2="${668 + i * 29}" y1="192" y2="468" stroke="#15161b" stroke-width="4"/>`).join("")}<rect x="652" y="320" width="496" height="8" fill="#15161b"/>
      <rect x="610" y="480" width="580" height="30" fill="#8b6339"/><rect x="610" y="510" width="580" height="210" fill="#76532f"/>
      <g transform="rotate(-5 800 470)"><rect x="700" y="426" width="230" height="110" rx="3" fill="#f6f0dd"/>${[0, 1, 2, 3].map(i => `<line x1="716" x2="${i === 3 ? 830 : 914}" y1="${446 + i * 17}" y2="${446 + i * 17}" stroke="#bdb59c" stroke-width="3"/>`).join("")}</g>
      <g transform="rotate(-9 840 470)"><rect x="716" y="458" width="200" height="50" rx="4" fill="none" stroke="#b3261e" stroke-width="5"/><text x="816" y="492" font-family="Helvetica,Arial,sans-serif" font-size="18" font-weight="900" fill="#b3261e" text-anchor="middle" letter-spacing="1">NO INCOME PROOF</text></g>
      ${woman({ cx: 1215, hy: 450, s: 1.9, look: -1, sad: true, torsoTo: 120, sari: "#2e8b8b", pallu: "#d9772b" })}
      <rect y="0" width="1280" height="720" fill="#0b0b10" opacity=".18"/>
    </svg>`,
};
