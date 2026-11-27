
// ───────────────────────── icons for the page (all drawn in world units; the page is 2200 × 4880) ─────────────────────────
const PW = 2200, PH_ = 4880;
function obj(pts, t0, o = {}) {                         // outline → paper → marker → volume, the order a hand draws in
  const d = o.d || 0.4; FILL(pts, t0);
  if (o.fill) MRK([pts], { col: o.fill, w: o.mw || 14, ang: o.ang ?? -0.55 }, t0 + d * 0.45, d * 0.5);
  if (o.vol !== false) MRK([pts, shift(pts, -7, -8)], { col: o.volCol || GRY2, w: 9 }, t0 + d * 0.75, d * 0.25);
  INK_(pts, { closed: true, w: o.w || 3.2, amp: o.amp ?? 1 }, t0, d * 0.7); return t0 + d;
}
function wavy(x0, y0, x1, y1, amp, n, t0, d, o = {}) {   // a hand-drawn squiggle (shorthand, waves, smoke)
  const pts = []; for (let i = 0; i <= n * 8; i++) { const u = i / (n * 8); pts.push([lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * n * TAU) * amp]); }
  return INK_(pts, { w: 2.6, amp: 0.5, passes: 1, ...o }, t0, d);
}
function clockIcon(cx, cy, r, t0, hour = 3, min = 0) {
  const e = obj(ell(cx, cy, r, r, 0, TAU, 70), t0, { d: 0.5 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2, r2 = i % 3 ? r * 0.84 : r * 0.76; INK_(line(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92), { w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.35 + i * 0.02, 0.04); }
  const ah = (hour % 12 + min / 60) / 12 * TAU - Math.PI / 2, am = min / 60 * TAU - Math.PI / 2;
  INK_(line(cx, cy, cx + Math.cos(ah) * r * 0.5, cy + Math.sin(ah) * r * 0.5), { w: 4.4, amp: 0.3, passes: 1 }, t0 + 0.6, 0.12);
  INK_(line(cx, cy, cx + Math.cos(am) * r * 0.74, cy + Math.sin(am) * r * 0.74), { w: 3, amp: 0.3, passes: 1 }, t0 + 0.7, 0.12);
  return INK_(ell(cx, cy, 5, 5, 0, TAU, 12), { closed: true, w: 3, amp: 0.1, passes: 1 }, t0 + 0.8, 0.05);
}
function tongue(cx, b, h, w) { return bez([cx - w / 2, b], [cx - w * 0.72, b - h * 0.4], [cx - w * 0.15, b - h * 0.62], [cx + w * 0.1, b - h], 14).concat(bez([cx + w * 0.1, b - h], [cx + w * 0.58, b - h * 0.55], [cx + w * 0.78, b - h * 0.28], [cx + w / 2, b], 14)); }
function flame(cx, b, h, w, t0, k = 1) {
  const p = tongue(cx, b, h, w), q = tongue(cx + w * 0.03, b, h * 0.52, w * 0.46);
  FILL(p, t0); MRK([p], { col: YELD, w: 12, ang: -1.2 }, t0 + 0.12 * k, 0.2 * k); MRK([q], { col: YEL, w: 8, ang: -1.2 }, t0 + 0.24 * k, 0.1 * k);
  return INK_(p, { closed: true, w: 2.8, amp: 0.8 }, t0, 0.24 * k) + 0.05;
}
function houseIcon(x, b, w, h, t0, o = {}) {              // a timber house; `burn` puts flames on and through it
  const body = rrect(x, b - h, w, h, 6), roof = [[x - 12, b - h], [x + w / 2, b - h - w * 0.5], [x + w + 12, b - h]];
  obj(body, t0, { d: 0.35, fill: o.grey === false ? null : GRY, mw: 12 }); obj(roof, t0 + 0.15, { d: 0.3, fill: GRY2, mw: 10, ang: 0.9 });
  for (const [fx, fy] of [[0.2, 0.2], [0.6, 0.2], [0.2, 0.6], [0.6, 0.6]]) { const win = rrect(x + w * fx, b - h + h * fy, w * 0.2, h * 0.2, 4); FILL(win, t0 + 0.3); INK_(win, { closed: true, w: 2.2, amp: 0.3, passes: 1 }, t0 + 0.3, 0.08); }
  if (o.burn) { const k = o.burn; flame(x + w * 0.5, b - h - w * 0.28, w * 0.9 * k, w * 0.5, t0 + 0.5, 1); flame(x + w * 0.15, b - h * 0.35, w * 0.7 * k, w * 0.4, t0 + 0.62, 1); flame(x + w * 0.85, b - h * 0.55, w * 0.8 * k, w * 0.42, t0 + 0.7, 1); }
  return t0 + 0.9;
}
function personIcon(cx, feet, s, t0, o = {}) {            // a small doodle person: coat, head, optional wig / cap
  const S = (x, y) => [cx + x * s, feet + y * s];
  const coat = [S(-34, -96), S(34, -96), S(46, -8), S(-46, -8)], head = ell(cx, feet - 130 * s, 26 * s, 28 * s, 0, TAU, 40);
  obj(coat, t0, { d: 0.35, fill: o.coat || GRY, mw: 12 }); obj(head, t0 + 0.2, { d: 0.25, vol: false });
  INK_(line(cx - 18 * s, feet - 8 * s, cx - 20 * s, feet + 4 * s), { w: 3, amp: 0.3, passes: 1 }, t0 + 0.3, 0.05); INK_(line(cx + 18 * s, feet - 8 * s, cx + 20 * s, feet + 4 * s), { w: 3, amp: 0.3, passes: 1 }, t0 + 0.3, 0.05);
  if (o.wig) { const wg = ell(cx, feet - 138 * s, 34 * s, 36 * s, 0, TAU, 40); MRK([wg, head], { col: GRY2, w: 9 }, t0 + 0.3, 0.2); INK_(wg, { closed: true, w: 2.6, amp: 0.5, passes: 1 }, t0 + 0.3, 0.2); }
  if (o.cap) { const cp = ell(cx, feet - 150 * s, 30 * s, 14 * s, 0, TAU, 30); FILL(cp, t0 + 0.3); MRK([cp], { col: GRY, w: 8 }, t0 + 0.35, 0.1); INK_(cp, { closed: true, w: 2.4, amp: 0.3, passes: 1 }, t0 + 0.3, 0.1); }
  const eyeY = feet - 132 * s; INK_(ell(cx - 9 * s, eyeY, 2, 2, 0, TAU, 8), { w: 2.2, amp: 0, passes: 1 }, t0 + 0.4, 0.02); INK_(ell(cx + 9 * s, eyeY, 2, 2, 0, TAU, 8), { w: 2.2, amp: 0, passes: 1 }, t0 + 0.41, 0.02);
  INK_(bez([cx - 7 * s, feet - 118 * s], [cx - 2 * s, feet - 113 * s], [cx + 2 * s, feet - 113 * s], [cx + 7 * s, feet - 118 * s], 10), { w: 2, amp: 0.2, passes: 1 }, t0 + 0.42, 0.05);
  return t0 + 0.55;
}
function pepysPortrait(cx, cy, t0) {                       // Samuel Pepys, as a sketchnote: great curly wig, white collar, coat
  const coat = [[cx - 150, cy + 150], [cx - 120, cy + 70], [cx - 60, cy + 54], [cx + 60, cy + 54], [cx + 120, cy + 70], [cx + 150, cy + 150]];
  obj(coat, t0, { d: 0.5, fill: GRY, mw: 14 });
  const wigL = ell(cx - 66, cy + 16, 52, 108, 0, TAU, 50, 0.12), wigR = ell(cx + 66, cy + 16, 52, 108, 0, TAU, 50, -0.12), wigT = ell(cx, cy - 56, 100, 62, 0, TAU, 60);
  [wigL, wigR, wigT].forEach((w, i) => { FILL(w, t0 + 0.4 + i * 0.08); MRK([w], { col: GRY2, w: 13, ang: 0.9 }, t0 + 0.62 + i * 0.08, 0.18); INK_(w, { closed: true, w: 3, amp: 0.9 }, t0 + 0.4 + i * 0.08, 0.2); });
  const face = ell(cx, cy + 10, 56, 72, 0, TAU, 60); obj(face, t0 + 0.8, { d: 0.35, vol: false });
  for (let i = 0; i < 9; i++) { const a = i * 0.8; INK_(ell(cx - 80 + (i % 3) * 14, cy + 20 + Math.floor(i / 3) * 34, 10, 10, a, a + 4.6, 16), { w: 1.8, amp: 0.2, passes: 1 }, t0 + 1.0 + i * 0.03, 0.06); INK_(ell(cx + 80 - (i % 3) * 14, cy + 20 + Math.floor(i / 3) * 34, 10, 10, a, a + 4.6, 16), { w: 1.8, amp: 0.2, passes: 1 }, t0 + 1.0 + i * 0.03, 0.06); }
  INK_(ell(cx - 22, cy, 5, 5, 0, TAU, 10), { w: 3, amp: 0, passes: 1 }, t0 + 1.2, 0.03); INK_(ell(cx + 22, cy, 5, 5, 0, TAU, 10), { w: 3, amp: 0, passes: 1 }, t0 + 1.22, 0.03);
  INK_(bez([cx, cy + 4], [cx - 6, cy + 20], [cx - 6, cy + 30], [cx + 4, cy + 32], 10), { w: 2.4, amp: 0.2, passes: 1 }, t0 + 1.25, 0.06);
  INK_(bez([cx - 24, cy + 46], [cx - 8, cy + 36], [cx + 10, cy + 36], [cx + 26, cy + 46], 12), { w: 2.6, amp: 0.2, passes: 1 }, t0 + 1.3, 0.08);
  const col = [[cx - 36, cy + 66], [cx - 8, cy + 94], [cx, cy + 62]], col2 = [[cx + 36, cy + 66], [cx + 8, cy + 94], [cx, cy + 62]];
  FILL(col, t0 + 1.4); INK_(col, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t0 + 1.4, 0.1); FILL(col2, t0 + 1.45); INK_(col2, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t0 + 1.45, 0.1);
  return t0 + 1.6;
}
function diaryBook(cx, cy, s, t0, o = {}) {                // THE yellow thread of the page: the diary
  const R = (x, y) => { const a = o.rot ?? -0.1, c = Math.cos(a), si = Math.sin(a); return [cx + (x * c - y * si) * s, cy + (x * si + y * c) * s]; };
  const cover = [R(-100, -130), R(100, -130), R(100, 130), R(-100, 130)], pages = [R(100, -120), R(116, -122), R(116, 124), R(100, 122)];
  dropShadow(cover, 9, 10, t0 + 0.3);
  FILL(cover, t0); MRK([cover], { col: YEL, w: 22, ang: -0.35 }, t0 + 0.25, 0.3); MRK([cover, shift(cover, -16, 0)], { col: YELS, w: 14, ang: -0.35 }, t0 + 0.5, 0.12);
  INK_(cover, { closed: true, w: 3.6, amp: 0.8 }, t0, 0.3);
  FILL(pages, t0 + 0.2); INK_(pages, { closed: true, w: 2.4, amp: 0.3 }, t0 + 0.2, 0.12);
  for (let i = 1; i < 6; i++) INK_([R(104, -118 + i * 40), R(114, -118 + i * 40)], { w: 1.4, amp: 0.2, passes: 1, alpha: 0.7 }, t0 + 0.3 + i * 0.02, 0.03);
  INK_([R(-70, -130), R(-70, 130)], { w: 2.4, amp: 0.3, passes: 1 }, t0 + 0.32, 0.12);
  const band = [R(-100, 36), R(100, 36), R(100, 62), R(-100, 62)]; MRK([band], { col: GRY2, w: 10, ang: 0, edge: false }, t0 + 0.5, 0.08);
  if (o.label) TXT(o.label, R(10, -30)[0], R(10, -30)[1] + 12 * s, o.size || 44 * s, { f: 'KB', align: 'center', jit: 0.7, rot: o.rot ?? -0.1 }, t0 + 0.55, 0.45);
  return t0 + 0.9;
}
function sparkles(cx, cy, r1, r2, n, t0, d = 0.2) { return sparks(cx, cy, r1, r2, Array.from({ length: n }, (_, i) => -Math.PI / 2 + (i - (n - 1) / 2) * 0.55), t0, d); }
function moonIcon(cx, cy, r, t0) {
  const m = ell(cx, cy, r, r, 0, TAU, 60); obj(m, t0, { d: 0.5, fill: GRY, mw: 12 });
  [[-0.3, -0.2, 0.18], [0.3, 0.1, 0.13], [-0.1, 0.4, 0.1]].forEach(([dx, dy, rr_], i) => INK_(ell(cx + dx * r, cy + dy * r, rr_ * r, rr_ * r, 0, TAU, 16), { closed: true, w: 2, amp: 0.2, passes: 1 }, t0 + 0.5 + i * 0.05, 0.08));
  return sparks(cx, cy, r + 14, r + 36, [-2.5, -2.0, -1.5, -1.0, -0.5], t0 + 0.55, 0.3);
}
function towerIcon(cx, b, s, t0) {                          // the Tower of London: keep, four turrets, battlements, door
  const S = (x, y) => [cx + x * s, b + y * s];
  const keep = [S(-80, 0), S(-80, -190), S(-62, -190), S(-62, -204), S(-38, -204), S(-38, -190), S(-14, -190), S(-14, -204), S(14, -204), S(14, -190), S(38, -190), S(38, -204), S(62, -204), S(62, -190), S(80, -190), S(80, 0)];
  obj(keep, t0, { d: 0.55, fill: GRY, mw: 14 });
  for (const sd of [-1, 1]) { const tw = [S(sd * 96, 0), S(sd * 96, -240), S(sd * 56, -240), S(sd * 56, 0)], dome = ell(cx + sd * 76 * s, b - 240 * s, 20 * s, 18 * s, Math.PI, TAU, 20); obj(tw, t0 + 0.3, { d: 0.35, fill: GRY2, mw: 10, ang: 0.9 }); INK_(dome, { w: 3, amp: 0.3, passes: 1 }, t0 + 0.55, 0.1); }
  const door = [S(-22, 0), S(-22, -60), ...ell(cx, b - 60 * s, 22 * s, 22 * s, Math.PI, TAU, 14).slice(1), S(22, 0)]; MRK([door], { col: GRYD, w: 8, edge: false }, t0 + 0.6, 0.1); INK_(door, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t0 + 0.55, 0.12);
  INK_([S(0, -204), S(0, -262)], { w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.6, 0.06); const fl = [S(0, -262), S(34, -250), S(0, -238)]; MRK([fl], { col: YEL, w: 8, edge: false }, t0 + 0.68, 0.06); INK_(fl, { closed: true, w: 2, amp: 0.2, passes: 1 }, t0 + 0.66, 0.08);
  return t0 + 0.85;
}
function boatIcon(cx, cy, s, t0) {
  const S = (x, y) => [cx + x * s, cy + y * s];
  const hull = [S(-130, 0), S(130, 0), S(96, 56), S(-96, 56)], sail = [S(-8, -10), S(-8, -190), S(96, -20)], sail2 = [S(-22, -10), S(-22, -150), S(-100, -20)];
  obj(hull, t0, { d: 0.4, fill: GRY2, mw: 12 }); INK_([S(-8, -12), S(-8, -200)], { w: 3, amp: 0.3, passes: 1 }, t0 + 0.2, 0.1);
  obj(sail, t0 + 0.25, { d: 0.35, fill: GRY, mw: 10 }); obj(sail2, t0 + 0.4, { d: 0.3, fill: GRY, mw: 10 });
  for (let i = 0; i < 3; i++) wavy(cx - 190 * s, cy + (74 + i * 26) * s, cx + 190 * s, cy + (74 + i * 26) * s, 6 * s, 4 + i, t0 + 0.5 + i * 0.1, 0.3, { w: 2.2, alpha: 0.85 });
  return t0 + 1.0;
}
function crownIcon(cx, cy, s, t0) {
  const S = (x, y) => [cx + x * s, cy + y * s];
  const c = [S(-90, 70), S(-100, -50), S(-48, 0), S(0, -78), S(48, 0), S(100, -50), S(90, 70)];
  obj(c, t0, { d: 0.5, fill: GRY, mw: 12 }); const base = [S(-92, 70), S(92, 70), S(92, 98), S(-92, 98)]; obj(base, t0 + 0.3, { d: 0.25, fill: GRY2, mw: 8, ang: 0 });
  [[-100, -50], [0, -78], [100, -50]].forEach(([x, y], i) => INK_(ell(cx + x * s, cy + (y - 14) * s, 10 * s, 10 * s, 0, TAU, 16), { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.5 + i * 0.05, 0.08));
  return t0 + 0.8;
}
function chestIcon(cx, b, s, t0) {
  const S = (x, y) => [cx + x * s, b + y * s];
  const box_ = [S(-80, 0), S(-80, -70), S(80, -70), S(80, 0)], lid = [S(-84, -70), ...ell(cx, b - 70 * s, 84 * s, 40 * s, Math.PI, TAU, 20).slice(1), S(84, -70)];
  obj(box_, t0, { d: 0.3, fill: GRY, mw: 12 }); obj(lid, t0 + 0.2, { d: 0.3, fill: GRY2, mw: 10 });
  const lock = rrect(cx - 12 * s, b - 90 * s, 24 * s, 30 * s, 4); MRK([lock], { col: YEL, w: 8, edge: false }, t0 + 0.45, 0.06); INK_(lock, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.42, 0.1);
  return t0 + 0.7;
}
function bottleIcon(cx, b, s, t0) {
  const S = (x, y) => [cx + x * s, b + y * s];
  const p = [S(-26, 0), S(-26, -96), S(-10, -128), S(-10, -178), S(10, -178), S(10, -128), S(26, -96), S(26, 0)];
  obj(p, t0, { d: 0.4, fill: GRYD, mw: 12, vol: false }); const lab = [S(-26, -70), S(26, -70), S(26, -30), S(-26, -30)]; FILL(lab, t0 + 0.3); INK_(lab, { closed: true, w: 2, amp: 0.2, passes: 1 }, t0 + 0.3, 0.08);
  return t0 + 0.5;
}
function cheeseIcon(cx, cy, s, t0) {
  const S = (x, y) => [cx + x * s, cy + y * s];
  const top = ell(cx, cy - 20 * s, 96 * s, 48 * s, 0, TAU, 50), side = [S(-96, -20), S(-96, 26), ...ell(cx, cy + 26 * s, 96 * s, 48 * s, Math.PI, 0, 30).slice(1).reverse().map(p => p).reverse(), S(96, 26), S(96, -20)];
  const side2 = [S(-96, -20), S(-96, 26)].concat(ell(cx, cy + 26 * s, 96 * s, 48 * s, Math.PI, 0, 30)).concat([S(96, 26), S(96, -20)]);
  obj(side2, t0, { d: 0.35, fill: GRY2, mw: 10, vol: false }); obj(top, t0 + 0.2, { d: 0.35, fill: GRY, mw: 12 });
  [[-40, -26, 9], [30, -10, 7], [-5, -34, 6], [56, -34, 8]].forEach(([x, y, r], i) => INK_(ell(cx + x * s, cy + y * s, r * s, r * s * 0.6, 0, TAU, 14), { closed: true, w: 2, amp: 0.2, passes: 1 }, t0 + 0.5 + i * 0.04, 0.06));
  return t0 + 0.7;
}
function churchIcon(cx, b, s, t0) {
  const S = (x, y) => [cx + x * s, b + y * s];
  const body = [S(-62, 0), S(-62, -90), S(62, -90), S(62, 0)], roof = [S(-70, -90), S(0, -150), S(70, -90)], spire = [S(-24, -150), S(-24, -214), S(0, -262), S(24, -214), S(24, -150)];
  obj(body, t0, { d: 0.3, fill: GRY, mw: 10 }); obj(roof, t0 + 0.15, { d: 0.25, fill: GRY2, mw: 8, ang: 0.9 }); obj(spire, t0 + 0.3, { d: 0.25, fill: GRY2, mw: 8, ang: 0.9 });
  INK_([S(0, -262), S(0, -290)], { w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.5, 0.05); INK_([S(-9, -278), S(9, -278)], { w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.54, 0.05);
  const door = [S(-14, 0), S(-14, -40), ...ell(cx, b - 40 * s, 14 * s, 14 * s, Math.PI, TAU, 10).slice(1), S(14, 0)]; MRK([door], { col: GRYD, w: 8, edge: false }, t0 + 0.55, 0.06); INK_(door, { closed: true, w: 2.2, amp: 0.2, passes: 1 }, t0 + 0.5, 0.08);
  return t0 + 0.7;
}
function domeIcon(cx, b, s, t0) {                           // St Paul's: dome on a drum, columns, lantern
  const S = (x, y) => [cx + x * s, b + y * s];
  const base = [S(-150, 0), S(-150, -70), S(150, -70), S(150, 0)], drum = [S(-80, -70), S(-80, -130), S(80, -130), S(80, -70)], dome = [S(-84, -130), ...ell(cx, b - 130 * s, 84 * s, 96 * s, Math.PI, TAU, 30).slice(1), S(84, -130)];
  obj(base, t0, { d: 0.3, fill: GRY, mw: 12 }); obj(drum, t0 + 0.15, { d: 0.3, fill: GRY, mw: 10 }); obj(dome, t0 + 0.3, { d: 0.4, fill: GRY2, mw: 10 });
  for (let i = -3; i <= 3; i++) INK_([S(i * 22, -70), S(i * 22, -130)], { w: 1.8, amp: 0.2, passes: 1 }, t0 + 0.5 + (i + 3) * 0.02, 0.04);
  INK_([S(0, -226), S(0, -262)], { w: 2.6, amp: 0.1, passes: 1 }, t0 + 0.62, 0.05); INK_([S(-9, -250), S(9, -250)], { w: 2.6, amp: 0.1, passes: 1 }, t0 + 0.66, 0.05);
  return t0 + 0.8;
}
function lockIcon(cx, cy, s, t0) {
  const body = rrect(cx - 40 * s, cy - 6 * s, 80 * s, 66 * s, 10), sh_ = ell(cx, cy - 6 * s, 26 * s, 34 * s, Math.PI, TAU, 24);
  INK_(sh_, { w: 4, amp: 0.4, passes: 1 }, t0, 0.15); obj(body, t0 + 0.1, { d: 0.3, fill: YEL, mw: 12, vol: false });
  MRK([ell(cx, cy + 22 * s, 7 * s, 7 * s, 0, TAU, 14)], { col: INKM(0.85), w: 6, edge: false, op: 'source-over' }, t0 + 0.35, 0.03);
  return t0 + 0.5;
}
function pinIcon(cx, cy, s, t0) { const p = bez([cx, cy + 40 * s], [cx - 54 * s, cy - 4 * s], [cx - 40 * s, cy - 56 * s], [cx, cy - 56 * s], 16).concat(bez([cx, cy - 56 * s], [cx + 40 * s, cy - 56 * s], [cx + 54 * s, cy - 4 * s], [cx, cy + 40 * s], 16)); obj(p, t0, { d: 0.35, fill: GRY2, mw: 10 }); INK_(ell(cx, cy - 18 * s, 11 * s, 11 * s, 0, TAU, 14), { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.3, 0.06); return t0 + 0.4; }
function bubbleIcon(cx, cy, s, t0) { const p = rrect(cx - 56 * s, cy - 36 * s, 112 * s, 72 * s, 22).concat([[cx - 14 * s, cy + 36 * s], [cx - 30 * s, cy + 62 * s], [cx + 4 * s, cy + 36 * s]]); obj(p, t0, { d: 0.35, fill: GRY, mw: 10 }); for (let i = 0; i < 3; i++) INK_(line(cx - 36 * s, cy - 14 * s + i * 16 * s, cx + 36 * s - i * 14 * s, cy - 14 * s + i * 16 * s), { w: 2, amp: 0.2, passes: 1 }, t0 + 0.3 + i * 0.05, 0.08); return t0 + 0.5; }
function bagIcon(cx, cy, s, t0) { const p = [[cx - 52 * s, cy + 46 * s], [cx - 40 * s, cy - 18 * s], [cx + 40 * s, cy - 18 * s], [cx + 52 * s, cy + 46 * s]]; obj(p, t0, { d: 0.35, fill: GRY, mw: 10 }); INK_(ell(cx, cy - 18 * s, 26 * s, 24 * s, Math.PI, TAU, 16), { w: 3.4, amp: 0.3, passes: 1 }, t0 + 0.3, 0.1); return t0 + 0.45; }
function heartIcon(cx, cy, s, t0) { const p = bez([cx, cy + 40 * s], [cx - 78 * s, cy - 6 * s], [cx - 44 * s, cy - 62 * s], [cx, cy - 22 * s], 16).concat(bez([cx, cy - 22 * s], [cx + 44 * s, cy - 62 * s], [cx + 78 * s, cy - 6 * s], [cx, cy + 40 * s], 16)); obj(p, t0, { d: 0.35, fill: GRY2, mw: 10 }); return t0 + 0.4; }
function magnifier(cx, cy, r, t0) { const lens = ell(cx, cy, r, r, 0, TAU, 50); INK_(line(cx + r * 0.7, cy + r * 0.7, cx + r * 1.7, cy + r * 1.7), { w: 8, amp: 0.3, passes: 1 }, t0, 0.15); obj(lens, t0 + 0.1, { d: 0.35, vol: false }); MRK([lens], { col: GRY, w: 12 }, t0 + 0.3, 0.12); return t0 + 0.5; }
function pencilIcon(cx, cy, s, t0, rot = -0.7) { const R = (x, y) => { const c = Math.cos(rot), si = Math.sin(rot); return [cx + (x * c - y * si) * s, cy + (x * si + y * c) * s]; }; const b = [R(-70, -12), R(40, -12), R(40, 12), R(-70, 12)], tip = [R(40, -12), R(78, 0), R(40, 12)]; obj(b, t0, { d: 0.3, fill: YEL, mw: 10, vol: false }); obj(tip, t0 + 0.2, { d: 0.2, vol: false }); MRK([tip], { col: INKM(0.8), w: 6, edge: false, op: 'source-over' }, t0 + 0.35, 0.04); return t0 + 0.5; }
function sunIcon(cx, cy, r, t0) { const s_ = ell(cx, cy, r, r, 0, TAU, 40); obj(s_, t0, { d: 0.3, fill: YEL, mw: 10, vol: false }); return sparks(cx, cy, r + 10, r + 32, [0, 0.8, 1.57, 2.36, 3.14, 3.93, 4.71, 5.5], t0 + 0.25, 0.3); }
function notebookIcon(cx, cy, s, t0, label) {              // the product: a notebook with a lock and a pen loop
  const R = (x, y) => [cx + x * s, cy + y * s];
  const cover = [R(-150, -200), R(150, -200), R(150, 200), R(-150, 200)];
  dropShadow(cover, 12, 13, t0 + 0.4, 0.2); FILL(cover, t0); MRK([cover], { col: YEL, w: 24, ang: -0.35 }, t0 + 0.35, 0.4); MRK([cover, shift(cover, -20, 0)], { col: YELS, w: 16, ang: -0.35 }, t0 + 0.7, 0.15);
  INK_(cover, { closed: true, w: 4, amp: 1 }, t0, 0.4); INK_([R(-110, -200), R(-110, 200)], { w: 3, amp: 0.4, passes: 1 }, t0 + 0.4, 0.15);
  for (let i = 0; i < 6; i++) { const c = ell(...R(-130, -150 + i * 62), 7 * s, 7 * s, 0, TAU, 12); INK_(c, { closed: true, w: 2.2, amp: 0.1, passes: 1 }, t0 + 0.5 + i * 0.03, 0.05); }
  const lab = [R(-70, -100), R(110, -100), R(110, -20), R(-70, -20)]; FILL(lab, t0 + 0.6); INK_(lab, { closed: true, w: 2.8, amp: 0.5 }, t0 + 0.6, 0.12);
  if (label) TXT(label, R(20, -44)[0], R(20, -44)[1], 46 * s, { f: 'KB', align: 'center', jit: 0.6 }, t0 + 0.75, 0.5);
  lockIcon(...R(80, 130), 0.9 * s, t0 + 1.1);
  return t0 + 1.7;
}

