// Caption phrases (hand-split at natural breaks). Times are spread over each line by character weight: no speech-to-text model can be downloaded here.
import fs from 'fs';
const TL = JSON.parse(fs.readFileSync('timeline.json'));
const M = {
  l01: ['What would you write down,|if your city was on fire?'],
  l02: ['London, 1666.', 'Samuel Pepys keeps a secret diary,|in a private shorthand.', 'Almost every day, for nine years,|he writes down his life.'],
  l03: ['At three in the morning,|his maid wakes him.', "There's a fire in Pudding Lane.", "He looks out of the window,|decides it's far away,", 'and goes back to bed.'],
  l04: ["But by morning,|it isn't far away at all.", 'Hundreds of houses|have already burned.'],
  l05: ['So Pepys climbs the Tower|of London to see it himself.', 'He takes a boat along the river.', 'Then he tells the King the only way|to stop it: pull houses down.'],
  l06: ['That night, he carries his things|into the garden, by moonlight.', 'Days later, he buries his wine,', 'and his Parmesan cheese, in a pit.'],
  l07: ['In the end, over thirteen thousand|houses, eighty-seven churches,', "and St Paul's Cathedral are lost.", 'But Pepys had sent his diary|to safety.', 'And because he wrote it all down,', 'we can stand in that room today.'],
  l08: ['The diary sat almost unread, for years.', 'Then a student spent three years|cracking the shorthand.', 'It was first published in 1825.'],
  l09: ['Pepys leaves us three habits.', 'Write it the same day,|while the details are fresh.', 'Record the big and the small together.', 'And keep your notebook safe.'],
  l10: ['Try a Pepys page, tonight.', 'The time. The place.', 'One thing someone said.', 'One thing you carried.', 'And one feeling, in plain words.', 'Ten minutes is plenty.'],
  l11: ["If you'd like a private place|for your pages,", "It's My Notebook keeps them|encrypted, just for you.", 'Start yours tonight.'],
};
const cues = [];
for (const L of TL.lines) {
  const ph = M[L.id], w = ph.map(p => { const x = p.replace('|', ' '); return x.length + 5 + (/[.?:]$/.test(x) ? 5 : /,$/.test(x) ? 2 : 0); }), tot = w.reduce((a, b) => a + b, 0);
  const a0 = L.t0 + .02, a1 = L.t1; let acc = 0;
  ph.forEach((p, i) => { const s = a0 + (a1 - a0) * acc / tot; acc += w[i]; const e = a0 + (a1 - a0) * acc / tot; cues.push({ id: L.id, k: i, t0: +(s - .04).toFixed(2), t1: +(e + .3).toFixed(2), text: p.replace('|', '\n') }); });
}
for (let i = 0; i < cues.length; i++) { const nx = cues[i + 1] ? cues[i + 1].t0 - .04 : 1e9; cues[i].t1 = +Math.min(Math.max(cues[i].t1, cues[i].t0 + 1.8), nx).toFixed(2); }
fs.writeFileSync('cues.json', JSON.stringify(cues, null, 1));
console.log(cues.map(c => `${c.id}.${c.k} ${c.t0}-${c.t1}`).join(' | '));
