"""Sound for "Pepys and the Great Fire": narration + pen foley (driven by the strokes on screen) + a light wooden score."""
import json, os, sys
import numpy as np, soundfile as sf, soxr
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
EVJ = json.load(open(os.path.join(HERE, 'events.json')))
DUR = float(TL['dur']); N = int(DUR * SR); EV = EVJ['ev']
LN = {l['id']: l for l in TL['lines']}
CQ = json.load(open(os.path.join(HERE, 'cues.json')))
PS = lambda i, k=0: [c for c in CQ if c['id'] == i and c['k'] == k][0]['t0']
rng = np.random.default_rng(31)
tt = np.arange(N) / SR
rms = lambda x: float(np.sqrt(np.mean(np.square(x)) + 1e-12))
db = lambda x: 20 * np.log10(x + 1e-12)


def smooth(x, sec):
    k = max(1, int(sec * SR)); return np.convolve(x, np.ones(k) / k, 'same')


# ---------------- voice ----------------
vo = np.zeros(N); vmask = np.zeros(N)
for L in TL['lines']:
    x, sr = sf.read(os.path.join(HERE, 'voice', L['id'] + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = soxr.resample(x, sr, SR)
    i = int(L['t0'] * SR); n = min(len(x), N - i); vo[i:i + n] += x[:n]; vmask[i:i + n] = 1
vo = hp(vo, 90)
vo = compress(vo / (np.abs(vo).max() + 1e-9) * 0.9, thr=0.22, ratio=3.0, att=0.003, rel=0.12)
duck = smooth(np.maximum(vmask, np.roll(vmask, int(0.12 * SR))), 0.15)   # 1 while speaking, eased edges


# ---------------- pen foley (driven by the strokes on screen) ----------------
def activity(kind):
    a = np.zeros(N); pw = np.zeros(N)
    for e in EV:
        if e['type'] != kind: continue
        i0 = int(e['t'] * SR); i1 = min(N, int((e['t'] + max(e['d'], 0.03)) * SR))
        if i1 <= i0: continue
        n = i1 - i0; env = np.ones(n); r = min(n // 3, int(0.012 * SR))
        if r > 0: env[:r] = np.linspace(0, 1, r); env[-r:] = np.linspace(1, 0, r)
        a[i0:i1] += env; pw[i0:i1] += env * e.get('pan', 0)
    pan = np.where(a > 1e-6, pw / np.maximum(a, 1e-6), 0)
    return smooth(1 - np.exp(-a * 0.9), 0.02), smooth(pan, 0.02)


def scratch_noise(lo, hi, grain_hz, depth, seed):
    r = np.random.default_rng(seed); x = bp(r.standard_normal(N), lo, hi, 2)
    g = lp(np.abs(r.standard_normal(N)), grain_hz, 1); g = g / (np.percentile(g, 95) + 1e-9)
    return x * ((1 - depth) + depth * g)


def wobble(rate, seed):
    r = np.random.default_rng(seed)
    ph = np.cumsum(rate * (1 + 0.35 * lp(r.standard_normal(N), 3, 1) * 8) / SR) * 2 * np.pi
    return 0.55 + 0.45 * np.abs(np.sin(ph))


def pan_st(x, pan):
    th = (pan + 1) * np.pi / 4; return np.stack([x * np.cos(th), x * np.sin(th)], 1)


foley = np.zeros((N, 2))
for kind, (lo, hi, gh, dep, rate, pw, g, sd) in {
        'pen': (2400, 6500, 900, 0.85, 6, 1.0, 0.14, 1),
        'write': (2000, 6000, 700, 0.9, 11, 1.5, 0.17, 3),
        'marker': (700, 3200, 300, 0.6, 14, 2.0, 0.14, 5)}.items():
    lv, pn = activity(kind)
    foley += pan_st(scratch_noise(lo, hi, gh, dep, sd) * wobble(rate, sd + 1) ** pw * lv, pn * 0.6) * g
for e in EV:
    if e['type'] in ('pen', 'write') and e['d'] >= 0.12:
        add(foley, hp(click(pitch=0.55 + rng.random() * 0.2, v=1.0), 1500) * 0.04, e['t'], 1.0, e.get('pan', 0) * 0.6)
foley *= (1 - 0.5 * duck)[:, None]                                   # pens step back under the voice
room = lp(rng.standard_normal(N), 500, 2) * 0.004
foley += np.stack([room, np.roll(room, 997)], 1)
# fire, burning-page whooshes (kept under the voice), and a very faint pen texture
fx = np.zeros((N, 2))
sc = {e['id']: e for e in EV if e['type'] == 'scene'}
fire_spans = []   # no fire crackle: it pulled attention from the voice
_unused = [(PS('l01', 0) + 2.4, sc['pepys']['t'], 0.5), (sc['morning']['t'], sc['acts']['t'], 1.0), (sc['acts']['t'], sc['garden']['t'], 0.8), (sc['lost']['t'], PS('l07', 3), 0.5), (sc['am3']['t'] + 4, sc['morning']['t'], 0.25)]
fire = np.zeros(N)
for a_, b_, lv in fire_spans:
    for tb in np.arange(a_, b_, 0.045):
        if rng.random() < 0.55:
            i0 = int(tb * SR); d = int(rng.uniform(0.003, 0.018) * SR)
            if i0 + d < N: fire[i0:i0 + d] += hp(rng.standard_normal(d), 1500) * rng.uniform(0.3, 1) * lv
    ev_ = np.zeros(N); ev_[int(a_ * SR):int(b_ * SR)] = 1; ev_ = smooth(ev_, 0.6)
    fx += (bp(rng.standard_normal(N), 180, 650, 2) * ev_ * 0.02 * lv)[:, None]
fx += (lp(fire, 9000) * 0.05)[:, None]
for e in EV:
    if e['type'] == 'burn':
        add(fx, lp(whoosh(0.95, 1.0), 2200) * 0.06, e['t'] - 0.05, 1.0, 0.0)   # one soft page whoosh, nothing else

# ---------------- score: F major, 100 bpm, chords follow the story ----------------
B = 0.6
T = lambda i: LN[i]['t0']
CH = [  # (start, end, chord tones, texture)
    (T('l02') - 0.2, T('l03'), [53, 60, 65, 69, 72], 'marimba'),
    (T('l03'), T('l04'), [50, 57, 62, 65, 69], 'marimba'),
    (T('l04'), T('l05'), [46, 58, 62, 65, 70], 'marimba'),
    (T('l05'), T('l06'), [48, 55, 60, 64, 67], 'marimba'),
    (T('l06'), T('l07'), [43, 55, 62, 67, 70], 'bowed'),
    (T('l07'), PS('l07', 3), [50, 57, 62, 65, 69], 'bowed'),
    (PS('l07', 3), T('l08'), [53, 60, 65, 69, 72], 'marimba'),
    (T('l08'), T('l09'), [46, 58, 62, 65, 70], 'marimba'),
    (T('l09'), T('l10'), [53, 60, 65, 69, 72], 'marimba'),
    (T('l10'), T('l11'), [48, 55, 60, 64, 67], 'marimba'),
    (T('l11'), DUR - 4.4, [53, 60, 65, 69, 72], 'marimba')]
ev = [(PS('l01', 0) + 2.0, 'kalimba', 84, 1.6, 0.45, 0.2, 0.6), (PS('l01', 0) + 2.5, 'kalimba', 77, 1.6, 0.4, -0.2, 0.55)]
for i, (a, b, ns, tex) in enumerate(CH):
    ev.append((a, 'kalimba', ns[3] + 12 if i % 2 else ns[4], 1.2, 0.5, -0.25, 0.7))
    ev.append((a, 'cellos_pizz', ns[0] if ns[0] < 52 else ns[0] - 12, 0.8, 0.5, -0.1, 0.8))
    if tex == 'bowed':
        for j, n in enumerate(ns[2:]): ev.append(dict(t=a + 0.1 * j, inst='vibraphone_bowed', pitch=n, dur=b - a - 0.2, vel=0.4, pan=-0.3 + 0.3 * j, gain=0.5, attack=0.6))
        continue
    t = a + B; k = 0
    while t < b - 0.05:
        ev.append((t, 'marimba', ns[1 + (k * 2) % 4], 0.4, 0.26 + 0.05 * (k % 2 == 0), 0.15, 0.5))
        if k % 4 == 3: ev.append((t, 'cellos_pizz', ns[0] + 7 if ns[0] + 7 < 60 else ns[0], 0.6, 0.35, -0.1, 0.6))
        t += B; k += 1
ev.append((PS('l07', 3), 'glockenspiel', 84, 1.2, 0.5, 0.3, 0.5)); ev.append((PS('l07', 3) + 0.15, 'glockenspiel', 89, 1.2, 0.45, 0.3, 0.45))
for j, n in enumerate([77, 81, 84, 86, 89, 91]):                           # a sparkling climb on "Start yours tonight"
    ev.append((PS('l11', 2) + 0.2 + j * 0.42, 'glockenspiel', n, 0.8, 0.3 + 0.04 * j, 0.3, 0.42)); ev.append((PS('l11', 2) + 0.2 + j * 0.42, 'marimba', n - 24, 0.4, 0.3, 0.1, 0.5))
DONE = DUR - 4.3
for i, p in enumerate([53, 60, 65, 69, 72, 77]):
    ev.append((DONE + i * 0.035, 'harp', p, 3.0, 0.62, -0.3 + i * 0.12, 0.9))
ev += [(DONE, 'vibraphone', 65, 3.0, 0.5, 0.0, 0.6), (DONE, 'vibraphone', 69, 3.0, 0.45, 0.1, 0.5), (DONE + 0.02, 'glockenspiel', 89, 2.5, 0.55, 0.2, 0.55), (DONE, 'cellos_pizz', 41, 2.0, 0.6, 0.0, 0.85)]
S.seed(5)
music = S.render(ev, dur=DUR + 3, master=False)[:N]
music = S.room(music, size=0.4, mix=0.2)
music = music - 0.37 * np.stack([bp(music[:, 0], 300, 4000), bp(music[:, 1], 300, 4000)], 1)   # ~ -4 dB where the voice lives
music *= (1 - 0.45 * duck)[:, None]
fade = np.clip((DUR - tt) / 0.8, 0, 1); music *= fade[:, None]

# ---------------- balance: voice ~10 dB above the music (RMS) ----------------
spk = vmask > 0
m_rms = rms(music[spk].mean(1)); v_rms = rms(vo[spk])
vg = (m_rms * 10 ** (10 / 20)) / v_rms
mix = foley * 0.2 + fx + music + np.stack([vo * vg, vo * vg], 1)
print(f'voice vs music (RMS while speaking): {db(rms(vo[spk]) * vg) - db(rms(music[spk].mean(1))):.1f} dB;'
      f' voice vs pens: {db(rms(vo[spk]) * vg) - db(rms(foley[spk].mean(1))):.1f} dB')
mix = mix * 1.3
mix = np.stack([limit(compress(mix[:, c], thr=0.35, ratio=2.0)) for c in (0, 1)], 1)
mix *= np.clip((DUR - tt) / 0.25, 0, 1)[:, None]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
used = ['cellos_pizz', 'marimba', 'kalimba', 'glockenspiel', 'harp', 'vibraphone', 'vibraphone_bowed']
cr = S.credits(used); open(os.path.join(HERE, 'out', 'instruments.txt'), 'w').write('\n'.join(cr) if isinstance(cr, list) else str(cr))
print('mix', mix.shape, 'peak', round(float(np.abs(mix).max()), 3))
