import fs from 'fs';
const dur = JSON.parse(fs.readFileSync('voice/dur.json')), lines = JSON.parse(fs.readFileSync('lines.json'));
const gap = { l01: 1.0, l02: .9, l03: .8, l04: .7, l05: .8, l06: .7, l07: .8, l08: .9, l09: .9, l10: .9, l11: .9 };
let t = 0; const out = [];
for (const l of lines) { t += gap[l.id]; out.push({ id: l.id, t0: +t.toFixed(3), t1: +(t + dur[l.id]).toFixed(3), text: l.text }); t += dur[l.id]; }
const total = +(t + 5.0).toFixed(2);
fs.writeFileSync('timeline.json', JSON.stringify({ lines: out, dur: total }, null, 1));
console.log(out.map(o => `${o.id} ${o.t0}-${o.t1}`).join(' | '), '\ntotal', total);
