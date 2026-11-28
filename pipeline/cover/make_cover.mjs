// Cover image generator (1080x1920 JPEG) for Reels / Shorts. Brand look: cream dotted paper, Kalam handwriting, mustard marker.
// Usage: node make_cover.mjs --frame <full 1080x1920 frame png/jpg> --hook "line one|line two|line three" \
//          --highlight "words to mark" --out cover.jpg [--crop 420,1320] [--tag "A ROMAN BIRTHDAY INVITATION"]
// Rules baked in: all text and art inside the centre 1080x1440 band (Instagram profile grid crops 3:4), nothing overlaps,
// hook = max 3 lines x ~16 chars, never a copy of the caption. The frame must come from a scene whose picture area is finished.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const a = Object.fromEntries(process.argv.slice(2).reduce((r, v, i, all) => (v.startsWith('--') ? r.concat([[v.slice(2), all[i + 1]]]) : r), []));
if (!a.frame || !a.hook || !a.out) { console.error('need --frame --hook --out'); process.exit(2); }
const lines = a.hook.split('|').map(s => s.trim()).filter(Boolean);
if (lines.length > 3 || lines.some(l => l.length > 18)) { console.error('hook must be <=3 lines of <=18 chars'); process.exit(2); }
const [cy0, cy1] = (a.crop || '420,1320').split(',').map(Number);
const tag = (a.tag || '').toUpperCase();
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function font(family, wght, text) {   // Google Fonts CSS API, subsetted woff2, embedded as base64 (no runtime network)
  const u = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${wght}&text=${encodeURIComponent([...new Set(text + ' ')].join(''))}`;
  const css = await (await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36' } })).text();
  const url = css.match(/url\((https:[^)]+)\)/)[1];
  return Buffer.from(await (await fetch(url)).arrayBuffer()).toString('base64');
}
const all = a.hook + (a.tag || '') + "It's My Notebook itsmynotebook.com";
const kalam = await font('Kalam', 700, all.toUpperCase() + all);
const patrick = await font('Patrick Hand', 400, all.toUpperCase() + all);
const img = readFileSync(a.frame).toString('base64');
const mime = a.frame.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
const hl = (a.highlight || '').trim();
const html = lines.map(l => esc(l)).map(l => hl && l.toLowerCase().includes(esc(hl).toLowerCase())
  ? l.replace(new RegExp(esc(hl).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), m => `<span class="mk">${m}</span>`) : l)
  .map(l => `<div class="ln">${l}</div>`).join('');
const cropH = cy1 - cy0, cardW = 820, cardH = Math.round(cardW * cropH / 1080);
const page = `<!doctype html><meta charset=utf-8><style>
@font-face{font-family:K;src:url(data:font/woff2;base64,${kalam}) format('woff2');font-weight:700}
@font-face{font-family:P;src:url(data:font/woff2;base64,${patrick}) format('woff2')}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;background:#FAF4E6;background-image:radial-gradient(#d9ccb0 2.2px,transparent 2.6px);background-size:54px 54px;position:relative;overflow:hidden;font-family:K}
.tag{position:absolute;left:0;right:0;top:262px;text-align:center;font:400 40px P;letter-spacing:6px;color:#8a6a1a}
.hook{position:absolute;left:60px;right:60px;top:${tag ? 330 : 300}px;text-align:center;color:#302A24}
.ln{font:700 118px/1.08 K;margin-bottom:4px;white-space:nowrap}
.mk{background:linear-gradient(transparent 46%,#F1BF4E 46%,#F1BF4E 86%,transparent 86%);padding:0 10px;border-radius:6px}
.card{position:absolute;left:${(1080 - cardW - 44) / 2}px;top:0;width:${cardW + 44}px;padding:22px;background:#fffdf6;border-radius:26px;box-shadow:0 18px 40px rgba(48,42,36,.28);transform:rotate(-1.6deg)}
.card canvas{display:block;border-radius:14px}
.tape{position:absolute;left:50%;top:-30px;width:210px;height:62px;margin-left:-105px;background:rgba(241,191,78,.82);transform:rotate(2deg);box-shadow:0 2px 6px rgba(0,0,0,.15)}
.brand{position:absolute;left:0;right:0;top:1590px;text-align:center;font:400 38px P;color:#302A24}
.brand b{font:700 40px K}
</style><body>
${tag ? `<div class="tag">${esc(tag)}</div>` : ''}
<div class="hook" id="hook">${html}</div>
<div class="card" id="card"><div class="tape"></div><canvas id="cv" width="${cardW}" height="${cardH}"></canvas><img id="src" style="display:none" src="data:image/${mime};base64,${img}"></div>
<div class="brand"><b>It's My Notebook</b> &nbsp;·&nbsp; itsmynotebook.com</div>
<script>
window.__ready=(async()=>{
  const im=document.getElementById('src');await im.decode();
  document.getElementById('cv').getContext('2d').drawImage(im,0,${cy0},1080,${cropH},0,0,${cardW},${cardH});
  const h=document.getElementById('hook'),c=document.getElementById('card');
  c.style.top=(h.getBoundingClientRect().bottom+54)+'px';
  return true;})();
</script></body>`;
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await p.setContent(page); await p.evaluate(() => document.fonts.ready); await p.evaluate(() => window.__ready); await p.waitForTimeout(300);
// QA: everything must sit inside the 3:4 safe band (y 240..1680) and nothing may overlap or overflow horizontally
const q = await p.evaluate(() => {
  const r = s => document.querySelector(s).getBoundingClientRect();
  const hook = r('#hook'), card = r('#card'), brand = r('.brand');
  const widest = Math.max(...[...document.querySelectorAll('.ln')].map(e => { const g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect().width; }));
  return { hookTop: hook.top, hookBottom: hook.bottom, cardTop: card.top, cardBottom: card.bottom, brandTop: brand.top, brandBottom: brand.bottom, widest };
});
const probs = [];
if (q.hookTop < 240) probs.push('hook above safe band');
if (q.cardTop < q.hookBottom + 20) probs.push('card overlaps hook');
if (q.cardBottom > q.brandTop - 14) probs.push('card overlaps brand line');
if (q.brandBottom > 1680) probs.push('brand below safe band');
if (q.widest > 1000) probs.push('hook line too wide (' + Math.round(q.widest) + 'px)');
console.log(JSON.stringify(q), probs.length ? 'PROBLEMS: ' + probs.join('; ') : 'QA OK');
await p.screenshot({ path: a.out, type: 'jpeg', quality: 90 });
await browser.close();
process.exit(probs.length ? 1 : 0);
