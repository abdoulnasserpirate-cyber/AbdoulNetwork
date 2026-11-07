"""Build the edit decision list: snapped cuts, compressed pauses, corrected words."""
import json, difflib, re, numpy as np

FPS = 30
DB = {'face': np.load('face_clean_db.npy'), 'ecran': np.load('ecran_clean_db.npy')}
WH = {'face': json.load(open('face16.json')), 'ecran': json.load(open('ecran16.json'))}
TH = -40.0          # silence threshold (dB, 20 ms RMS)
HOP = 0.01

def is_sil(src, t):
    i = int(round(t / HOP)); d = DB[src]
    return i < 0 or i >= len(d) or d[i] < TH

def snap_start(src, s):
    if is_sil(src, s):                       # move forward to speech onset
        t = s
        while t < s + 0.4 and is_sil(src, t): t += HOP
        return t - 0.06
    t = s                                    # move back to the silence before
    while t > s - 0.35 and not is_sil(src, t): t -= HOP
    if is_sil(src, t): return t - 0.03
    w = DB[src][int((s - .12) / HOP):int((s + .05) / HOP)]   # fallback: energy minimum
    return s - .12 + int(np.argmin(w)) * HOP

def snap_end(src, e):
    if is_sil(src, e):
        t = e
        while t > e - 0.4 and is_sil(src, t): t -= HOP
        return t + 0.08
    t = e
    while t < e + 0.4 and not is_sil(src, t): t += HOP
    return t + 0.06

def split_pauses(src, a, b, maxp=0.38, keep=0.10):
    """Return list of (a,b) keeping speech, shrinking internal silences > maxp."""
    out = []; cur = a; t = a + 0.05; run = None
    while t < b - 0.05:
        if is_sil(src, t):
            if run is None: run = t
        else:
            if run is not None and t - run > maxp:
                out.append((cur, run + keep)); cur = t - keep
            run = None
        t += HOP
    out.append((cur, b))
    return out

def q(t): return round(t * FPS) / FPS

# ---- whisper tokens merged (apostrophes / hyphens / dots glued to previous)
def tokens(src):
    toks = []
    for s in WH[src]:
        for w in s['words']:
            txt = w['w'].strip()
            if toks and re.match(r"^['\-.]", txt):
                toks[-1] = (toks[-1][0] + txt, toks[-1][1], w['e'])
            else:
                toks.append((txt, w['s'], w['e']))
    return toks
TOK = {k: tokens(k) for k in WH}
def norm(w): return re.sub(r"[^a-zàâçéèêëîïôûùüœ0-9]", "", w.lower())

# ---- segments: (id, src, start, end, corrected text, video mode)
# text markup: *word* = keyword (green); {emoji} attaches emoji to previous word
SEGS = [
 ('F1','face',3.14,5.22,"Tu en as marre des *publicités* sur ton téléphone{📱} ?", {}),
 ('F2','face',5.68,7.26,"Tu ouvres une application… *pub* !", {}),
 ('F3','face',7.52,9.50,"Tu regardes une vidéo… encore une *pub* !", {}),
 ('F4','face',9.74,12.30,"Tu lis un article et boum… encore une autre *pub*{😩} !", {}),
 ('F5','face',12.56,13.88,"Franchement, c'est *énervant*{😤}.", {}),
 ('F6','face',14.32,19.14,"Mais *bonne* *nouvelle* : il existe une *astuce*{💡} très *simple* pour *bloquer*{🚫} ces *publicités*-là.", {}),
 ('F8','face',27.70,30.88,"Après cette vidéo, ton téléphone ne sera plus le *même*{🔥}.", {}),
 ('A','ecran',1.80,6.30,"Pour *arrêter* les *publicités* sur votre téléphone, il suffit de vous rendre dans *Paramètres*{⚙️}.", {'vend':8.45}),
 ('B','ecran',10.80,14.40,"Nous allons nous rendre dans *Connexion* *multi-appareils*.", {'vend':16.05}),
 ('C','ecran',18.12,20.80,"Ensuite, ici, nous allons cliquer sur *DNS* *privé*.", {'vend':24.45}),
 ('D','ecran',26.15,28.25,"Vous allez voir que c'est sur *Désactivé*.", {}),
 ('E','ecran',29.88,33.94,"Je vais cliquer sur *Nom* *d'hôte* *du* *fournisseur* *DNS* *privé*.", {'vend':35.75}),
 ('G','ecran',40.70,49.90,"Vous allez taper exactement : *dns.adguard.com*", {}),
 ('H','ecran',51.02,55.10,"Dès que vous écrivez ça, vous allez *enregistrer* et c'est fini.", {}),
 ('I','ecran',55.72,61.10,"Dès que c'est enregistré, vous allez voir que *DNS* *privé*, ça va afficher *dns.adguard.com* là-bas.", {}),
 ('J','ecran',61.42,65.20,"C'est *fini*{✅} ! Vous n'aurez plus de *publicités* sur votre téléphone.", {'voff':-4.0}),
 ('K','ecran',65.64,71.80,"Si cette astuce t'a plu, n'hésite pas à t'*abonner*{🔔}, à *liker* et à *partager* la vidéo autour de toi.", {'cta':True}),
]

def parse(text):
    words = []
    for raw in text.split():
        emo = None
        m = re.search(r"\{(.+?)\}", raw)
        if m: emo = m.group(1); raw = raw.replace(m.group(0), "")
        key = '*' in raw; raw = raw.replace('*', '')
        if not norm(raw):                       # pure punctuation -> glue to previous
            if words: words[-1]['t'] += (' ' + raw if raw in '?!:;' else raw)
            if emo and words: words[-1]['emo'] = emo
            continue
        if raw.startswith('-') and words:        # "publicités-là"
            words[-1]['t'] += raw; continue
        words.append({'t': raw, 'key': key, 'emo': emo})
    # French typography: non-breaking space before ? ! : ;
    for w in words: w['t'] = re.sub(r"\s?([?!:;])$", " \\1", w['t'])
    return words

OV = json.load(open('overrides.json')) if __import__('os').path.exists('overrides.json') else {}
prev_end = {}
out_t = 0.0; subs = []; allwords = []; segs_meta = []
for sid, src, s, e, text, opt in SEGS:
    a = q(OV.get(sid, {}).get('a', snap_start(src, s))); b = q(OV.get(sid, {}).get('b', snap_end(src, e)))
    if prev_end.get(src) is not None and a < prev_end[src]: a = prev_end[src]
    prev_end[src] = b
    parts = [(q(x), q(y)) for x, y in split_pauses(src, a, b)]
    voff = opt.get('voff', 0.0)
    if 'vend' in opt: voff = q(opt['vend'] - parts[-1][1])
    seg_start = out_t; mapping = []
    for x, y in parts:
        subs.append({'seg': sid, 'src': src, 'a0': x, 'a1': y, 'voff': voff, 't0': round(out_t, 4)})
        mapping.append((x, y, out_t)); out_t += y - x
    # align corrected words to whisper tokens in [a,b]
    wt = [t for t in TOK[src] if t[2] > a - 0.05 and t[1] < b + 0.05]
    cw = parse(text)
    sm = difflib.SequenceMatcher(None, [norm(t[0]) for t in wt], [norm(w['t']) for w in cw], autojunk=False)
    times = [None] * len(cw)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal' or (tag == 'replace' and i2 - i1 == j2 - j1):
            for k in range(j2 - j1): times[j1 + k] = (wt[i1 + k][1], wt[i1 + k][2])
        elif tag == 'replace':
            ts, te = wt[i1][1], wt[i2 - 1][2]
            for k in range(j2 - j1):
                times[j1 + k] = (ts + (te - ts) * k / (j2 - j1), ts + (te - ts) * (k + 1) / (j2 - j1))
    # interpolate missing
    for i, tm in enumerate(times):
        if tm is None:
            prev = times[i - 1][1] if i else a
            nxt = next((x[0] for x in times[i + 1:] if x), b)
            times[i] = (prev, max(prev + 0.1, nxt))
    def src2out(t):
        for x, y, o in mapping:
            if t < y: return o + max(0.0, t - x)
        x, y, o = mapping[-1]; return o + (y - x)
    for w, (ts, te) in zip(cw, times):
        w['s'] = round(src2out(max(ts, a)), 3); w['e'] = round(src2out(min(te, b)), 3); w['seg'] = sid
        allwords.append(w)
    segs_meta.append({'seg': sid, 'src': src, 't0': round(seg_start, 4), 't1': round(out_t, 4), 'voff': voff, 'cta': opt.get('cta', False)})
    print(f"{sid:3} {src:5} {a:6.2f}-{b:6.2f} parts={len(parts)} voff={voff:+.2f} out {seg_start:6.2f}-{out_t:6.2f}  | " + ' '.join(w['t'] for w in cw))

json.dump({'subs': subs, 'words': allwords, 'segs': segs_meta, 'dur': round(out_t, 4)}, open('edl.json', 'w'), ensure_ascii=False, indent=1)
print('total voice duration', round(out_t, 2))
