
// ---------- paper tile, captions, transitions, render ----------
let TILE = null, TLJ = null, CUEL = [];
function makeGrain() { const g = document.createElement('canvas'); g.width = g.height = 512; const x = g.getContext('2d'); SEED = 9; for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(90,80,60,${rr(0.02, 0.06)})`; x.fillRect(rr(0, 512), rr(0, 512), rr(0.8, 2.4), rr(0.8, 2.4)); } TILE = ctx.createPattern(g, 'repeat'); }
function subtitles(t, dark) {
  const c = CUEL.find(c => t >= c.t0 && t < c.t1); if (!c || c.id === 'l01') return;   // the opening question is already on screen in big letters
  const a = clamp(Math.min((t - c.t0) / 0.2, (c.t1 - t) / 0.2)), rise = (1 - eo(clamp((t - c.t0) / 0.3))) * 8, L = c.text.split('\n'), size = 60, lh = 66;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `600 ${size}px CV`; const cw = Math.max(...L.map(l => ctx.measureText(l).width)) + 90, ch = L.length * lh + 40, x0 = W / 2 - cw / 2, y0 = H - 250 - ch + rise;
  ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; ctx.fillStyle = '#fffaf0'; ctx.fill(pathOf(rrect(x0, y0, cw, ch, 12))); ctx.shadowColor = 'transparent';
  ctx.save(); ctx.translate(x0 + 34, y0 + 4); ctx.rotate(-0.16); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(PL.acc, 0.6); ctx.fillRect(-38, -12, 76, 24); ctx.restore();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = INK; L.forEach((l, i) => ctx.fillText(l, W / 2, y0 + 20 + lh * (i + 0.72))); ctx.restore();
}
const OA = document.createElement('canvas'); OA.width = W; OA.height = H; const OAx = OA.getContext('2d'); const MAIN = ctx;
const sceneAt = t => { let i = 0; while (i < SCN.length - 1 && t >= SCN[i + 1].a) i++; return i; };
function drawScene(i, t, target) { const prev = ctx; ctx = target; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowColor = 'transparent'; ctx.save(); SCN[i].draw(t); ctx.restore(); ctx = prev; }
const TR = 0.95;
function burnEdge(x, u, i) { return lerp(H + 90, -90, u) + Math.sin(x * 0.021 + i) * 34 + Math.sin(x * 0.067 + i * 2) * 16 + (hsh(Math.floor(x / 12) + i) - 0.5) * 22; }
function render(t) {
  ctx = MAIN; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  const f = Math.round(t * FPS); BOIL = Math.floor(f / 2) % 3; const i = sceneAt(t), lt = t - SCN[i].a;
  drawScene(i, t, MAIN);
  if (i > 0 && lt < TR) {                                  // the old page burns away from the bottom up
    drawScene(i - 1, SCN[i].a - 0.001, OAx);
    const u = ss(lt / TR);
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); for (let x = W; x >= 0; x -= 8) ctx.lineTo(x, burnEdge(x, u, i)); ctx.closePath(); ctx.clip(); ctx.drawImage(OA, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [w, a, col] of [[46, 0.28, '255,90,30'], [20, 0.5, '255,170,60'], [7, 0.9, '255,240,190']]) { ctx.lineWidth = w; ctx.strokeStyle = `rgba(${col},${a * Math.sin(Math.PI * Math.min(1, u * 1.02))})`; ctx.lineJoin = 'round'; ctx.beginPath(); for (let x = 0; x <= W; x += 8) { const y = burnEdge(x, u, i); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    for (let k = 0; k < 40; k++) { const x = hsh(k * 3 + i) * W, y = burnEdge(x, u, i) - 10 - ((t * 140 + k * 53) % 160); ctx.fillStyle = `rgba(255,${160 + (hsh(k) * 80 | 0)},70,${0.8 * Math.sin(Math.PI * u)})`; ctx.beginPath(); ctx.arc(x + Math.sin(t * 5 + k) * 8, y, 1.6 + hsh(k + 1) * 2.4, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  if (SCN[i].kind === 'p1') { const vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.45, H * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); }
  subtitles(t);
  const fo = clamp((TLJ.dur - t) / 0.6); if (fo < 1) { ctx.fillStyle = `rgba(250,244,230,${1 - fo})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
window.TEXTS = t => [];
let REG = false;
async function boot() {
  document.documentElement.style.background = document.body.style.background = PAPER;
  GLY = await (await fetch('glyphs.json')).json(); TLJ = await (await fetch('timeline.json')).json(); window.DUR = TLJ.dur; CUEL = await (await fetch('cues.json')).json();
  for (const c of CUEL) (PQ[c.id] = PQ[c.id] || [])[c.k] = c;
  await Promise.all([['KB', '40px KB'], ['PH', '40px PH'], ['CV', '600 40px CV']].map(([, f]) => document.fonts.load(f, 'Ag')));
  makeGrain(); buildScenes();
  const ev = EL.filter(e => e.kind !== 'fill').map(e => ({ t: +e.t0.toFixed(4), type: e.kind, d: +e.d.toFixed(4), pan: 0 }));
  SCN.forEach((s, k) => { ev.push({ t: s.a, type: 'scene', id: s.id, b: s.b, kind: s.kind }); if (k > 0) ev.push({ t: s.a, type: 'burn' }); });
  window.EV = ev.sort((a, b) => a.t - b.t); render(0); window.READY = true;
}
boot();
</script>
</body></html>
