"""Generate the two HyperFrames compositions from one source.

  index.html       1080x1920 (TikTok / Reels)
  horizontal/index.html  1920x1080 (YouTube / Facebook) — own project dir, assets symlinked

Every on-screen element carries `data-at` (entrance time, seconds, taken from
TIMING.md) and optionally `data-in` (entrance style) / `data-out` (exit time).
The shared GSAP timeline turns those attributes into tweens; the scene-specific
moves (typewriter, morphs, charts, particles...) are written below in SCENE_JS.
Run:  python3 tools/build.py
"""
import json, math, os, re, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DUR = 67.5
VO_DUR = 65.875
ICON_DIR = os.path.join(ROOT, "assets", "icons")


def I(name, cls=""):
    svg = open(os.path.join(ICON_DIR, name + ".svg")).read()
    svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S).strip()
    svg = re.sub(r'\s(class|width|height)="[^"]*"', "", svg, count=3)
    return svg.replace("<svg", f'<svg class="ic {cls}"', 1)


def W(text, t, k=False, cls=""):
    c = "w" + (" k" if k else "") + (" " + cls if cls else "")
    return f'<span class="{c}" data-at="{t}">{text}</span>'


def HEAD(id_, lines, out=None, cls=""):
    o = f' data-out="{out}"' if out is not None else ""
    body = "".join('<div class="ln">' + " ".join(W(*w) for w in ln) + "</div>" for ln in lines)
    return f'<div id="{id_}" class="head {cls}"{o}>{body}</div>'


def PILL(id_, text, t, out, extra=None, icon="check"):
    x = ""
    if extra:
        x = f'<span class="pill-x" data-at="{extra[1]}" data-in="mask">{extra[0]}</span>'
    return (f'<div id="{id_}" class="pill shimmer-sweep-target" data-at="{t}" data-in="slideL" data-out="{out}">'
            f'<span class="pill-dot">{I(icon)}</span><span class="pill-t">{text}</span>{x}</div>')


# ---------------------------------------------------------------- prompt typing
PROMPT = [  # (segment start, segment end, [(text, keyword?, highlight time)])
    (33.80, 35.89, [("Le produit ", 0, 0), ("tourne lentement", 1, 34.50), (" sur lui-même, ", 0, 0)]),
    (36.45, 37.46, [("lumière de studio", 1, 36.45), (", ", 0, 0)]),
    (38.10, 39.96, [("gouttes d'eau", 1, 38.10), (" qui tombent autour, ", 0, 0)]),
    (40.48, 42.42, [("style ", 0, 0), ("publicité de luxe", 1, 41.19), (".", 0, 0)]),
]
KEY_TIMES = []


def prompt_html():
    out = []
    for s, e, parts in PROMPT:
        n = sum(len(p[0]) for p in parts)
        span = (e - s) * 0.9
        i = 0
        for text, kw, hl in parts:
            chunk = []
            for word in re.split(r"(\s+)", text):
                if not word:
                    continue
                chars = []
                for ch in word:
                    t = round(s + span * i / n, 3)
                    KEY_TIMES.append(t)
                    chars.append(f'<span class="ch" data-tw="{t}">{"&nbsp;" if ch == " " else ch}</span>')
                    i += 1
                if word.isspace():
                    chunk.append("".join(chars).replace("&nbsp;", " "))
                else:
                    chunk.append('<span class="wd">' + "".join(chars) + "</span>")
            inner = "".join(chunk)
            out.append(f'<span class="kw" data-hl="{hl}">{inner}</span>' if kw else inner)
    return "".join(out)


# ---------------------------------------------------------------- sound design
SFX = [
    (0.00, "whoosh", .30), (1.11, "pop", .25), (2.21, "impact", .55), (2.21, "stamp", .35),
    (4.07, "pop", .3), (4.27, "whoosh", .32), (5.32, "pop", .22), (7.60, "glitch", .30),
    (8.74, "pop", .25), (9.17, "tick", .4), (9.86, "pop", .25), (10.42, "tick", .4),
    (10.90, "whoosh", .35), (11.18, "pop", .25), (11.46, "pop", .2), (12.21, "whoosh", .18),
    (14.39, "ding", .32), (16.55, "stamp", .45), (16.55, "impact", .3),
    (17.80, "whoosh", .35), (18.04, "pop", .25), (19.78, "pop", .25), (20.50, "tick", .45),
    (21.85, "whoosh", .28), (22.30, "pop", .25), (23.50, "pop", .22), (24.29, "ding", .25),
    (24.72, "whoosh", .22), (25.38, "tick", .4),
    (27.95, "whoosh", .35), (28.21, "pop", .25), (29.18, "whoosh", .18), (32.93, "whoosh", .25),
    (34.50, "pop", .2), (36.45, "pop", .2), (38.10, "pop", .2), (40.00, "pop", .25), (41.19, "pop", .2),
    (42.60, "whoosh", .35), (44.30, "ding", .3), (44.50, "glitch", .32), (44.50, "impact", .4),
    (46.07, "whoosh", .25), (46.26, "pop", .22), (47.50, "pop", .25),
    (48.22, "whoosh", .35), (48.54, "pop", .25), (50.10, "pop", .3), (51.17, "pop", .3),
    (52.18, "pop", .3), (52.74, "pop", .22), (53.67, "ding", .32),
    (54.70, "whoosh", .35), (55.03, "pop", .25), (56.87, "pop", .28), (57.30, "coin", .28), (57.90, "coin", .22),
    (59.15, "whoosh", .2), (60.20, "pop", .18), (60.60, "pop", .18), (61.00, "pop", .18), (61.40, "pop", .18),
    (63.52, "pop", .28), (65.01, "pop", .28), (65.60, "whoosh", .3), (65.60, "impact", .3),
]
BUBBLE_T = [59.61, 60.20, 60.60, 61.00, 61.40]


def typing_wav():
    """Keyboard clicks rendered at the exact typewriter character times."""
    with wave.open(os.path.join(ROOT, "assets/sfx/key.wav")) as w:
        key = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2)[:, 0] / 32768
    sr = 44100
    t0 = 33.5
    times = KEY_TIMES + [59.61 + i * 0.07 for i in range(8)]
    n = int((61.0 - t0) * sr)
    buf = np.zeros(n)
    rng = np.random.default_rng(11)
    for t in times:
        i = int((t - t0) * sr)
        g = 0.35 + 0.25 * rng.random()
        seg = key[: n - i] * g
        buf[i:i + len(seg)] += seg
    buf = np.clip(buf, -1, 1)
    st = np.stack([buf, buf], 1)
    with wave.open(os.path.join(ROOT, "assets/sfx/typing.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    return t0, n / sr


# ---------------------------------------------------------------- markup
def body(O):
    up = "↑" if O == "V" else "→"
    sc = []
    # ===== S1 hook (dark) 0 → 11.25
    sc.append(f'''
<section id="s1" class="clip scene" data-start="0" data-duration="11.25" data-track-index="1">
  {HEAD("s1hA", [[("Tu", .09), ("vends", .24), ("des", .40)], [("produits", .55, True), ("?", .70)]], out=2.12)}
  <div id="s1postW" class="abs" data-float="10">
    <div id="s1post" class="card post" data-at="1.11" data-in="rise">
      <div class="post-h"><span class="post-av"></span><span class="post-l"><i></i><i></i></span></div>
      <div class="post-img">{I("image")}</div>
      <div class="post-f">{I("eye")}<span class="cnt"><span id="s1roll" class="roll">0 1 2 3 4 5 6 7 8 9 0</span></span><span id="s1vues" class="post-v">vues</span></div>
    </div>
  </div>
  <div id="s1zero" class="zero"><span id="s1zeroT" data-at="2.21" data-in="stamp" data-out="3.30">0 VUE</span></div>
  {HEAD("s1hB", [[("Avec", 3.42), ("une", 3.75)], [("seule", 4.07, True), ("photo", 4.27, True)]], out=6.80)}
  {HEAD("s1hC", [[("une", 7.07), ("vraie", 7.40)], [("vidéo", 7.60, True), ("pub", 7.92, True)]], out=8.45)}
  {HEAD("s1hD", [[("Pas", 8.58, True), ("de", 9.0), ("caméra.", 9.17)], [("Pas", 9.64, True), ("de", 10.21), ("monteur.", 10.42)]], out=10.85)}
  <div id="s1cardW" class="abs" data-float="8">
    <div id="s1card" class="card media" data-at="4.07" data-in="drop" data-out="10.85">
      <img class="m-img" src="assets/img/produit-sq.jpg" alt="">
      <img class="m-img g1" src="assets/img/produit-sq.jpg" alt="">
      <img class="m-img g2" src="assets/img/produit-sq.jpg" alt="">
      <div id="s1play" class="play">{I("play")}</div>
      <div id="s1bar" class="vbar"><i id="s1barF"></i></div>
    </div>
  </div>
  <div id="s1ai" class="chip ai" data-at="5.32" data-in="elastic" data-out="7.50">{I("wand-sparkles")}<span>IA</span></div>
  <div id="s1cam" class="strike" data-at="8.74" data-in="pop" data-out="10.85">{I("camera")}<span>Caméra</span><i id="s1camX" class="x-line"></i></div>
  <div id="s1cut" class="strike" data-at="9.86" data-in="pop" data-out="10.85">{I("scissors")}<span>Monteur</span><i id="s1cutX" class="x-line"></i></div>
</section>''')
    # ===== S2 step 1 (light) 10.95 → 18.15
    sc.append(f'''
<section id="s2" class="clip scene light" data-start="10.95" data-duration="7.2" data-track-index="2">
  {PILL("s2pill", "Étape 1", 11.18, 17.55)}
  <div id="s2num" class="num" data-at="11.46" data-in="elastic" data-out="17.55">1</div>
  {HEAD("s2h", [[("Télécharge", 12.21)], [("Kling", 13.58, True), ("AI", 13.85, True)]], out=17.55)}
  <div id="s2phoneW" class="abs phoneW" data-float="9">
    <div id="s2phone" class="phone" data-at="12.21" data-in="rise3d" data-out="17.55">
      <div class="screen">
        <img id="s2scr1" class="scr" src="assets/img/kling-1-ui.jpg" alt="">
        <img id="s2scr2" class="scr" src="assets/img/kling-2-ui.jpg" alt="">
        <div id="s2dl" class="dl"><div class="dl-t">{I("download")}<span id="s2pct">0%</span></div><div class="dl-b"><i id="s2dlF"></i></div></div>
        <div id="s2ok" class="ok">{I("check")}</div>
      </div>
      <div class="notch"></div>
    </div>
  </div>
  <div id="s2stampW" class="abs">
    <div id="s2burst" class="burst">{"".join(f'<span class="particle" style="--c:{c}"></span>' for c in (["#FF7A1A", "#0B1026", "#FFB066", "#1AA35A", "#FF7A1A", "#9DB4FF"] * 4))}</div>
    <div id="s2stamp" class="stamp" data-at="16.55" data-in="stamp" data-out="17.55"><b>GRATUIT</b><span>pour commencer</span></div>
  </div>
</section>''')
    # ===== S3 step 2 (dark) 17.85 → 28.3
    sc.append(f'''
<section id="s3" class="clip scene" data-start="17.85" data-duration="10.45" data-track-index="1">
  {PILL("s3pill", "Étape 2", 18.04, 27.75)}
  <div id="s3num" class="num" data-at="18.39" data-in="elastic" data-out="23.10">2</div>
  {HEAD("s3hA", [[("Appuie", 18.95), ("sur", 19.34)], [("Image", 19.78, True), ("→", 20.22, True), ("Vidéo", 20.50, True)]], out=21.15)}
  {HEAD("s3hB", [[("Ajoute", 21.42), ("ta", 21.69)], [("photo", 21.85, True)]], out=23.20)}
  {HEAD("s3hC", [[("Photo", 23.94), ("nette,", 24.29, True)], [("fond", 25.38), ("propre", 25.63, True)]], out=26.25)}
  {HEAD("s3hD", [[("C'est", 26.39), ("ça", 26.58, True)], [("la", 27.16), ("différence", 27.36, True)]], out=27.75)}
  <div id="s3phoneW" class="abs phoneW" data-float="9">
    <div id="s3phone" class="phone" data-at="18.95" data-in="rise3d" data-out="23.10">
      <div class="screen ui">
        <div class="ui-top"><b>Kling AI</b><span class="ui-av"></span></div>
        <div id="s3btn" class="ui-btn"><span>Image → Vidéo</span></div>
        <div id="s3up" class="ui-up">{I("upload")}<span>Ajouter</span></div>
        <div class="ui-go">Générer</div>
        <i id="s3rip" class="ripple"></i>
      </div>
      <div class="notch"></div>
    </div>
  </div>
  <div id="s3fly" class="fly" data-out="23.10"><img src="assets/img/produit-sq.jpg" alt=""></div>
  <div id="s3cmpW" class="abs" data-float="7">
    <div id="s3cmp" class="card cmp" data-at="23.50" data-in="zoom" data-out="27.75">
      <img class="m-img" src="assets/img/produit-sq.jpg" alt="">
      <img id="s3blur" class="m-img blurry" src="assets/img/produit-sq.jpg" alt="">
      <i id="s3sep" class="sep"></i>
      <div id="s3bad" class="badge bad" data-at="25.38" data-in="stamp">{I("x")}<span>Floue</span></div>
      <div id="s3good" class="badge good" data-at="24.29" data-in="stamp">{I("check")}<span>Nette</span></div>
    </div>
  </div>
</section>''')
    # ===== S4 step 3 prompt (light) 28.0 → 42.95
    sc.append(f'''
<section id="s4" class="clip scene light" data-start="28.0" data-duration="14.95" data-track-index="2">
  {PILL("s4pill", "Étape 3", 28.21, 42.45, extra=(" · La plus importante", 29.18), icon="star")}
  <div id="s4num" class="num" data-at="28.62" data-in="elastic" data-out="32.70">3</div>
  {HEAD("s4h", [[("Décris", 30.58), ("le", 30.94)], [("mouvement", 31.16, True)]], out=42.45)}
  <div id="s4cardW" class="abs" data-float="7">
    <div id="s4card" class="card prompt" data-at="32.93" data-in="rise" data-out="42.45">
      <div class="pr-h"><span class="pr-l">{I("wand-sparkles")}PROMPT</span><span class="pr-ex" data-at="33.17" data-in="pop">Exemple</span><span class="pr-c">{I("copy")}</span></div>
      <div class="pr-t">{prompt_html()}</div>
    </div>
  </div>
  <div id="s4i1" class="orb" data-at="34.50" data-in="elastic" data-out="42.45"><i data-float="8">{I("rotate-3d")}</i></div>
  <div id="s4i2" class="orb" data-at="36.45" data-in="elastic" data-out="42.45"><i data-float="8">{I("lightbulb")}</i></div>
  <div id="s4i3" class="orb" data-at="38.10" data-in="elastic" data-out="42.45"><i data-float="8">{I("droplet")}</i></div>
  <div id="s4i4" class="orb" data-at="41.19" data-in="elastic" data-out="42.45"><i data-float="8">{I("gem")}</i></div>
  <div id="s4stk" class="sticker" data-at="40.00" data-in="stamp" data-out="42.45">{up} Copie ce prompt</div>
</section>''')
    # ===== S5 result (dark) 42.65 → 48.6
    drops = "".join('<i class="drop"></i>' for _ in range(26))
    sc.append(f'''
<section id="s5" class="clip scene" data-start="42.65" data-duration="5.95" data-track-index="1">
  {HEAD("s5hA", [[("Lance", 43.04), ("la", 43.20)], [("génération", 43.37, True)]], out=44.42)}
  {HEAD("s5hB", [[("Regarde", 44.50, True), ("le", 44.78)], [("résultat", 44.96)]], out=45.80)}
  {HEAD("s5hC", [[("Ta", 45.88), ("photo", 46.26), ("→", 46.57)], [("vidéo", 47.50, True), ("pub", 47.81, True)]], out=48.30)}
  <div id="s5phoneW" class="abs phoneW">
    <div id="s5phone" class="phone" data-at="42.90" data-in="zoom" data-out="44.45">
      <div class="screen">
        <img class="scr dim" src="assets/img/produit-sq.jpg" alt="">
        <i id="s5scan" class="scan"></i>
        <svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" class="ring-bg"/><circle id="s5arc" cx="100" cy="100" r="80" class="ring-fg"/></svg>
        <div id="s5pct" class="pct">0%</div>
      </div>
      <div class="notch"></div>
    </div>
  </div>
  <div id="s5bef" class="card frame" data-at="46.07" data-in="slideL" data-out="48.30">
    <img class="m-img" src="assets/img/produit-sq.jpg" alt="">
    <span class="tag gray" data-at="46.26" data-in="pop">AVANT</span>
  </div>
  <div id="s5res" class="card frame res" data-out="48.30">
    <div class="res-in">
      <img id="s5bg" class="m-img" src="assets/img/produit.jpg" alt="">
      <img id="s5obj" class="m-img obj" src="assets/img/produit.jpg" alt="">
      <i id="s5light" class="light"></i>
      <div class="drops">{drops}</div>
      <i class="steam s1"></i><i class="steam s2"></i><i class="steam s3"></i>
    </div>
    <span class="tag orange" data-at="47.50" data-in="pop">APRÈS</span>
    <span class="demo">Exemple de rendu</span>
  </div>
  <div id="s5chart" class="chart" data-at="46.60" data-in="rise" data-out="48.30">
    <div class="ch-t">{I("trending-up")}Engagement <em>(illustration)</em></div>
    <div class="ch-r"><span>Photo</span><div class="ch-b"><i id="s5b1"></i></div></div>
    <div class="ch-r"><span>Vidéo</span><div class="ch-b"><i id="s5b2"></i></div></div>
  </div>
</section>''')
    # ===== S6 step 4 (light) 48.27 → 55.05
    sc.append(f'''
<section id="s6" class="clip scene light" data-start="48.27" data-duration="6.78" data-track-index="2">
  {PILL("s6pill", "Étape 4", 48.54, 54.55)}
  <div id="s6num" class="num" data-at="48.92" data-in="elastic" data-out="54.55">4</div>
  {HEAD("s6h", [[("Ajoute", 49.46)]], out=54.55)}
  <div id="s6chips" class="chips" data-out="54.55">
    <span class="chip-s" data-at="50.10" data-in="pop">{I("tag")}Prix</span>
    <span class="chip-s" data-at="51.17" data-in="pop">{I("whatsapp")}WhatsApp</span>
    <span class="chip-s" data-at="52.18" data-in="pop">{I("music")}Musique</span>
  </div>
  <div id="s6phoneW" class="abs phoneW" data-float="8">
    <div id="s6phone" class="phone" data-at="48.70" data-in="rise3d" data-out="54.55">
      <div class="screen">
        <img class="scr" src="assets/img/capcut-2-ui.jpg" alt="">
        <div id="s6prev" class="prev"><img id="s6prevI" src="assets/img/produit.jpg" alt=""></div>
      </div>
      <div class="notch"></div>
    </div>
  </div>
  <div id="s6cc" class="chip cc" data-at="52.74" data-in="slideL" data-out="54.55">{I("scissors")}<span>CapCut</span></div>
  <div id="s6price" class="price" data-at="50.10" data-in="drop" data-out="54.55">{I("tag")}5 000 F</div>
  <div id="s6wa" class="wa" data-at="51.17" data-in="drop" data-out="54.55">{I("whatsapp")}Commander</div>
  <div id="s6mus" class="mus" data-at="52.18" data-in="drop" data-out="54.55">
    <span id="s6note" class="note">{I("music")}</span>
    <span class="wave">{"".join("<i></i>" for _ in range(5))}</span>
  </div>
  <div id="s6ok" class="ready" data-at="53.67" data-in="stamp" data-out="54.55">{I("check")}Prêt à poster</div>
</section>''')
    # ===== S7 bonus + CTA (dark) 54.75 → 67.5
    coins = "".join(f'<i class="coin">F</i>' for _ in range(9))
    bubbles = "".join(
        f'<div id="s7b{i}" class="bub"><span class="b-av" style="background:{c}">{n[0]}</span>'
        f'<span class="b-n">{n}</span><span class="b-t">VIDÉO 🔥</span></div>'
        for i, (n, c) in enumerate([("Aïcha", "#FF7A1A"), ("Moussa", "#9DB4FF"), ("Fati", "#1AA35A"),
                                     ("Ibrahim", "#E5372B"), ("Mariam", "#FFB066")]))
    sc.append(f'''
<section id="s7" class="clip scene" data-start="54.75" data-duration="12.75" data-track-index="1">
  {PILL("s7pill", "Bonus", 55.03, 58.95, extra=(" · Si tu maîtrises ça", 55.57), icon="flame")}
  {HEAD("s7hA", [[("Vends-le", 56.87), ("aux", 57.06)], [("commerçants", 57.25, True)]], out=58.95)}
  <div id="s7curve" class="curve" data-out="58.95">
    <svg viewBox="0 0 860 640" preserveAspectRatio="none">
      <defs><linearGradient id="s7g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7A1A" stop-opacity=".55"/><stop offset="1" stop-color="#FF7A1A" stop-opacity="0"/></linearGradient></defs>
      <g class="grid-l"><line x1="0" y1="160" x2="860" y2="160"/><line x1="0" y1="320" x2="860" y2="320"/><line x1="0" y1="480" x2="860" y2="480"/></g>
      <path id="s7area" d="M90 560 C 250 540, 300 470, 400 430 S 560 330, 640 250 S 760 110, 820 70 L 820 640 L 90 640 Z" fill="url(#s7g)"/>
      <path id="s7line" d="M90 560 C 250 540, 300 470, 400 430 S 560 330, 640 250 S 760 110, 820 70" fill="none" stroke="#FF7A1A" stroke-width="12" stroke-linecap="round"/>
    </svg>
    <div id="s7rev" class="rev">{I("trending-up")}Revenus</div>
    <div class="coins">{coins}</div>
  </div>
  <div id="s7shop" class="shop" data-at="56.87" data-in="elastic" data-out="58.95">{I("store")}</div>
  {HEAD("s7hB", [[("Écris", 59.15), ("VIDÉO", 59.61, True)], [("en", 59.80), ("commentaire", 59.91)]], out=63.30)}
  <div id="s7bubs" class="bubs" data-out="63.30">{bubbles}</div>
  {HEAD("s7hC", [[("Enregistre", 63.52, True)], [("&", 64.84), ("abonne-toi", 65.01, True)]], out=65.55)}
  <div id="s7save" class="cta" data-at="63.52" data-in="elastic" data-out="65.55"><span class="cta-i">{I("bookmark")}</span><span>Enregistre</span></div>
  <div id="s7sub" class="cta sub" data-at="65.01" data-in="elastic" data-out="65.55"><span class="cta-i">{I("plus")}</span><span>Abonne-toi</span></div>
  <div id="s7end" class="end">
    <i id="s7halo" class="halo-end"></i>
    <img id="s7logo" src="assets/img/logo.png" alt="Abdoul Network" data-at="65.60" data-in="logo">
    <div id="s7handle" data-at="65.95" data-in="rise">@abdoulnetwork</div>
  </div>
</section>''')
    return "\n".join(sc)


def particles():
    import random
    r = random.Random(42)
    out = []
    for i in range(22):
        out.append(f'<i class="pt" style="left:{r.uniform(2, 96):.1f}%;top:{r.uniform(4, 96):.1f}%;'
                   f'width:{r.choice([6, 8, 10, 14])}px;height:auto;opacity:{r.uniform(.25, .7):.2f}"></i>')
    return "".join(out)


def audio_tags(typing):
    a = [f'<audio id="vo" src="assets/audio/voix.wav" data-start="0" data-duration="{VO_DUR}" data-track-index="10" data-volume="1"></audio>',
         f'<audio id="bgm" src="assets/audio/music-ducked.wav" data-start="0" data-duration="{DUR}" data-track-index="11" data-volume="1"></audio>',
         f'<audio id="sfx-typing" src="assets/sfx/typing.wav" data-start="{typing[0]}" data-duration="{typing[1]:.2f}" data-track-index="12" data-volume="0.22"></audio>']
    durs = {}
    for name in set(s[1] for s in SFX):
        with wave.open(os.path.join(ROOT, f"assets/sfx/{name}.wav")) as w:
            durs[name] = w.getnframes() / w.getframerate()
    for i, (t, name, vol) in enumerate(SFX):
        a.append(f'<audio id="sfx{i:02d}" src="assets/sfx/{name}.wav" data-start="{t}" '
                 f'data-duration="{durs[name]:.2f}" data-track-index="{20 + i % 6}" data-volume="{vol}"></audio>')
    return "\n    ".join(a)


def main():
    css = open(os.path.join(ROOT, "tools", "style.css")).read()
    js = open(os.path.join(ROOT, "tools", "timeline.js")).read()
    shimmer_js = re.search(r"<script>(.*?)</script>",
                           open(os.path.join(ROOT, "compositions/components/shimmer-sweep.html")).read(), re.S).group(1)
    shimmer_css = re.search(r"<style>(.*?)</style>",
                            open(os.path.join(ROOT, "compositions/components/shimmer-sweep.html")).read(), re.S).group(1)
    grain_css = re.search(r"<style>(.*?)</style>",
                          open(os.path.join(ROOT, "compositions/components/grain-overlay.html")).read(), re.S).group(1)
    KEY_TIMES.clear()
    for O, w, h, fn in (("V", 1080, 1920, "index.html"), ("H", 1920, 1080, "horizontal/index.html")):
        KEY_TIMES.clear()
        b = body(O)
        typing = typing_wav()
        html = f'''<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width={w}, height={h}">
    <!-- GENERATED by tools/build.py: edit tools/build.py, tools/style.css, tools/timeline.js, then rebuild -->
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
{css}
/* registry: shimmer-sweep */
{shimmer_css}
/* registry: grain-overlay */
{grain_css}
    </style>
  </head>
  <body>
  <div id="root" class="{O}" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="{w}" data-height="{h}">
    <div id="bg">
      <div id="bgDark"><i id="halo1" class="halo"></i><i id="halo2" class="halo b"></i><div id="grid"></div><div id="pts">{particles()}</div></div>
      <div id="bgLight"><i id="halo3" class="halo c"></i><i id="halo4" class="halo d"></i></div>
    </div>
    <div id="shake"><div id="cam">
{b}
    </div></div>
    <div id="fx"><i id="slash"></i><i id="slash2"></i><i id="flash"></i></div>
    <div id="sig">
      <div id="sigAv"><img src="assets/img/avatar.jpg" alt=""></div>
      <div id="sigT"><b id="sigN">Abdoul Network</b><span>Communication &amp; Formateur IA</span></div>
    </div>
    <div id="grain-overlay"><div class="grain-texture"></div></div>
    {audio_tags(typing)}
  </div>
  <script>
{shimmer_js}
  </script>
  <script>
const ORIENT = "{O}";
{js}
  </script>
  </body>
</html>
'''
        open(os.path.join(ROOT, fn), "w").write(html)
        print("wrote", fn)


if __name__ == "__main__":
    main()
