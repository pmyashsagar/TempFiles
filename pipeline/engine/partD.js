
// ═════════════════════════ Part 1: cut-paper night scenes (screen space, 1080 × 1920) ═════════════════════════
// Layout law for every scene: title strip y 130–400, picture y 420–1320, label strip y 1340–1470, caption slip below y 1520.
// Nothing in the picture carries a label on top of it; labels live in their own strip and never overlap drawings.
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const hsh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const hshS = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; };
const CRM = '#fff3d6', GOLD = '#ffc857', WIN = [255, 207, 112];
const rg = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
let PQ = {}; const P = (id, k = 0) => PQ[id][k].t0;

function glowAt(x, y, r, col, a) {
  if (a <= 0.002) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rg(col, a)); g.addColorStop(0.4, rg(col, a * 0.35)); g.addColorStop(1, rg(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function skyGrad(stops) { const g = ctx.createLinearGradient(0, 0, 0, H); for (const [p, c] of stops) g.addColorStop(p, c); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function starsDraw(t, n, ymax, seed = 1, a = 1) { for (let i = 0; i < n; i++) { const x = hsh(i * 3.1 + seed) * W, y = hsh(i * 7.7 + seed) * ymax, r = 0.8 + hsh(i + seed) * 1.8, tw = 0.55 + 0.45 * Math.sin(t * 1.6 + i); ctx.fillStyle = `rgba(255,240,210,${0.7 * a * tw})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } }
function moonDraw(x, y, r) {
  glowAt(x, y, r * 3.4, [255, 236, 190], 0.3); ctx.fillStyle = '#f6ecd2'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(190,172,140,.5)'; for (const [dx, dy, rr_] of [[-.3, -.2, .2], [.3, .15, .14], [-.1, .45, .11], [.35, -.35, .09]]) { ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr_ * r, 0, TAU); ctx.fill(); }
}
function sil(build, fill, rim) { if (rim) { ctx.save(); ctx.translate(0, -3); ctx.fillStyle = rim; build(); ctx.fill(); ctx.restore(); } ctx.fillStyle = fill; build(); ctx.fill(); }
function houseP(x, b, w, h, rh) { ctx.beginPath(); ctx.moveTo(x, b); ctx.lineTo(x, b - h); ctx.lineTo(x + w / 2, b - h - rh); ctx.lineTo(x + w, b - h); ctx.lineTo(x + w, b); ctx.closePath(); }
function skyline(t, b, seed, x0, x1, fill, rim, o = {}) {              // a row of paper houses; returns them so flames can sit on top
  const out = []; let x = x0, i = 0;
  while (x < x1) {
    const w = (o.w || 70) + hsh(seed + i) * (o.w || 70), h = (o.h || 90) + hsh(seed + i * 1.7) * (o.hv || 150), rh = 36 + hsh(seed + i * 2.3) * 48;
    out.push({ x, b, w, h, rh }); sil(() => houseP(x, b, w, h, rh), fill, rim);
    if (o.win) for (let k = 0; k < 4; k++) {
      const wx = x + w * (0.2 + (k % 2) * 0.4), wy = b - h + h * (0.2 + Math.floor(k / 2) * 0.38);
      if (hsh(seed + i * 9 + k) < o.win) { const fl = 0.7 + 0.3 * Math.sin(t * 3 + i + k * 2); ctx.fillStyle = rg(WIN, 0.85 * fl); ctx.fillRect(wx, wy, w * 0.16, h * 0.14); }
    }
    x += w * (0.86 + hsh(i) * 0.2); i++;
  }
  return out;
}
function flameDraw(cx, b, h, w, t, seed, gl = 1) {
  if (h < 4) return; const sw = Math.sin(t * 7 + seed * 3) * w * 0.12;
  const tg = sc => { const hh = h * sc, ww = w * (0.6 + 0.4 * sc); ctx.beginPath(); ctx.moveTo(cx - ww / 2, b); ctx.bezierCurveTo(cx - ww * 0.8 + sw, b - hh * 0.4, cx - ww * 0.15 + sw, b - hh * 0.62, cx + ww * 0.1 + sw * 2, b - hh); ctx.bezierCurveTo(cx + ww * 0.55 + sw, b - hh * 0.55, cx + ww * 0.8 + sw * 0.5, b - hh * 0.28, cx + ww / 2, b); ctx.closePath(); };
  glowAt(cx, b - h * 0.5, h * 1.5, [255, 130, 50], 0.34 * gl);
  ctx.fillStyle = '#e2452b'; tg(1); ctx.fill(); ctx.fillStyle = '#ff8a2b'; tg(0.72); ctx.fill(); ctx.fillStyle = '#ffd35a'; tg(0.42); ctx.fill();
}
function embers(t, x0, x1, yb, n, seed, a = 1) {
  for (let i = 0; i < n; i++) { const ph = (t * 0.28 * (0.5 + hsh(i + seed)) + hsh(i * 2 + seed)) % 1, x = x0 + hsh(i * 5.3 + seed) * (x1 - x0) + Math.sin(t * 2 + i) * 16, y = yb - ph * 520 * (0.6 + hsh(i + 2) * 0.8);
    ctx.fillStyle = `rgba(255,${150 + (hsh(i) * 80 | 0)},60,${(1 - ph) * 0.9 * a})`; ctx.beginPath(); ctx.arc(x, y, 1.4 + hsh(i + 9) * 2.2, 0, TAU); ctx.fill(); }
}
function smoke(t, x, y, w, a, seed = 1) {
  for (let k = 0; k < 8; k++) { const ph = (t * 0.1 + k / 8) % 1, yy = y - ph * 560, xx = x + Math.sin(ph * 5 + seed + k) * 70 + ph * 140, r = w * (0.9 + ph * 1.5), al = 0.55 * a * (1 - ph * 0.85);
    const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, r); g.addColorStop(0, `rgba(28,12,26,${al})`); g.addColorStop(1, 'rgba(28,12,26,0)'); ctx.fillStyle = g; ctx.fillRect(xx - r, yy - r, r * 2, r * 2); }
}
const LAY = {};
function wText(key, str, x, y, size, font, col, t, t0, dur, o = {}) {
  if (t < t0) return; let T = LAY[key];
  if (!T) { const sv = SEED; SEED = hshS(key); T = textLayout(str, x, y, size, { f: font, align: o.align || 'center', col, jit: o.jit ?? 1 }); SEED = sv; LAY[key] = T; }
  ctx.save(); if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 24; } textDraw(T, clamp((t - t0) / (dur || T.L / 2300))); ctx.restore();
}
function titleDraw(key, l1, l2, t, t0) {                  // the title strip: one big line, one small line, nothing else lives here
  wText(key + 'a', l1, W / 2, 285, 104, 'KB', CRM, t, t0, 0.9, { glow: 'rgba(255,140,60,.55)' });
  if (l2) wText(key + 'b', l2, W / 2, 372, 58, 'PH', GOLD, t, t0 + 0.7, 0.9);
}
function chip(key, lines, cx, cy, t, t0, o = {}) {          // a paper label plate in the label strip
  const age = t - t0; if (age < 0) return;
  ctx.save(); const ws = lines.map(l => { ctx.font = `${l[1]}px ${l[2] || 'PH'}`; return ctx.measureText(l[0]).width; });
  const w = Math.max(...ws) + 90, hgt = lines.reduce((a, l) => a + l[1] * 1.14, 0) + 36, k = eo(age / 0.28), s = 0.88 + 0.12 * k;
  ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(-0.012 * (1 - k)); ctx.globalAlpha = Math.min(1, age / 0.12);
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8; ctx.fillStyle = '#fff6e2'; ctx.fill(pathOf(rrect(-w / 2, -hgt / 2, w, hgt, 22))); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(70,50,40,.55)'; ctx.lineWidth = 2.2; ctx.stroke(pathOf(rrect(-w / 2 + 6, -hgt / 2 + 6, w - 12, hgt - 12, 18)));
  ctx.save(); ctx.translate(-w / 2 + 40, -hgt / 2 + 2); ctx.rotate(-0.2); ctx.fillStyle = 'rgba(255,200,70,.85)'; ctx.fillRect(-36, -12, 72, 24); ctx.restore(); ctx.restore();
  let y = cy - hgt / 2 + 18;
  lines.forEach(([s, size, font], i) => { y += size * 0.86; wText(key + 'L' + i, s, cx, y, size, font || 'PH', '#2b2420', t, t0 + 0.2 + i * 0.5, null, { jit: 0.6 }); y += size * 0.28; });
  if (o.mark && age > 0.9) { const l = lines[lines.length - 1], wl = ws[ws.length - 1], p = ss((age - 0.9) / 0.5); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = 'rgba(255,196,40,.75)'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - wl / 2, y - 2); ctx.lineTo(cx - wl / 2 + wl * p, y - 2 + 3); ctx.stroke(); ctx.restore(); }
}
function chipSeq(key, arr, t, cx = W / 2, cy = 1405) { let k = -1; arr.forEach(([t0], i) => { if (t >= t0) k = i; }); if (k >= 0) chip(key + k, arr[k][1], cx, cy, t, arr[k][0], arr[k][2] || {}); }

// ───────────── figures ─────────────
function persSil(cx, feet, s, col, o = {}) {                 // a paper-cut person: coat, head, optional cap / wig / candle
  ctx.save(); ctx.translate(cx, feet); ctx.scale(s, s);
  sil(() => { ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-34, -120); ctx.quadraticCurveTo(0, -150, 34, -120); ctx.lineTo(42, 0); ctx.closePath(); }, col, o.rim);
  sil(() => { ctx.beginPath(); ctx.arc(0, -160, 28, 0, TAU); }, o.skin || col, o.rim);
  if (o.cap) sil(() => { ctx.beginPath(); ctx.ellipse(0, -180, 34, 14, 0, 0, TAU); }, '#efe3cb', null);
  if (o.wig) sil(() => { ctx.beginPath(); ctx.arc(-20, -156, 20, 0, TAU); ctx.moveTo(40, -156); ctx.arc(20, -156, 20, 0, TAU); ctx.moveTo(24, -184); ctx.arc(0, -184, 26, 0, TAU); }, '#6a5870', null);
  ctx.restore();
}
function candleDraw(x, y, t, s = 1) { ctx.fillStyle = '#e9dcc0'; ctx.fillRect(x - 10 * s, y - 10 * s, 20 * s, 40 * s); const fl = 1 + 0.12 * Math.sin(t * 11 + x); glowAt(x, y - 30 * s, 260 * s, [255, 170, 70], 0.35 * fl); flameDraw(x, y - 8 * s, 40 * s * fl, 18 * s, t, x, 0.4); }
function pepysBust(cx, cy, t, o = {}) {                      // Samuel Pepys: great curled wig, white collar, dark coat
  const br = 1 + 0.004 * Math.sin(t * 1.4); ctx.save(); ctx.translate(cx, cy); ctx.scale(br, br);
  sil(() => { ctx.beginPath(); ctx.moveTo(-220, 230); ctx.lineTo(-185, 125); ctx.lineTo(-100, 85); ctx.lineTo(100, 85); ctx.lineTo(185, 125); ctx.lineTo(220, 230); ctx.closePath(); }, '#3b2742', 'rgba(255,170,90,.45)');
  const wigC = '#5a4660'; sil(() => { ctx.beginPath(); ctx.ellipse(-80, 10, 78, 168, 0.1, 0, TAU); ctx.ellipse(80, 10, 78, 168, -0.1, 0, TAU); ctx.ellipse(0, -118, 130, 90, 0, 0, TAU); }, wigC, 'rgba(255,170,90,.5)');
  ctx.strokeStyle = 'rgba(255,225,200,.35)'; ctx.lineWidth = 3; for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * (96 - (i % 2) * 22), -30 + i * 36, 16, 0, 5); ctx.stroke(); }
  sil(() => { ctx.beginPath(); ctx.ellipse(0, -8, 62, 80, 0, 0, TAU); }, '#f4d9b8', null);
  ctx.fillStyle = '#2b1e22'; ctx.beginPath(); ctx.arc(-24, -22, 5, 0, TAU); ctx.arc(24, -22, 5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2b1e22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, -36); ctx.lineTo(-14, -39); ctx.moveTo(14, -39); ctx.lineTo(34, -36); ctx.moveTo(0, -18); ctx.quadraticCurveTo(-8, 8, 4, 12); ctx.moveTo(-18, 32); ctx.quadraticCurveTo(0, 42, 20, 30); ctx.stroke();
  ctx.fillStyle = '#fff1d8'; ctx.beginPath(); ctx.moveTo(-50, 90); ctx.lineTo(0, 150); ctx.lineTo(0, 86); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(50, 90); ctx.lineTo(0, 150); ctx.lineTo(0, 86); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ───────────── scenes ─────────────
const SCN = [];
function scene(id, a, b, kind, draw) { SCN.push({ id, a, b, kind, draw }); }
const PUSH = (t, a, b, z0 = 1, z1 = 1.035) => { const z = lerp(z0, z1, clamp((t - a) / (b - a))); ctx.translate(0, 45); ctx.translate(W / 2, 900); ctx.scale(z, z); ctx.translate(-W / 2, -900); };

function buildScenes() {
  const T0 = {}; const ids = ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09', 'l10', 'l11']; ids.forEach((id, i) => T0[id] = Math.max(0, P(id, 0) - 0.12));
  const END = TLJ.dur;

  // 1 · the question
  scene('hook', 0, T0.l02, 'p1', t => {
    skyGrad([[0, '#090820'], [0.55, '#2a1240'], [1, '#6a2440']]); starsDraw(t, 90, 950, 1);
    const on = ss(seg(t, P('l01', 0) + 2.4, P('l01', 0) + 5.5));
    glowAt(W * 0.6, 1230, 620, [255, 100, 40], 0.6 * on);
    ctx.save(); PUSH(t, 0, T0.l02);
    skyline(t, 1290, 11, -30, W + 60, '#4b2650', `rgba(255,150,70,${0.3 * on})`, { w: 60, h: 80, hv: 120 });
    const near = skyline(t, 1400, 5, -40, W + 60, '#1a0f24', `rgba(255,150,70,${0.4 * on})`, { w: 80, h: 110, hv: 150, win: 0.5 });
    near.forEach((h, i) => { if (h.x > 380 && h.x < 880) flameDraw(h.x + h.w / 2, h.b - h.h - h.rh * 0.3, (90 + hsh(i) * 90) * on, 54, t, i, on); });
    embers(t, 420, 900, 1180, 26, 3, on); smoke(t, 640, 1130, 90, on); ctx.restore();
    wText('q1', 'What would you write down,', W / 2, 290, 74, 'KB', CRM, t, P('l01', 0) + 0.0, 1.5, { glow: 'rgba(255,140,60,.55)' });
    wText('q2', 'if your city was on fire?', W / 2, 385, 74, 'KB', CRM, t, P('l01', 0) + 1.55, 1.4, { glow: 'rgba(255,140,60,.55)' });
  });

  // 2 · Samuel Pepys, 1666
  scene('pepys', T0.l02, T0.l03, 'p1', t => {
    skyGrad([[0, '#150c1c'], [1, '#3a2030']]);
    // a night window, a desk, a candle
    ctx.save(); PUSH(t, T0.l02, T0.l03);
    ctx.fillStyle = '#0d1030'; ctx.beginPath(); ctx.moveTo(110, 900); ctx.lineTo(110, 640); ctx.arc(215, 640, 105, Math.PI, 0); ctx.lineTo(320, 900); ctx.closePath(); ctx.fill(); starsDraw(t, 20, 500, 4, 0.7);
    ctx.save(); ctx.beginPath(); ctx.moveTo(110, 900); ctx.lineTo(110, 640); ctx.arc(215, 640, 105, Math.PI, 0); ctx.lineTo(320, 900); ctx.closePath(); ctx.clip(); moonDraw(250, 600, 34); ctx.restore();
    ctx.strokeStyle = '#4a2f2a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(110, 900); ctx.lineTo(110, 640); ctx.arc(215, 640, 105, Math.PI, 0); ctx.lineTo(320, 900); ctx.closePath(); ctx.stroke(); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(215, 535); ctx.lineTo(215, 900); ctx.moveTo(110, 740); ctx.lineTo(320, 740); ctx.stroke();
    candleDraw(850, 1075, t, 1.4); glowAt(520, 900, 560, [255, 170, 80], 0.16);
    pepysBust(520, 760, t);
    sil(() => { ctx.beginPath(); ctx.moveTo(60, 1330); ctx.lineTo(90, 1010); ctx.lineTo(990, 1010); ctx.lineTo(1020, 1330); ctx.closePath(); }, '#2b1a22', 'rgba(255,160,80,.5)');
    // the diary on the desk: two pages, lines of shorthand being written
    sil(() => { ctx.beginPath(); ctx.moveTo(330, 1085); ctx.lineTo(515, 1055); ctx.lineTo(515, 1210); ctx.lineTo(330, 1235); ctx.closePath(); ctx.moveTo(525, 1055); ctx.lineTo(710, 1085); ctx.lineTo(710, 1235); ctx.lineTo(525, 1210); ctx.closePath(); }, '#f6ead0', null);
    ctx.strokeStyle = 'rgba(60,40,40,.7)'; ctx.lineWidth = 2.4; const wr = ss(seg(t, P('l02', 2), P('l02', 2) + 4));
    for (let r = 0; r < 5; r++) for (const sd of [0, 1]) { const x0 = sd ? 545 : 350, y0 = (sd ? 1085 : 1090) + r * 28 + (sd ? r * 3 : -r * 3), len = 150 * clamp(wr * 5 - r); ctx.beginPath(); for (let k = 0; k <= len; k += 6) { const y = y0 + Math.sin(k * 0.3 + r) * 4; k ? ctx.lineTo(x0 + k, y) : ctx.moveTo(x0, y); } ctx.stroke(); }
    ctx.strokeStyle = '#efe3cb'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(660, 1010); ctx.lineTo(560 + 90 * wr, 1090 + Math.sin(t * 5) * 4); ctx.stroke();           // the quill
    ctx.restore();
    titleDraw('pe', 'LONDON, 1666', null, t, T0.l02 + 0.1);
  });

  // 3 · three in the morning
  scene('am3', T0.l03, T0.l04, 'p1', t => {
    skyGrad([[0, '#0d122c'], [1, '#262750']]);
    ctx.save(); PUSH(t, T0.l03, T0.l04);
    const gl = ss(seg(t, P('l03', 1), P('l03', 1) + 3));
    ctx.save(); ctx.beginPath(); ctx.moveTo(130, 1000); ctx.lineTo(130, 640); ctx.arc(330, 640, 200, Math.PI, 0); ctx.lineTo(530, 1000); ctx.closePath(); ctx.clip();
    const wg = ctx.createLinearGradient(0, 450, 0, 1000); wg.addColorStop(0, '#0b1030'); wg.addColorStop(0.6, '#3a2150'); wg.addColorStop(1, `rgb(${120 + 100 * gl | 0},${50 + 40 * gl | 0},50)`); ctx.fillStyle = wg; ctx.fillRect(100, 400, 460, 620);
    starsDraw(t, 30, 700, 8, 0.8); moonDraw(220, 570, 40); glowAt(430, 980, 300, [255, 110, 40], 0.7 * gl);
    skyline(t, 1000, 21, 100, 560, '#150c20', null, { w: 40, h: 40, hv: 50 }); flameDraw(420, 960, 70 * gl, 38, t, 1, gl); flameDraw(470, 970, 54 * gl, 30, t, 2, gl); ctx.restore();
    ctx.strokeStyle = '#4a2f2a'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(130, 1000); ctx.lineTo(130, 640); ctx.arc(330, 640, 200, Math.PI, 0); ctx.lineTo(530, 1000); ctx.closePath(); ctx.stroke(); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(330, 440); ctx.lineTo(330, 1000); ctx.moveTo(130, 760); ctx.lineTo(530, 760); ctx.stroke();
    // clock at 3
    const cc = [840, 620], ca = ss(seg(t, P('l03', 0) + 0.3, P('l03', 0) + 1));
    ctx.save(); ctx.globalAlpha = ca; ctx.fillStyle = '#f6ecd2'; ctx.beginPath(); ctx.arc(cc[0], cc[1], 90, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4a2f2a'; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = '#2b1e22'; ctx.lineWidth = 4; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.beginPath(); ctx.moveTo(cc[0] + Math.cos(a) * 70, cc[1] + Math.sin(a) * 70); ctx.lineTo(cc[0] + Math.cos(a) * 80, cc[1] + Math.sin(a) * 80); ctx.stroke(); }
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cc[0], cc[1]); ctx.lineTo(cc[0] + 46, cc[1]); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cc[0], cc[1]); ctx.lineTo(cc[0], cc[1] - 66); ctx.stroke(); ctx.restore();
    // the bed and the sleeper, who sits up to look and then lies back down
    const sit = ss(seg(t, P('l03', 2) - 0.3, P('l03', 2) + 0.6)) * (1 - ss(seg(t, P('l03', 3) - 0.1, P('l03', 3) + 0.7)));
    sil(() => { ctx.beginPath(); ctx.moveTo(90, 1320); ctx.lineTo(90, 1090); ctx.lineTo(130, 1070); ctx.lineTo(130, 1320); ctx.closePath(); ctx.moveTo(130, 1160); ctx.lineTo(700, 1160); ctx.lineTo(700, 1320); ctx.lineTo(130, 1320); ctx.closePath(); }, '#3f3a66', 'rgba(160,170,255,.35)');
    sil(() => { ctx.beginPath(); ctx.ellipse(230, 1150, 70, 26, 0, 0, TAU); }, '#e9e1f4', null);
    ctx.save(); ctx.translate(250, 1140 - 90 * sit); ctx.rotate(-0.12 * sit);
    sil(() => { ctx.beginPath(); ctx.arc(0, -30, 44, 0, TAU); }, '#f1d7b6', null); sil(() => { ctx.beginPath(); ctx.moveTo(-46, -44); ctx.quadraticCurveTo(0, -110, 52, -42); ctx.lineTo(60, -60); ctx.quadraticCurveTo(0, -150, -52, -60); ctx.closePath(); }, '#e9e1f4', null);
    ctx.fillStyle = '#2b1e22'; ctx.beginPath(); ctx.arc(6 + 8 * sit, -32, 4, 0, TAU); ctx.arc(30 + 8 * sit, -32, 4, 0, TAU); ctx.fill(); ctx.restore();
    sil(() => { ctx.beginPath(); ctx.moveTo(130, 1180); ctx.lineTo(700, 1180); ctx.lineTo(700, 1320); ctx.lineTo(130, 1320); ctx.closePath(); }, '#5b4a80', 'rgba(190,160,255,.3)');
    // the maid with a candle, arriving from the right
    const mx = lerp(1180, 900, ss(seg(t, P('l03', 0), P('l03', 0) + 0.9)));
    persSil(mx, 1320, 1.7, '#3a2540', { cap: true, skin: '#dfbf9d', rim: 'rgba(255,170,90,.55)' }); candleDraw(mx - 78, 1130, t, 0.8);
    ctx.restore();
    titleDraw('am', '3 A.M.', null, t, T0.l03 + 0.1);
    if (t > P('l03', 3)) for (let i = 0; i < 3; i++) wText('z' + i, 'z', 330 + i * 70, 1010 - i * 56 - Math.sin(t * 2 + i) * 6, 64 - i * 8, 'KB', '#d9d2f2', t, P('l03', 3) + 0.3 + i * 0.4, 0.4);
  });

  // 4 · by morning
  scene('morning', T0.l04, T0.l05, 'p1', t => {
    const k = ss(seg(t, T0.l04, T0.l04 + 4)); skyGrad([[0, '#2a0c28'], [0.45, '#8a2a3a'], [1, '#e5732b']]);
    glowAt(W * 0.5, 1150, 800, [255, 150, 60], 0.55); starsDraw(t, 20, 300, 2, 0.3);
    ctx.save(); PUSH(t, T0.l04, T0.l05);
    smoke(t, 300, 1100, 120, 1, 2); smoke(t, 760, 1100, 130, 1, 7);
    skyline(t, 1170, 31, -30, W + 60, '#7a2f45', 'rgba(255,190,100,.5)', { w: 60, h: 70, hv: 110 });
    const mid = skyline(t, 1260, 41, -40, W + 60, '#3e1a3e', 'rgba(255,170,80,.55)', { w: 80, h: 100, hv: 140 });
    mid.forEach((h, i) => { if (hsh(i * 3) < 0.8) flameDraw(h.x + h.w / 2, h.b - h.h - h.rh * 0.2, (70 + hsh(i) * 110) * k, 52, t, i, k); });
    const near = skyline(t, 1350, 51, -60, W + 60, '#170d20', 'rgba(255,150,70,.5)', { w: 90, h: 100, hv: 130, win: 0.4 });
    near.forEach((h, i) => { if (hsh(i * 5) < 0.7) flameDraw(h.x + h.w / 2, h.b - h.h - h.rh * 0.2, (80 + hsh(i) * 120) * k, 60, t, i + 9, k); });
    ctx.fillStyle = '#170d20'; ctx.fillRect(0, 1349, W, H); embers(t, 0, W, 1200, 40, 5, k); ctx.restore();
    titleDraw('mo', 'BY MORNING', null, t, T0.l04 + 0.1);
  });

  // 5 · he acts: the Tower, a boat, the King
  scene('acts', T0.l05, T0.l06, 'p1', t => {
    skyGrad([[0, '#160d30'], [0.5, '#5a1f3a'], [1, '#c2502a']]); starsDraw(t, 50, 600, 5, 0.6); glowAt(W * 0.5, 1050, 800, [255, 120, 50], 0.45);
    const s2 = P('l05', 1) - 0.1, s3 = P('l05', 2) - 0.1, o1 = ss(seg(t, s2, s2 + 0.6)), o2 = ss(seg(t, s3, s3 + 0.6));
    ctx.save(); PUSH(t, T0.l05, T0.l06);
    skyline(t, 1010, 61, -20, W + 60, '#4a2146', 'rgba(255,170,80,.55)', { w: 50, h: 50, hv: 90 }).forEach((h, i) => { if (hsh(i * 2) < 0.7) flameDraw(h.x + h.w / 2, h.b - h.h - h.rh * 0.2, 60 + 70 * hsh(i), 40, t, i, 1); });
    // the river
    const rv = ctx.createLinearGradient(0, 1010, 0, 1330); rv.addColorStop(0, '#7a2f45'); rv.addColorStop(1, '#1b1030'); ctx.fillStyle = rv; ctx.fillRect(0, 1010, W, 330); ctx.fillStyle = '#120a1c'; ctx.fillRect(0, 1340, W, H);
    ctx.strokeStyle = 'rgba(255,170,90,.45)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); for (let x = 0; x <= W; x += 20) { const y = 1050 + i * 32 + Math.sin(x * 0.03 + t * 1.5 + i) * 6; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    // the Tower of London (slides away left)
    ctx.save(); ctx.translate(-o1 * 900, 0); const tw = (x0, y0, x1) => { ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, 1010 - y0); };
    sil(() => { ctx.beginPath(); ctx.moveTo(300, 1010); ctx.lineTo(300, 700); for (let x = 300; x < 780; x += 40) { ctx.lineTo(x, 680); ctx.lineTo(x + 20, 680); ctx.lineTo(x + 20, 700); ctx.lineTo(x + 40, 700); } ctx.lineTo(780, 1010); ctx.closePath(); }, '#241532', 'rgba(255,170,90,.55)');
    for (const x0 of [250, 740]) sil(() => { ctx.beginPath(); ctx.rect(x0, 600, 90, 410); ctx.moveTo(x0 - 6, 600); ctx.arc(x0 + 45, 600, 51, Math.PI, 0); }, '#2c1a3a', 'rgba(255,170,90,.55)');
    for (const x0 of [420, 600]) sil(() => { ctx.beginPath(); ctx.rect(x0, 560, 60, 450); ctx.moveTo(x0 - 6, 560); ctx.lineTo(x0 + 30, 480); ctx.lineTo(x0 + 66, 560); }, '#2c1a3a', 'rgba(255,170,90,.55)');
    ctx.fillStyle = rg(WIN, 0.8); for (const [wx, wy] of [[330, 760], [410, 800], [500, 760], [600, 800], [680, 760], [270, 700], [770, 700]]) ctx.fillRect(wx, wy, 18, 36);
    ctx.strokeStyle = '#2c1a3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(450, 480); ctx.lineTo(450, 410); ctx.moveTo(630, 480); ctx.lineTo(630, 410); ctx.stroke(); ctx.fillStyle = '#e2452b'; ctx.beginPath(); ctx.moveTo(450, 410); ctx.lineTo(500, 428); ctx.lineTo(450, 446); ctx.fill(); ctx.beginPath(); ctx.moveTo(630, 410); ctx.lineTo(680, 428); ctx.lineTo(630, 446); ctx.fill();
    persSil(540, 681, 0.4, '#150c20', { rim: 'rgba(255,170,90,.6)', wig: true }); ctx.restore();
    // the boat (slides in from the right, then away)
    const bx = lerp(1300, 540, ss(seg(t, s2, s2 + 0.8))) - o2 * 1000, rock = Math.sin(t * 1.6) * 0.04;
    ctx.save(); ctx.translate(bx, 1120); ctx.rotate(rock); glowAt(0, 80, 360, [255, 140, 60], 0.3);
    sil(() => { ctx.beginPath(); ctx.moveTo(-190, 0); ctx.lineTo(190, 0); ctx.quadraticCurveTo(150, 90, 90, 100); ctx.lineTo(-90, 100); ctx.quadraticCurveTo(-150, 90, -190, 0); ctx.closePath(); }, '#241532', 'rgba(255,170,90,.55)');
    sil(() => { ctx.beginPath(); ctx.rect(-5, -300, 10, 300); }, '#241532', null); sil(() => { ctx.beginPath(); ctx.moveTo(12, -290); ctx.lineTo(150, -20); ctx.lineTo(12, -20); ctx.closePath(); ctx.moveTo(-12, -250); ctx.lineTo(-110, -20); ctx.lineTo(-12, -20); ctx.closePath(); }, '#e8dcc2', 'rgba(255,180,90,.4)');
    persSil(-60, -2, 0.45, '#150c20', { wig: true }); ctx.restore();
    // the King's crown and the house that comes down
    const kc = ss(seg(t, s3, s3 + 0.8)); ctx.save(); ctx.globalAlpha = kc; ctx.translate(0, (1 - kc) * 120);
    glowAt(540, 640, 420, [255, 200, 90], 0.45);
    sil(() => { ctx.beginPath(); ctx.moveTo(380, 780); ctx.lineTo(360, 560); ctx.lineTo(450, 650); ctx.lineTo(540, 520); ctx.lineTo(630, 650); ctx.lineTo(720, 560); ctx.lineTo(700, 780); ctx.closePath(); }, '#e6b13c', 'rgba(255,240,170,.7)');
    sil(() => { ctx.beginPath(); ctx.rect(372, 780, 336, 56); }, '#c9872d', null); ctx.fillStyle = '#e2452b'; for (const x of [450, 540, 630]) { ctx.beginPath(); ctx.arc(x, 808, 12, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#fff3c0'; for (const [x, y] of [[360, 548], [540, 508], [720, 548]]) { ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill(); }
    const tilt = ss(seg(t, s3 + 1.4, s3 + 3.6)) * 0.22;
    for (let i = 0; i < 5; i++) { ctx.save(); if (i === 2) { ctx.translate(540 + 55, 1250); ctx.rotate(tilt); ctx.translate(-540 - 55, -1250); } sil(() => houseP(180 + i * 160, 1250, 110, 150, 60), '#241532', 'rgba(255,170,90,.55)'); ctx.restore(); }
    ctx.strokeStyle = 'rgba(230,200,150,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(460, 1070 + tilt * 200); ctx.lineTo(150, 1190); ctx.stroke(); persSil(120, 1250, 0.5, '#150c20', {}); persSil(80, 1250, 0.45, '#150c20', {});
    ctx.restore(); ctx.restore();
    titleDraw('ac', 'HE ACTS', null, t, T0.l05 + 0.1);
  });

  // 6 · that night: the garden, the pit
  scene('garden', T0.l06, T0.l07, 'p1', t => {
    skyGrad([[0, '#0a0924'], [0.6, '#1d1840'], [1, '#2c2250']]); starsDraw(t, 90, 800, 9, 1);
    ctx.save(); PUSH(t, T0.l06, T0.l07);
    moonDraw(780, 620, 120);
    sil(() => { ctx.beginPath(); ctx.moveTo(0, 940); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, 900 + Math.sin(x * 0.02) * 14); ctx.lineTo(W, 1010); ctx.lineTo(0, 1010); ctx.closePath(); }, '#101a24', 'rgba(190,210,255,.35)');
    ctx.strokeStyle = '#101a24'; ctx.lineWidth = 4; for (let i = 0; i < 40; i++) { const x = i * 28 + 8; ctx.beginPath(); ctx.moveTo(x, 940); ctx.quadraticCurveTo(x + Math.sin(t + i) * 6, 905, x + 6, 880 - hsh(i) * 30); ctx.stroke(); }
    // the man carrying a chest across the garden by moonlight
    const wx = lerp(1060, 300, ss(seg(t, P('l06', 0), P('l06', 0) + 3.4))), wb = Math.abs(Math.sin(t * 6)) * 6;
    persSil(wx, 960 - wb, 1.3, '#0b0e18', { wig: true, rim: 'rgba(190,210,255,.5)' }); sil(() => { ctx.beginPath(); ctx.rect(wx - 70, 770 - wb, 140, 70); ctx.moveTo(wx - 74, 770 - wb); ctx.quadraticCurveTo(wx, 720 - wb, wx + 74, 770 - wb); }, '#3a2a30', 'rgba(190,210,255,.5)');
    // earth, cut through to show the pit
    sil(() => { ctx.beginPath(); ctx.rect(100, 1010, 880, 310); }, '#3a2418', 'rgba(255,200,140,.3)'); ctx.strokeStyle = 'rgba(20,10,8,.45)'; ctx.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = 110 + hsh(i) * 860, y = 1020 + hsh(i * 2) * 290; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14, y + 4); ctx.stroke(); }
    sil(() => { ctx.beginPath(); ctx.rect(250, 1010, 580, 290); }, '#160e12', null);
    const d1 = ss(seg(t, P('l06', 1) + 0.1, P('l06', 1) + 1.4)), d2 = ss(seg(t, P('l06', 2) + 0.2, P('l06', 2) + 1.6));
    for (const [bx0, dd] of [[370, d1], [470, d1]]) { if (dd <= 0) continue; ctx.save(); ctx.globalAlpha = Math.min(1, dd * 6); ctx.translate(bx0, 1290 - (1 - dd) * 270); sil(() => { ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-28, -110); ctx.lineTo(-11, -146); ctx.lineTo(-11, -200); ctx.lineTo(11, -200); ctx.lineTo(11, -146); ctx.lineTo(28, -110); ctx.lineTo(28, 0); ctx.closePath(); }, '#2f5a3e', 'rgba(190,255,210,.45)'); ctx.fillStyle = '#f0e2c0'; ctx.fillRect(-28, -90, 56, 36); ctx.restore(); }
    if (d2 > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, d2 * 6); ctx.translate(650, 1255 - (1 - d2) * 240); sil(() => { ctx.beginPath(); ctx.ellipse(0, 0, 100, 50, 0, 0, TAU); ctx.rect(-100, -40, 200, 40); }, '#e3b865', 'rgba(255,240,180,.6)'); ctx.fillStyle = '#c9984a'; ctx.beginPath(); ctx.ellipse(0, -40, 100, 50, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#b07f35'; for (const [x, y, r] of [[-40, -46, 9], [30, -34, 7], [-5, -56, 6], [58, -52, 8]]) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
    ctx.restore();
    titleDraw('ga', 'THAT NIGHT', null, t, T0.l06 + 0.1);
  });

  // 7 · what was lost, and what was kept
  scene('lost', T0.l07, T0.l08, 'p1', t => {
    const keep = ss(seg(t, P('l07', 3) - 0.2, P('l07', 3) + 1.2)); skyGrad([[0, '#12091f'], [0.7, '#2a1330'], [1, `rgb(${70 - 20 * keep | 0},${34 - 8 * keep | 0},40)`]]); starsDraw(t, 60, 700, 3, 0.8);
    ctx.save(); PUSH(t, T0.l07, T0.l08);
    const rows = ss(seg(t, P('l07', 3) - 0.3, P('l07', 3) + 0.9));
    ctx.save(); ctx.translate(-rows * 1200, 0);
    sil(() => { ctx.beginPath(); for (let i = 0; i < 9; i++) { const x = i * 130 - 10; ctx.moveTo(x, 1320); ctx.lineTo(x, 1230 - hsh(i) * 60); ctx.lineTo(x + 20, 1200 - hsh(i + 3) * 60); ctx.lineTo(x + 50, 1250); ctx.lineTo(x + 90, 1215 - hsh(i + 5) * 40); ctx.lineTo(x + 110, 1320); ctx.closePath(); } }, '#0d0714', 'rgba(255,120,60,.3)');
    for (let i = 0; i < 6; i++) flameDraw(80 + i * 180, 1250, 40 + hsh(i) * 30, 30, t, i, 0.5);
    const rowsDef = [[560, 'house', '13,000+', 'houses', P('l07', 0) + 0.1], [850, 'church', '87', 'churches', P('l07', 0) + 2.4], [1140, 'dome', "St Paul's", 'Cathedral', P('l07', 2) + 0.1]];
    rowsDef.forEach(([y, ic, big, small, t0], i) => {
      const a = ss(seg(t, t0, t0 + 0.5)); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 30);
      if (ic === 'house') sil(() => houseP(130, y + 50, 130, 120, 60), '#d9b37e', 'rgba(255,240,190,.8)');
      if (ic === 'church') { sil(() => { ctx.beginPath(); ctx.rect(140, y - 20, 110, 90); ctx.moveTo(130, y - 20); ctx.lineTo(195, y - 70); ctx.lineTo(260, y - 20); ctx.moveTo(170, y - 70); ctx.lineTo(195, y - 150); ctx.lineTo(220, y - 70); }, '#d9b37e', 'rgba(255,240,190,.8)'); }
      if (ic === 'dome') sil(() => { ctx.beginPath(); ctx.rect(110, y + 10, 170, 60); ctx.moveTo(130, y + 10); ctx.arc(195, y + 10, 70, Math.PI, 0); ctx.moveTo(190, y - 62); ctx.lineTo(190, y - 110); ctx.lineTo(200, y - 110); ctx.lineTo(200, y - 62); }, '#d9b37e', 'rgba(255,240,190,.8)');
      ctx.restore();
      wText('lr' + i + 'a', big, 350, y + 40, i === 2 ? 88 : 108, 'KB', CRM, t, t0 + 0.2, 0.8, { align: 'left', glow: 'rgba(255,140,60,.5)' }); wText('lr' + i + 'b', small, 352, y + 112, 56, 'PH', GOLD, t, t0 + 0.8, 0.6, { align: 'left' });
    });
    ctx.restore();
    // the diary, glowing, safe
    const dv = ss(seg(t, P('l07', 3) + 0.4, P('l07', 3) + 1.6)); if (dv > 0) {
      ctx.save(); ctx.globalAlpha = dv; glowAt(540, 800, 620, [255, 200, 90], 0.55); ctx.translate(540, 820 - (1 - dv) * 60); ctx.rotate(-0.06);
      sil(() => { ctx.beginPath(); ctx.rect(-170, -220, 340, 440); }, '#e8b13c', 'rgba(255,245,180,.7)'); ctx.fillStyle = '#f7d56e'; ctx.fillRect(-170, -40, 340, 56); sil(() => { ctx.beginPath(); ctx.rect(-170, -222, 26, 444); }, '#b9822a', null);
      ctx.fillStyle = '#6a4416'; ctx.font = '66px KB'; ctx.textAlign = 'center'; ctx.fillText('DIARY', 6, -110); ctx.fillStyle = '#fff6d0'; ctx.fillRect(170, -210, 14, 420);
      ctx.restore(); for (let i = 0; i < 18; i++) { const ph = (t * 0.3 + hsh(i)) % 1; ctx.fillStyle = `rgba(255,230,150,${(1 - ph) * dv})`; ctx.beginPath(); ctx.arc(540 + Math.sin(i * 7 + t) * 300, 900 - ph * 600, 2 + hsh(i) * 3, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
    titleDraw('lo' + (t < P('l07', 3) ? 'a' : 'b'), t < P('l07', 3) ? 'WHAT WAS LOST' : 'THE DIARY SURVIVED', null, t, t < P('l07', 3) ? T0.l07 + 0.1 : P('l07', 3) - 0.1);
  });

  // 8 · the diary lives on
  scene('lives', T0.l08, T0.l09, 'p1', t => {
    skyGrad([[0, '#1a1022'], [1, '#2e1c2a']]); const s2 = P('l08', 1) - 0.1, s3 = P('l08', 2) - 0.1, o1 = ss(seg(t, s2, s2 + 0.6)), o2 = ss(seg(t, s3, s3 + 0.6));
    ctx.save(); PUSH(t, T0.l08, T0.l09);
    glowAt(540, 880, 700, [255, 180, 90], 0.14);
    // shelf with the dusty diary
    ctx.save(); ctx.translate(-o1 * 1200, 0);
    sil(() => { ctx.beginPath(); ctx.rect(110, 1110, 860, 26); ctx.rect(110, 760, 860, 26); }, '#4a2f2a', 'rgba(255,170,90,.45)');
    const cols = ['#6a3a3a', '#3e4a6a', '#5a6a3e', '#7a5a2a', '#4a3a5a', '#6a4a4a'];
    for (let i = 0; i < 11; i++) { const bx = 130 + i * 72, bh = 180 + hsh(i) * 90; sil(() => { ctx.beginPath(); ctx.rect(bx, 1110 - bh, 58, bh); }, cols[i % 6], 'rgba(255,200,140,.25)'); sil(() => { ctx.beginPath(); ctx.rect(bx + 4, 760 - 150 - hsh(i + 5) * 60, 54, 150 + hsh(i + 5) * 60); }, cols[(i + 2) % 6], null); }
    sil(() => { ctx.beginPath(); ctx.rect(430, 900, 86, 210); }, '#e8b13c', 'rgba(255,245,180,.6)'); ctx.fillStyle = 'rgba(220,210,200,.35)'; ctx.beginPath(); ctx.moveTo(430, 900); ctx.lineTo(590, 900); ctx.lineTo(430, 1010); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(240,230,220,.5)'; ctx.lineWidth = 1.6; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(430, 900); ctx.quadraticCurveTo(500 - i * 14, 900 + i * 12, 590 - i * 28, 900 + i * 24); ctx.stroke(); }
    for (let i = 0; i < 22; i++) { const ph = (t * 0.05 + hsh(i)) % 1; ctx.fillStyle = `rgba(255,230,180,${0.5 * (1 - ph)})`; ctx.beginPath(); ctx.arc(130 + hsh(i * 3) * 820, 700 + ph * 420, 1.8, 0, TAU); ctx.fill(); }
    ctx.restore();
    // the student and the shorthand
    const sx = lerp(1200, 0, ss(seg(t, s2, s2 + 0.8))) - o2 * 1200; ctx.save(); ctx.translate(sx, 0);
    sil(() => { ctx.beginPath(); ctx.rect(130, 1180, 820, 140); }, '#4a2f2a', 'rgba(255,170,90,.45)');
    sil(() => { ctx.beginPath(); ctx.moveTo(330, 1180); ctx.lineTo(760, 1180); ctx.lineTo(700, 960); ctx.lineTo(390, 960); ctx.closePath(); }, '#f6ead0', null);
    ctx.strokeStyle = 'rgba(60,40,40,.75)'; ctx.lineWidth = 2.4; const pr = ss(seg(t, s2 + 0.8, s2 + 3.4)); for (let r = 0; r < 6; r++) { ctx.beginPath(); for (let k = 0; k <= 300 * pr; k += 7) { const x = 420 + k - r * 6, y = 1000 + r * 30 + Math.sin(k * 0.34 + r * 2) * 6; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    persSil(200, 1190, 1.5, '#4a3252', { skin: '#dfbf9d', rim: 'rgba(255,190,110,.7)' }); sil(() => { ctx.beginPath(); ctx.moveTo(110, 905); ctx.lineTo(205, 872); ctx.lineTo(300, 905); ctx.lineTo(205, 938); ctx.closePath(); }, '#1b1026', 'rgba(255,190,110,.6)');
    const mgx = 480 + 220 * ss(seg(t, s2 + 1, s2 + 3.6)), mgy = 1080; ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(mgx + 40, mgy + 40); ctx.lineTo(mgx + 120, mgy + 130); ctx.stroke(); ctx.fillStyle = 'rgba(255,240,200,.25)'; ctx.beginPath(); ctx.arc(mgx, mgy, 62, 0, TAU); ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = '#d9c9a8'; ctx.stroke();
    ctx.restore();
    // the printed book, 1825
    const bk = ss(seg(t, s3, s3 + 0.8)); ctx.save(); ctx.globalAlpha = bk; ctx.translate(0, (1 - bk) * 160); glowAt(540, 840, 560, [255, 200, 90], 0.4);
    sil(() => { ctx.beginPath(); ctx.moveTo(220, 760); ctx.lineTo(540, 720); ctx.lineTo(540, 1180); ctx.lineTo(220, 1220); ctx.closePath(); ctx.moveTo(550, 720); ctx.lineTo(860, 760); ctx.lineTo(860, 1220); ctx.lineTo(550, 1180); ctx.closePath(); }, '#e8b13c', 'rgba(255,245,180,.7)');
    ctx.fillStyle = '#6a4416'; ctx.font = '120px KB'; ctx.textAlign = 'center'; ctx.save(); ctx.translate(700, 1020); ctx.rotate(0.05); ctx.fillText('1825', 0, 0); ctx.restore(); ctx.font = '50px PH'; ctx.fillText('PEPYS', 380, 960);
    ctx.restore(); ctx.restore();
    titleDraw('li', 'THE DIARY LIVES ON', null, t, T0.l08 + 0.1);
  });

  // ═════════════════ Part 2: your notebook (sketchnote, brand paper) ═════════════════
  const dots = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H); ctx.fillStyle = TILE; ctx.fillRect(0, 0, W, H); ctx.fillStyle = DOT; for (let y = 15; y < H; y += 30) for (let x = 15; x < W; x += 30) ctx.fillRect(x - 1.3, y - 1.3, 2.6, 2.6); };
  const drawEL = (id, t) => { for (const e of EL) { if (e.tag !== id || t < e.t0) continue; SEED = e.seed; e.draw(clamp((t - e.t0) / e.d)); } };
  const part2 = (id, a, b) => scene(id, a, b, 'p2', t => { dots(); ctx.save(); PUSH(t, a, b, 1, 1.02); drawEL(id, t); ctx.restore(); });

  CURTAG = 'habits'; { const t = P('l09', 0);
    ribbon(540, 300, 560, 110, '3 HABITS', 78, T0.l09 + 0.3, { d: 0.6 });
    const rows = [['1', 'same day', '', 590, P('l09', 1), (x, y, tt) => sunIcon(x, y, 46, tt)], ['2', 'big + small', '', 890, P('l09', 2), (x, y, tt) => { crownIcon(x - 50, y - 20, 0.5, tt); cheeseIcon(x + 50, y + 30, 0.42, tt + 0.3); }], ['3', 'keep it safe', '', 1190, P('l09', 3), (x, y, tt) => lockIcon(x, y - 20, 1.5, tt)]];
    rows.forEach(([n, l1, l2, y, tt, ico]) => { const c = ell(130, y, 56, 56, 0, TAU, 40); FILL(c, tt); MRK([c], { col: YEL, w: 16 }, tt + 0.15, 0.22); INK_(c, { closed: true, w: 3.4, amp: 0.7 }, tt, 0.28); TXT(n, 130, y + 26, 72, { f: 'KB', align: 'center', jit: 0.4 }, tt + 0.2, 0.35);
      TXT(l1, 240, y + 24, 76, { f: 'KB', align: 'left' }, tt + 0.3, 1.1); ico(880, y, tt + 1.4); });
  }
  part2('habits', T0.l09, T0.l10);
  CURTAG = 'page'; {
    ribbon(540, 300, 700, 110, 'A PEPYS PAGE', 70, T0.l10 + 0.3, { d: 0.6 });
    const items = [['the time', (x, y, tt) => clockIcon(x, y, 46, tt, 10, 10), P('l10', 1)], ['the place', (x, y, tt) => pinIcon(x, y + 6, 0.9, tt), P('l10', 1) + 0.9], ['one thing said', (x, y, tt) => bubbleIcon(x, y, 0.8, tt), P('l10', 2)], ['one thing carried', (x, y, tt) => bagIcon(x, y, 0.9, tt), P('l10', 3)], ['one feeling', (x, y, tt) => heartIcon(x, y, 0.9, tt), P('l10', 4)]];
    items.forEach(([label, ico, tt], i) => { const y = 560 + i * 148; ico(150, y, tt); TXT(label, 270, y + 22, 66, { f: 'PH', align: 'left' }, tt + 0.3, 1.0); INK_([[270, y + 50], [960, y + 50 + (i % 2) * 3]], { w: 2, amp: 0.8, passes: 1, alpha: 0.55 }, tt + 0.6, 0.5); });
    const tt = P('l10', 5), tag = ell(540, 1330, 96, 96, 0, TAU, 50); FILL(tag, tt); MRK([tag], { col: YEL, w: 20 }, tt + 0.2, 0.35); INK_(tag, { closed: true, w: 3.6, amp: 1 }, tt, 0.35); TXT('10', 540, 1330, 86, { f: 'KB', align: 'center', jit: 0.5 }, tt + 0.3, 0.4); TXT('minutes', 540, 1384, 40, { f: 'PH', align: 'center' }, tt + 0.6, 0.5);
  }
  part2('page', T0.l10, T0.l11);
  CURTAG = 'cta'; {
    notebookIcon(540, 760, 1.15, P('l11', 0) + 0.2, 'My Day');
    TXT("It's My Notebook", 540, 1140, 100, { f: 'KB', align: 'center' }, P('l11', 1), 1.9);
    TXT('itsmynotebook.com', 540, 1342, 80, { f: 'KB', align: 'center' }, P('l11', 2) + 0.1, 1.5); MST([[200, 1372], [540, 1382], [880, 1368]], { w: 16, col: YEL }, P('l11', 2) + 1.7, 0.4);
    sparkles(790, 560, 40, 70, 5, P('l11', 2) + 1.9, 0.4);
  }
  part2('cta', T0.l11, END);
}
