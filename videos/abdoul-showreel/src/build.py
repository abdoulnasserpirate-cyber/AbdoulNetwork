#!/usr/bin/env python3
"""Generate the two HyperFrames entry files (9:16 and 16:9) from one source.

    python3 src/build.py          -> index.html (1080x1920) + index-16x9.html (1920x1080)

Every timing below comes from the word-level transcript of the user's own
voice-over (assets/voice/words.json).
"""
import json, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOTAL = 40.0

NAME = "ABDOULNETWORK"
PHONE = "+227 94 66 99 69"
TIKTOK = "@abdoulnetwork"

# ── Captions: (group words with their start time) ─────────────────────────
# times = start of each word in the voice-over (seconds)
CAPS = [
    [("Bon…", 0.0)],
    [("je", .82), ("vais", .98), ("pas", 1.08), ("te", 1.22), ("faire", 1.34)],
    [("un", 1.54), ("long", 1.78), ("discours.", 1.94)],
    [("Regarde", 2.6), ("plutôt.", 2.92)],
    [("Ça,", 3.16), ("c'est", 4.08), ("une", 4.24), ("appli", 4.40)],
    [("de", 4.56), ("livraison.", 4.72)],
    [("Ça,", 5.44), ("pour", 5.80), ("un", 6.16), ("restaurant.", 6.34)],
    [("Ça,", 7.24), ("une", 7.44), ("boutique", 7.68), ("en", 8.02), ("ligne.", 8.12)],
    [("Ça,", 8.72), ("une", 9.0), ("soirée", 9.24)],
    [("en", 9.58), ("boîte", 9.68), ("de", 9.94), ("nuit.", 10.08)],
    [("Et", 10.24), ("ça…", 10.64)],
    [("une", 10.88), ("chaîne", 11.12), ("YouTube", 11.34), ("entière.", 11.74)],
    [("Tout", 12.54), ("ça,", 12.64)],
    [("c'est", 13.24), ("moi", 13.42), ("qui", 13.58), ("l'ai", 13.74), ("fait.", 13.88)],
    [("Les", 14.34), ("textes", 14.52), ("qui", 14.84), ("bougent,", 14.96)],
    [("les", 15.42), ("transitions,", 15.52)],
    [("les", 16.52), ("petits", 16.60), ("sons…", 16.80)],
    [("tout.", 17.56)],
    [("Et", 17.80), ("en", 18.46), ("vrai,", 18.60)],
    [("le", 19.10), ("plus", 19.18), ("dur,", 19.34)],
    [("c'est", 19.58), ("pas", 19.80), ("de", 19.94), ("faire", 20.06), ("la", 20.22), ("vidéo.", 20.38)],
    [("C'est", 20.92), ("que", 21.08), ("les", 21.20), ("gens", 21.32)],
    [("s'arrêtent", 21.50), ("dessus.", 21.88)],
    [("Toi,", 22.64), ("par", 22.82), ("exemple…", 23.02)],
    [("t'es", 23.50), ("encore", 23.62), ("là.", 23.82)],
    [("Donc", 24.34), ("ça", 24.48), ("marche,", 24.68)],
    [("non ?", 24.92)],
    [("Bref.", 26.18)],
    [("T'as", 26.76), ("une", 26.98), ("marque,", 27.14)],
    [("une", 27.68), ("appli,", 27.76)],
    [("un", 28.48), ("événement,", 28.64)],
    [("une", 29.08), ("formation ?", 29.52)],
    [("Et", 30.0), ("tu", 30.52), ("veux", 30.66), ("une", 30.86), ("vidéo", 31.06)],
    [("comme", 31.36), ("ça ?", 31.58)],
    [("Écris-moi", 32.10), ("sur", 32.42), ("WhatsApp.", 32.62)],
    [("Le", 33.34), ("numéro", 33.44), ("est", 33.72), ("juste", 33.96), ("là.", 34.16)],
    [("On", 34.82), ("en", 34.94), ("parle.", 35.02)],
    [("Tranquille.", 35.30)],
]
CAPS_END = 36.4

# ── Per-format layout (x, y, w, h) ─────────────────────────────────────────
L = {
    "V": dict(
        W=1080, H=1920,
        cap_y=1405, cap_fs=50,
        label=(90, 318), title=(90, 352), title_fs=100,
        card=(80, 640, 920, 518), phone=(690, 820, 300, 600),
        sq=(160, 630, 760, 760), side=(660, 1000, 300, 375),
        yt=(80, 640, 920, 518),
        intro=(90, 600), intro_fs=104,
        intro_lines=["JE VAIS PAS", "TE FAIRE UN", "LONG", "DISCOURS."],
        moi_fs=330,
        cards3=[(250, 300, 580, 300), (250, 660, 580, 300), (250, 1020, 580, 300)],
        dur=(90, 290), dur_fs=96, feed_phone=(390, 770, 300, 600),
        feed_phone2=(70, 560, 300, 600), ring=(470, 600, 500, 500), marche=(0, 1150),
        tas=(0, 470), pills=[(60, 700), (550, 700), (60, 860), (550, 860)], pill_w=470,
        rows=(330, 1060), band=(0, 640, 1080, 300), tile=(440, 248),
        chat=(300, 210, 480, 820), num=(0, 1110), num_fs=84,
        end_lines=["ABDOUL", "NETWORK"], end_fs=170, end_y=640,
    ),
    "H": dict(
        W=1920, H=1080,
        cap_y=944, cap_fs=40,
        label=(140, 330), title=(140, 364), title_fs=92,
        card=(840, 220, 960, 540), phone=(1560, 360, 270, 540),
        sq=(1060, 170, 640, 640), side=(1540, 440, 280, 350),
        yt=(840, 220, 960, 540),
        intro=(200, 300), intro_fs=124,
        intro_lines=["JE VAIS PAS", "TE FAIRE UN LONG", "DISCOURS."],
        moi_fs=400,
        cards3=[(180, 250, 480, 480), (720, 250, 480, 480), (1260, 250, 480, 480)],
        dur=(140, 250), dur_fs=96, feed_phone=(1380, 140, 330, 660),
        feed_phone2=(420, 150, 330, 660), ring=(900, 180, 560, 560), marche=(0, 0),
        tas=(0, 220), pills=[(370, 430), (990, 430), (370, 600), (990, 600)], pill_w=560,
        rows=(110, 680), band=(0, 390, 1920, 250), tile=(400, 225),
        chat=(360, 110, 400, 780), num=(900, 330), num_fs=110,
        end_lines=["ABDOULNETWORK"], end_fs=160, end_y=330,
    ),
}


def box(b):
    x, y, w, h = b
    return f"left:{x}px;top:{y}px;width:{w}px;height:{h}px;"


def esc(s):
    return html.escape(s, quote=True)


def build(fmt):
    c = L[fmt]
    V = fmt == "V"
    W, H = c["W"], c["H"]
    imgs = "assets/crops/"

    def title(lines, accent_last=True):
        out = []
        for i, ln in enumerate(lines):
            cls = " o" if (accent_last and i == len(lines) - 1) else ""
            out.append(f'<div class="ln"><span class="{cls.strip()}">{esc(ln)}</span></div>')
        return "".join(out)

    def stack(ids_files, cls="stk"):
        return "".join(
            f'<img id="{i}" class="{cls}" src="{imgs}{f}" alt="">' for i, f in ids_files
        )

    def project(n, sid, label, lines, media):
        return f"""
    <section id="{sid}" class="scene clip" data-start="{{s}}" data-duration="{{d}}" data-track-index="{{tr}}">
      {media}
      <div class="lbl" id="{sid}-lbl"><b>{n:02d}</b> · {esc(label)}</div>
      <div class="ttl" id="{sid}-ttl">{title(lines)}</div>
    </section>"""

    # ── project media blocks ──
    allo_stack = stack([("a1", "allo-02.jpg"), ("a2", "allo-08.jpg"), ("a3", "allo-12.jpg"), ("a4", "allo-07.jpg")])
    allo_media = f"""
      <div class="card" id="s2-card">{allo_stack}<div class="playbar"><i id="s2-prog"></i></div></div>
      <div class="phone" id="s2-phone"><div class="screen app">
        <div class="app-top"><img src="{imgs}allo-multiservices.png" alt=""><div><b>Allô Multiservices</b><small>Maradi · 7j/7</small></div></div>
        <div class="app-h">Où on livre&nbsp;?</div>
        <div class="app-in"><span class="pin"></span><span id="s2-type">Quartier Zaria, Maradi</span></div>
        <div class="app-grid"><div class="tile t1">Colis</div><div class="tile t2">Repas</div><div class="tile t3">Documents</div><div class="tile t4">Courses</div></div>
        <div class="app-map"><svg viewBox="0 0 260 120"><path id="s2-route" d="M20 100 C 80 20, 150 120, 240 24" fill="none" stroke="#F5B21F" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/><circle cx="20" cy="100" r="7" fill="#fff"/><circle cx="240" cy="24" r="9" fill="#F5B21F"/></svg></div>
        <div class="app-btn" id="s2-btn">Commander</div>
      </div></div>"""

    chief_stack = stack([("c1", "chief-04.jpg"), ("c2", "chief-17.jpg"), ("c3", "chief-14.jpg"), ("c4", "chief-19.jpg")])
    chief_media = f"""
      <div class="card" id="s3-card">{chief_stack}<div class="playbar"><i id="s3-prog"></i></div></div>
      <div class="card port" id="s3-side"><img class="stk" src="{imgs}savor-09.jpg" alt=""><img id="sv2" class="stk" src="{imgs}savor-02.jpg" alt=""></div>"""

    sub_stack = stack([("b1", "sublime-01.jpg"), ("b2", "sublime-02.jpg"), ("b3", "sublime-06.jpg"), ("b4", "sublime-09.jpg")])
    sub_media = f"""<div class="card" id="s4-card">{sub_stack}<div class="playbar"><i id="s4-prog"></i></div></div>"""

    lost_stack = stack([("l1", "lostalos-01.jpg"), ("l2", "lostalos-05.jpg"), ("l3", "lostalos-03.jpg"), ("l4", "lostalos-09.jpg"), ("l5", "lostalos-16.jpg"), ("l6", "lostalos-23.jpg")])
    lost_media = f"""<div class="card sq" id="s5-card">{lost_stack}<div class="playbar"><i id="s5-prog"></i></div></div>"""

    thumbs = "".join(
        f'<div class="yt-th th{i}"><b>ÉP. {i:02d}</b><span></span><em>{["8:42","12:05","6:31","9:58","15:20","7:14"][i-1]}</em></div>'
        for i in range(1, 7)
    )
    yt_media = f"""
      <div class="yt" id="s6-yt">
        <div class="yt-player" id="s6-player">
          <div class="yt-ep" id="s6-ep1">ÉPISODE <b>01</b></div><div class="yt-ep e2" id="s6-ep2">ÉPISODE <b>02</b></div><div class="yt-ep e3" id="s6-ep3">ÉPISODE <b>03</b></div>
          <div class="yt-play"></div>
          <div class="yt-bar"><i id="s6-prog"></i></div>
        </div>
        <div class="yt-grid" id="s6-grid">{thumbs}</div>
      </div>"""

    projects = [
        project(1, "s2", "APPLI + VIDÉO · ALLÔ MULTISERVICES", ["APPLI DE", "LIVRAISON"], allo_media),
        project(2, "s3", "PUB · CHIEF-CHIEF", ["UN", "RESTAURANT"], chief_media),
        project(3, "s4", "E-COMMERCE · SUBLIME BOOTY", ["BOUTIQUE", "EN LIGNE"], sub_media),
        project(4, "s5", "ÉVÉNEMENT · LOSTALOS NIGHT CLUB", ["SOIRÉE", "EN BOÎTE"], lost_media),
        project(5, "s6", "CONTENU · YOUTUBE", ["CHAÎNE", "YOUTUBE"], yt_media),
    ]
    times = [(3.10, 2.35, 1), (5.40, 1.85, 0), (7.20, 1.55, 1), (8.70, 1.60, 0), (10.24, 2.32, 1)]
    projects = [p.replace("{s}", f"{s:.2f}").replace("{d}", f"{d:.2f}").replace("{tr}", str(tr)) for p, (s, d, tr) in zip(projects, times)]

    # wall tiles for "MOI." and "COMME ÇA ?"
    wall_files = ["chief-04", "allo-02", "sublime-01", "lostalos-01", "chief-17", "allo-08", "sublime-06",
                  "chief-14", "lostalos-05", "allo-12", "sublime-02", "chief-19", "lostalos-09", "allo-07",
                  "chief-11", "sublime-09", "lostalos-23", "chief-06", "allo-11", "lostalos-16", "chief-09",
                  "sublime-04", "chief-15", "lostalos-12"]
    wall = "".join(f'<div class="wt"><img src="{imgs}{f}.jpg" alt=""></div>' for f in wall_files)
    row1 = ["chief-04", "allo-02", "sublime-01", "chief-17", "lostalos-01", "allo-08", "chief-14", "sublime-06"]
    row2 = ["allo-12", "chief-19", "sublime-09", "lostalos-05", "chief-11", "allo-07", "sublime-02", "chief-09"]
    r1 = "".join(f'<div class="rt"><img src="{imgs}{f}.jpg" alt=""></div>' for f in row1 * 2)
    r2 = "".join(f'<div class="rt"><img src="{imgs}{f}.jpg" alt=""></div>' for f in row2 * 2)
    feed_files = ["savor-01", "lostalos-09", "savor-08", "lostalos-16", "savor-04", "lostalos-23", "savor-06"]
    feed = "".join(f'<img src="{imgs}{f}.jpg" alt="">' for f in feed_files)

    intro_lines = "".join(
        f'<div class="ln"><span id="i{n}" class="{"o" if ln.startswith("DISCOURS") else ""}">{esc(ln)}{"<i id=s1-strike></i>" if ln.startswith("DISCOURS") else ""}</span></div>'
        for n, ln in enumerate(c["intro_lines"])
    )
    bars = "".join(f'<i style="--k:{(i*37)%11}"></i>' for i in range(22))
    pills_txt = ["UNE MARQUE", "UNE APPLI", "UN ÉVÉNEMENT", "UNE FORMATION"]
    pills = "".join(
        f'<div class="pill" id="p{i}" style="left:{x}px;top:{y}px;width:{c["pill_w"]}px"><span>{t}</span><i class="ck"></i></div>'
        for i, ((x, y), t) in enumerate(zip(c["pills"], pills_txt))
    )
    caps = []
    for gi, g in enumerate(CAPS):
        ws = "".join(f'<span id="w{gi}_{wi}" class="w">{esc(w)}</span> ' for wi, (w, t) in enumerate(g))
        caps.append(f'<div class="cg" id="cg{gi}">{ws.strip()}</div>')
    caps_html = "".join(caps)

    end_lines = "".join(
        f'<div class="ln"><span>{"".join(f"<i>{ch}</i>" for ch in ln)}</span></div>' for ln in c["end_lines"]
    )

    # ── CSS ──
    cx, cy, cw, ch = c["card"]
    css = f"""
@font-face{{font-family:'Archivo Black';src:url('assets/fonts/ArchivoBlack.woff2') format('woff2');font-display:block}}
@font-face{{font-family:'Archivo';font-weight:800;src:url('assets/fonts/Archivo-800.woff2') format('woff2');font-display:block}}
@font-face{{font-family:'Inter';font-weight:400 800;src:url('assets/fonts/Inter-normal-400_800.woff2') format('woff2');font-display:block}}
@font-face{{font-family:'JetBrains Mono';font-weight:500;src:url('assets/fonts/JetBrainsMono-normal-500.woff2') format('woff2');font-display:block}}
@font-face{{font-family:'JetBrains Mono';font-weight:700;src:url('assets/fonts/JetBrainsMono-normal-700.woff2') format('woff2');font-display:block}}
:root{{--navy:#081230;--navy2:#0F1D47;--blue:#2F6BFF;--o:#FF6B1A;--beige:#F3EADA;--ink:#0A1024;--mute:#7C8AB3}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:var(--navy)}}
#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden;background:var(--navy);font-family:Inter,sans-serif;color:#fff}}
#bg{{position:absolute;inset:0;background:
  radial-gradient({W*0.7:.0f}px {H*0.5:.0f}px at 70% 20%,rgba(47,107,255,.22),transparent 70%),
  radial-gradient({W*0.6:.0f}px {H*0.4:.0f}px at 10% 95%,rgba(255,107,26,.10),transparent 70%),
  linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/60px 60px,
  linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/60px 60px,var(--navy)}}
.scene{{position:absolute;inset:0;overflow:hidden}}
.ln{{overflow:hidden;line-height:1.02;padding-bottom:.04em}}
.ln span{{display:inline-block}}
.o{{color:var(--o)}}
.hud{{position:absolute;font:500 {18 if V else 16}px 'JetBrains Mono',monospace;letter-spacing:.14em;color:rgba(255,255,255,.55);white-space:nowrap}}
#hud-l{{left:{70 if V else 64}px;top:{70 if V else 52}px}}
#hud-l b{{color:var(--o)}}
#hud-r{{right:{70 if V else 64}px;top:{70 if V else 52}px}}
.cn{{position:absolute;width:34px;height:34px;border-color:rgba(255,255,255,.35);border-style:solid}}
#cn1{{left:36px;top:36px;border-width:2px 0 0 2px}}#cn2{{right:36px;top:36px;border-width:2px 2px 0 0}}
#cn3{{left:36px;bottom:36px;border-width:0 0 2px 2px}}#cn4{{right:36px;bottom:36px;border-width:0 2px 2px 0}}
#caps{{position:absolute;left:0;right:0;top:{c['cap_y']}px;height:{c['cap_fs']*2}px;--past:#fff;--up:rgba(255,255,255,.42);--on:#FF6B1A}}
.cg{{position:absolute;left:0;right:0;top:0;text-align:center;font:700 {c['cap_fs']}px Inter,sans-serif;letter-spacing:-.01em;opacity:0;white-space:nowrap;text-shadow:0 2px 18px rgba(0,0,0,.45)}}
.w{{color:var(--up)}}.w.on{{color:var(--on)}}.w.done{{color:var(--past)}}
/* intro */
#s1-dot{{position:absolute;left:{W/2-14:.0f}px;top:{H/2-14:.0f}px;width:28px;height:28px;border-radius:50%;background:var(--o)}}
#s1-txt{{position:absolute;left:{c['intro'][0]}px;top:{c['intro'][1]}px;font:{c['intro_fs']}px 'Archivo Black',sans-serif;text-transform:uppercase}}
#s1-txt span{{position:relative}}
#s1-strike{{position:absolute;left:-8px;right:-8px;top:46%;height:{max(10, c['intro_fs']//9)}px;background:#fff;transform-origin:0 50%;border-radius:4px;transform:scaleX(0)}}
#s1-block{{position:absolute;left:{W/2-160:.0f}px;top:{H/2-90:.0f}px;width:320px;height:180px;border-radius:26px;background:var(--o)}}
/* project scenes */
.lbl{{position:absolute;left:{c['label'][0]}px;top:{c['label'][1]}px;font:700 {20 if V else 18}px 'JetBrains Mono',monospace;letter-spacing:.12em;color:rgba(255,255,255,.7);white-space:nowrap}}
.lbl b{{color:var(--o)}}
.ttl{{position:absolute;left:{c['title'][0]}px;top:{c['title'][1]}px;font:{c['title_fs']}px 'Archivo Black',sans-serif;text-shadow:0 6px 40px rgba(8,18,48,.6)}}
.card{{position:absolute;{box(c['card'])}border-radius:{26 if V else 22}px;overflow:hidden;background:#000;box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 0 2px rgba(255,255,255,.08)}}
.card.sq{{{box(c['sq'])}}}
.card.port{{{box(c['side'])}}}
.stk{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0}}
.stk:first-child{{opacity:1}}
.playbar{{position:absolute;left:24px;right:24px;bottom:18px;height:6px;border-radius:3px;background:rgba(255,255,255,.3)}}
.playbar i{{position:absolute;left:0;top:0;bottom:0;width:100%;border-radius:3px;background:var(--o);transform-origin:0 50%;transform:scaleX(0)}}
.phone{{position:absolute;{box(c['phone'])}border-radius:44px;background:#03060F;padding:11px;box-shadow:0 40px 80px rgba(0,0,0,.6),0 0 0 2px #2A3560}}
.screen{{position:relative;width:100%;height:100%;border-radius:34px;overflow:hidden}}
.app{{background:#0B1E5B;padding:22px 16px;font-family:Inter,sans-serif}}
.app-top{{display:flex;gap:10px;align-items:center;margin-top:14px}}
.app-top img{{width:44px;height:44px;border-radius:10px}}
.app-top b{{display:block;font-size:15px}}.app-top small{{font-size:11px;color:#F5B21F}}
.app-h{{margin-top:20px;font:800 24px Inter,sans-serif}}
.app-in{{margin-top:10px;background:#fff;color:#0B1E5B;border-radius:12px;padding:11px 12px;font-size:12px;font-weight:600;display:flex;gap:8px;align-items:center;white-space:nowrap;overflow:hidden}}
.pin{{width:10px;height:10px;border-radius:50%;background:#F5B21F;flex:none}}
.app-grid{{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px}}
.tile{{background:#14307F;border-radius:12px;padding:{16 if V else 12}px 10px;font-size:13px;font-weight:700}}
.tile.t2{{background:#F5B21F;color:#0B1E5B}}
.app-map{{margin-top:12px;border-radius:12px;background:#132B70;height:{110 if V else 96}px;overflow:hidden}}
.app-map svg{{width:100%;height:100%}}
.app-btn{{position:absolute;left:16px;right:16px;bottom:26px;background:#F5B21F;color:#0B1E5B;text-align:center;border-radius:14px;padding:14px;font-weight:800;font-size:15px}}
/* youtube */
.yt{{position:absolute;{box(c['yt'])}}}
.yt-player{{position:absolute;inset:0;opacity:0;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#13245E,#081230);box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 0 2px rgba(255,255,255,.08)}}
.yt-ep{{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:.3em;font:{c['card'][2]*0.085:.0f}px 'Archivo Black',sans-serif;background:linear-gradient(135deg,#2F6BFF,#0F1D47)}}
.yt-ep b{{color:var(--o)}}.yt-ep.e2{{background:linear-gradient(135deg,#FF6B1A,#7A2A06)}}.yt-ep.e2 b{{color:#081230}}.yt-ep.e3{{background:linear-gradient(135deg,#0F1D47,#2F6BFF)}}
.yt-play{{position:absolute;left:50%;top:50%;width:110px;height:76px;margin:-38px 0 0 -55px;border-radius:20px;background:rgba(8,18,48,.75)}}
.yt-play:after{{content:'';position:absolute;left:44px;top:22px;border-left:30px solid #fff;border-top:16px solid transparent;border-bottom:16px solid transparent}}
.yt-bar{{position:absolute;left:24px;right:24px;bottom:20px;height:6px;background:rgba(255,255,255,.3);border-radius:3px}}
.yt-bar i{{position:absolute;inset:0;background:var(--o);border-radius:3px;transform-origin:0 50%;transform:scaleX(0)}}
.yt-grid{{position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:14px}}
.yt-th{{position:relative;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#2F6BFF,#0F1D47);display:flex;align-items:center;justify-content:center;font:{c['card'][2]*0.04:.0f}px 'Archivo Black',sans-serif;opacity:0}}
.yt-th.th2,.yt-th.th6{{background:linear-gradient(135deg,#FF6B1A,#7A2A06)}}.yt-th.th4{{background:linear-gradient(135deg,#F3EADA,#C9B99B);color:#081230}}
.yt-th em{{position:absolute;right:8px;bottom:8px;font:700 13px 'JetBrains Mono',monospace;font-style:normal;background:rgba(0,0,0,.7);color:#fff;padding:2px 6px;border-radius:5px}}
/* wall MOI */
#wall{{position:absolute;left:50%;top:50%;width:{W*1.6:.0f}px;margin-left:{-W*0.8:.0f}px;display:grid;grid-template-columns:repeat({4 if V else 6},1fr);gap:18px}}
.wt{{aspect-ratio:16/10;border-radius:14px;overflow:hidden}}
.wt img{{width:100%;height:100%;object-fit:cover}}
#wall-dim{{position:absolute;inset:0;background:rgba(8,18,48,.55)}}
#moi{{position:absolute;left:0;right:0;top:50%;margin-top:{-c['moi_fs']*0.6:.0f}px;text-align:center;font:{c['moi_fs']}px 'Archivo Black',sans-serif;color:var(--o);line-height:1.2;text-shadow:0 20px 80px rgba(0,0,0,.5)}}
#moi-dot{{position:absolute;left:{W/2-60:.0f}px;top:{H/2-60:.0f}px;width:120px;height:120px;border-radius:50%;background:var(--o)}}
/* beige skills */
#s8{{background:var(--beige);color:var(--ink)}}
.sk{{position:absolute}}
.sk-l{{font:700 {20 if V else 18}px 'JetBrains Mono',monospace;letter-spacing:.12em;color:var(--o);margin-bottom:14px;white-space:nowrap}}
.sk-c{{position:relative;width:100%;height:calc(100% - 40px);border-radius:28px;background:var(--navy);overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 30px 60px rgba(8,18,48,.25)}}
#sk-txt{{font:{78 if V else 92}px 'Archivo Black',sans-serif;color:#fff;display:flex}}
#sk-txt i{{font-style:normal;display:inline-block}}#sk-txt i.x{{color:var(--o)}}
#sk-circ{{position:absolute;width:140px;height:140px;border-radius:50%;background:var(--o)}}
#sk-sq{{position:absolute;width:100px;height:100px;border-radius:22px;background:var(--blue)}}
#sk-bars{{display:flex;gap:7px;align-items:center;height:60%}}
#sk-bars i{{display:block;width:10px;height:100%;border-radius:5px;background:var(--o);transform-origin:50% 50%}}
.sk-ok{{position:absolute;right:-14px;top:26px;width:58px;height:58px;border-radius:50%;background:var(--o);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(255,107,26,.4)}}
.sk-ok:after{{content:'';width:22px;height:12px;border-left:6px solid #fff;border-bottom:6px solid #fff;transform:translateY(-3px) rotate(-45deg)}}
/* iris */
#iris{{position:absolute;left:{W/2-60:.0f}px;top:{H/2-60:.0f}px;width:120px;height:120px;border-radius:50%;background:var(--o)}}
/* le plus dur */
#dur{{position:absolute;left:{c['dur'][0]}px;top:{c['dur'][1]}px;font:{c['dur_fs']}px 'Archivo Black',sans-serif}}
#dur .g{{color:rgba(255,255,255,.42);font-size:.8em;position:relative}}
#dur-strike{{position:absolute;left:-6px;right:-6px;top:52%;height:10px;border-radius:5px;background:var(--o);transform-origin:0 50%;transform:scaleX(0)}}
#feedph{{position:absolute;{box(c['feed_phone'])}border-radius:44px;background:#03060F;padding:11px;box-shadow:0 40px 80px rgba(0,0,0,.6),0 0 0 2px #2A3560}}
#feed{{position:absolute;left:0;top:0;width:100%}}
#feed img{{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;margin-bottom:6px}}
#ring{{position:absolute;{box(c['ring'])}}}
#ring svg{{position:absolute;inset:0;width:100%;height:100%}}
#ring-l{{position:absolute;left:0;right:0;top:-{50 if V else 54}px;text-align:center;font:700 {20 if V else 22}px 'JetBrains Mono',monospace;letter-spacing:.16em;color:rgba(255,255,255,.7)}}
#ring-t{{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:{c['ring'][2]*0.24:.0f}px 'Archivo Black',sans-serif}}
#check{{position:absolute;left:{c['ring'][0]+c['ring'][2]*0.12:.0f}px;top:{c['ring'][1]+c['ring'][3]*0.12:.0f}px;width:{c['ring'][2]*0.76:.0f}px;height:{c['ring'][3]*0.76:.0f}px;border-radius:50%;background:var(--o)}}
#check svg{{width:100%;height:100%}}
#marche{{position:absolute;{"left:0;right:0;top:%dpx;text-align:center" % c['marche'][1] if V else "left:%dpx;top:%dpx;width:%dpx;text-align:center" % (c['ring'][0]-100, c['ring'][1]+c['ring'][3]+30, c['ring'][2]+200)};font:{110 if V else 104}px 'Archivo Black',sans-serif}}
#non{{position:absolute;{"left:0;right:0;top:%dpx" % (c['marche'][1]+140) if V else "left:%dpx;width:%dpx;top:%dpx" % (c['ring'][0]-100, c['ring'][2]+200, c['ring'][1]+c['ring'][3]+150)};text-align:center;font:700 26px 'JetBrains Mono',monospace;letter-spacing:.2em;color:rgba(255,255,255,.6)}}
/* T'AS */
#bref{{position:absolute;left:0;right:0;top:50%;margin-top:-80px;text-align:center;font:150px 'Archivo Black',sans-serif;color:var(--o)}}
#tas{{position:absolute;left:0;right:0;top:{c['tas'][1]}px;text-align:center;font:{130 if V else 140}px 'Archivo Black',sans-serif}}
.pill{{position:absolute;height:{120 if V else 130}px;border-radius:70px;border:3px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:space-between;padding:0 18px 0 34px;font:{31 if V else 40}px 'Archivo Black';white-space:nowrap,sans-serif;color:rgba(255,255,255,.5);overflow:hidden}}
.pill .ck{{position:relative;width:{70 if V else 80}px;height:{70 if V else 80}px;border-radius:50%;background:#fff;flex:none;transform:scale(0)}}
.pill .ck:after{{content:'';position:absolute;left:50%;top:50%;width:26px;height:13px;margin:-10px 0 0 -13px;border-left:7px solid var(--o);border-bottom:7px solid var(--o);transform:rotate(-45deg)}}
/* comme ça */
.row{{position:absolute;left:0;display:flex;gap:18px;white-space:nowrap}}
.rt{{flex:none;width:{c['tile'][0]}px;height:{c['tile'][1]}px;border-radius:16px;overflow:hidden}}
.rt img{{width:100%;height:100%;object-fit:cover}}
#row1{{top:{c['rows'][0]}px}}#row2{{top:{c['rows'][1]}px}}
#band{{position:absolute;{box(c['band'])}background:var(--o);display:flex;align-items:center;justify-content:center;box-shadow:0 30px 80px rgba(0,0,0,.5)}}
#band span{{position:absolute;font:{150 if V else 170}px 'Archivo Black',sans-serif;color:var(--navy);white-space:nowrap}}
/* chat + number */
#chat{{position:absolute;{box(c['chat'])}border-radius:50px;background:#03060F;padding:12px;box-shadow:0 40px 80px rgba(0,0,0,.6),0 0 0 2px #2A3560}}
.cs{{position:relative;width:100%;height:100%;border-radius:38px;overflow:hidden;background:#0B142E}}
.ch-top{{display:flex;gap:12px;align-items:center;padding:44px 22px 18px;background:#101C40}}
.ch-av{{width:52px;height:52px;border-radius:50%;background:var(--o);display:flex;align-items:center;justify-content:center;font:24px 'Archivo Black',sans-serif;color:var(--navy)}}
.ch-top b{{display:block;font:800 20px Inter,sans-serif}}.ch-top small{{font-size:14px;color:#3DDC84}}
.bub{{position:absolute;max-width:76%;padding:16px 18px;border-radius:20px;font:600 {21 if V else 20}px/1.3 Inter,sans-serif}}
#bub1{{right:18px;top:{300 if V else 280}px;background:var(--o);color:#fff;border-bottom-right-radius:6px}}
#bub2{{left:18px;top:{430 if V else 410}px;background:#1C2A57;color:#fff;border-bottom-left-radius:6px}}
.ch-in{{position:absolute;left:16px;right:16px;bottom:22px;height:58px;border-radius:30px;background:#1A2550;display:flex;align-items:center;padding:0 22px;font:500 18px Inter,sans-serif;color:rgba(255,255,255,.75)}}
.ch-in i{{position:absolute;right:6px;top:6px;width:46px;height:46px;border-radius:50%;background:var(--o)}}
#num{{position:absolute;{"left:0;right:0;top:%dpx;text-align:center" % c['num'][1] if V else "left:%dpx;top:%dpx" % c['num']}}}
#num small{{display:block;font:700 22px 'JetBrains Mono',monospace;letter-spacing:.2em;color:#3DDC84;margin-bottom:10px}}
#num div{{font:{c['num_fs']}px 'Archivo Black',sans-serif;line-height:1.05;white-space:nowrap}}
#num-u{{height:10px;{'width:70%;margin-left:15%;' if V else ''}background:var(--o);border-radius:5px;margin-top:16px;transform-origin:0 50%}}
#arrow{{position:absolute}}
/* end card */
#s15{{background:var(--o)}}
#endname{{position:absolute;left:0;right:0;top:{c['end_y']}px;text-align:center;font:{c['end_fs']}px 'Archivo Black',sans-serif;color:var(--navy);letter-spacing:-.02em}}
#endname i{{font-style:normal;display:inline-block}}
#endpill{{position:absolute;left:50%;top:{c['end_y'] + c['end_fs']*1.08*len(c['end_lines']) + 60:.0f}px;transform:translateX(-50%);background:var(--navy);border-radius:60px;padding:22px 40px;display:flex;gap:22px;align-items:center;white-space:nowrap}}
#endpill small{{font:700 18px 'JetBrains Mono',monospace;letter-spacing:.2em;color:var(--o)}}
#endpill b{{font:{54 if V else 50}px 'Archivo Black',sans-serif;color:#fff}}
#endtk{{position:absolute;left:0;right:0;top:{c['end_y'] + c['end_fs']*1.08*len(c['end_lines']) + 210:.0f}px;text-align:center;font:700 {30 if V else 28}px 'JetBrains Mono',monospace;letter-spacing:.12em;color:var(--navy)}}
#endtag{{position:absolute;left:0;right:0;top:{c['end_y']-80}px;text-align:center;font:700 {24 if V else 22}px 'JetBrains Mono',monospace;letter-spacing:.3em;color:rgba(8,18,48,.75)}}
.wipe{{position:absolute;background:var(--o);z-index:40}}
"""

    # ── HTML body ──
    s = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width={W}, height={H}">
<script src="assets/vendor/gsap.min.js"></script>
<style>{css}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:g}" data-width="{W}" data-height="{H}">
  <div id="bg" class="clip" data-start="0" data-duration="{TOTAL:g}" data-track-index="0"></div>

  <section id="s1" class="scene clip" data-start="0" data-duration="3.20" data-track-index="1">
    <div id="s1-dot"></div>
    <div id="s1-txt">{intro_lines}</div>
    <div id="s1-block"></div>
  </section>
  {''.join(projects)}

  <section id="s7" class="scene clip" data-start="12.50" data-duration="1.85" data-track-index="0">
    <div id="wall">{wall}</div><div id="wall-dim"></div>
    <div id="moi">MOI.</div><div id="moi-dot"></div>
  </section>

  <section id="s8" class="scene clip" data-start="14.30" data-duration="3.50" data-track-index="1">
    <div class="sk" id="sk1" style="{box(c['cards3'][0])}"><div class="sk-l">01 — LES TEXTES</div><div class="sk-c"><div id="sk-txt"><i>T</i><i>E</i><i class="x">X</i><i>T</i><i>E</i></div></div><div class="sk-ok" id="ok1"></div></div>
    <div class="sk" id="sk2" style="{box(c['cards3'][1])}"><div class="sk-l">02 — LES TRANSITIONS</div><div class="sk-c"><div id="sk-sq"></div><div id="sk-circ"></div></div><div class="sk-ok" id="ok2"></div></div>
    <div class="sk" id="sk3" style="{box(c['cards3'][2])}"><div class="sk-l">03 — LES PETITS SONS</div><div class="sk-c"><div id="sk-bars">{bars}</div></div><div class="sk-ok" id="ok3"></div></div>
  </section>

  <section id="s9" class="scene clip" data-start="17.70" data-duration="1.30" data-track-index="0">
    <div id="iris"></div>
  </section>

  <section id="s10" class="scene clip" data-start="18.90" data-duration="7.25" data-track-index="1">
    <div id="dur">
      <div class="ln"><span id="d1">LE PLUS DUR ?</span></div>
      <div class="ln"><span id="d2" class="g">FAIRE LA VIDÉO<i id="dur-strike"></i></span></div>
      <div class="ln"><span id="d3" class="o">QU'ON S'ARRÊTE</span></div>
      <div class="ln"><span id="d4" class="o">DESSUS.</span></div>
    </div>
    <div id="feedph"><div class="screen"><div id="feed">{feed}</div></div></div>
    <div id="ring"><div id="ring-l">TU REGARDES DEPUIS</div>
      <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="5"/><circle id="ring-arc" cx="50" cy="50" r="45" fill="none" stroke="#FF6B1A" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" transform="rotate(-90 50 50)"/></svg>
      <div id="ring-t">00:22</div></div>
    <div id="check"><svg viewBox="0 0 100 100"><path id="check-p" d="M28 52 L44 67 L73 36" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg></div>
    <div id="marche">ÇA MARCHE.</div>
    <div id="non">NON ?</div>
  </section>

  <section id="s12" class="scene clip" data-start="26.10" data-duration="4.00" data-track-index="0">
    <div id="bref">BREF.</div>
    <div id="tas">T'AS…</div>
    {pills}
  </section>

  <section id="s13" class="scene clip" data-start="30.00" data-duration="2.15" data-track-index="1">
    <div class="row" id="row1">{r1}</div>
    <div class="row" id="row2">{r2}</div>
    <div id="band"><span id="band1">UNE VIDÉO…</span><span id="band2">COMME ÇA ?</span></div>
  </section>

  <section id="s14" class="scene clip" data-start="32.10" data-duration="4.10" data-track-index="0">
    <div id="chat"><div class="cs">
      <div class="ch-top"><div class="ch-av">A</div><div><b>AbdoulNetwork</b><small>en ligne</small></div></div>
      <div class="bub" id="bub1">Salut Abdoul, j'ai un projet&nbsp;!</div>
      <div class="bub" id="bub2">Avec plaisir, on en parle&nbsp;!</div>
      <div class="ch-in"><span id="ch-typing">Salut Abdoul, j'ai un projet !</span><i></i></div>
    </div></div>
    <div id="num"><small>WHATSAPP</small><div>{"+227<br>" if not V else ""}{PHONE if V else PHONE[5:]}</div><div id="num-u"></div></div>
    {arrow_svg(c, V)}
  </section>

  <section id="s15" class="scene clip" data-start="36.10" data-duration="3.90" data-track-index="1">
    <div id="endtag">MOTION DESIGN · PUBS · RÉSEAUX</div>
    <div id="endname">{end_lines}</div>
    <div id="endpill"><small>WHATSAPP</small><b>{PHONE}</b></div>
    <div id="endtk">TIKTOK {TIKTOK}</div>
  </section>

  <div id="wipes" class="clip" data-start="0" data-duration="{TOTAL:g}" data-track-index="5" style="position:absolute;inset:0;pointer-events:none">
    <div class="wipe" id="wp1"></div><div class="wipe" id="wp2"></div><div class="wipe" id="wp3"></div><div class="wipe" id="wp4"></div><div class="wipe" id="wp5"></div><div class="wipe" id="wp6"></div><div class="wipe" id="wp7"></div><div class="wipe" id="wp8"></div>
  </div>

  <div id="hud" class="clip" data-start="0" data-duration="{TOTAL:g}" data-track-index="6" style="position:absolute;inset:0;pointer-events:none">
    <div class="cn" id="cn1"></div><div class="cn" id="cn2"></div><div class="cn" id="cn3"></div><div class="cn" id="cn4"></div>
    <div class="hud" id="hud-l"><b>●</b> ABDOULNETWORK — SHOWREEL 2026</div>
    <div class="hud" id="hud-r"><span id="tc">00:00</span> / 00:40</div>
  </div>

  <div id="caps" class="clip" data-start="0" data-duration="{CAPS_END}" data-track-index="7">{caps_html}</div>

  <audio id="vo" src="assets/voice/voiceover.wav" data-start="0" data-duration="36.1" data-track-index="10" data-volume="1"></audio>
  <audio id="bed" src="assets/bgm/bed.wav" data-start="0" data-duration="40" data-track-index="11" data-volume="0.35"></audio>
  {sfx_html()}
</div>
<script>
{js(c, V, W, H)}
</script>
</body>
</html>
"""
    return s


def arrow_svg(c, V):
    if V:
        # from number (below) up to phone bottom
        return ('<svg id="arrow" style="left:700px;top:960px;width:200px;height:170px" viewBox="0 0 200 170">'
                '<path id="arrow-p" d="M150 160 C 190 90, 120 40, 40 30" fill="none" stroke="#FF6B1A" stroke-width="8" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>'
                '<path id="arrow-h" d="M62 8 L36 30 L64 50" fill="none" stroke="#FF6B1A" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    return ('<svg id="arrow" style="left:780px;top:560px;width:220px;height:160px" viewBox="0 0 220 160">'
            '<path id="arrow-p" d="M200 30 C 150 140, 90 120, 20 80" fill="none" stroke="#FF6B1A" stroke-width="8" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>'
            '<path id="arrow-h" d="M48 60 L20 80 L50 100" fill="none" stroke="#FF6B1A" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>')


SFX = [  # (file, time, volume)
    ("pop", 0.05, .35), ("whoosh", 2.62, .45), ("whoosh", 3.10, .35), ("whoosh", 5.38, .45),
    ("whoosh", 7.18, .45), ("whoosh", 8.68, .45), ("whoosh", 10.22, .45), ("stamp", 13.42, .7),
    ("pop", 14.52, .45), ("whoosh", 15.52, .4), ("pop", 16.60, .45), ("ding", 17.56, .45),
    ("whoosh", 17.75, .45), ("tick", 20.55, .5), ("stamp", 21.88, .5), ("tick", 23.0, .45),
    ("tick", 24.0, .45), ("ding", 24.40, .5), ("stamp", 26.18, .45), ("pop", 27.14, .45),
    ("pop", 27.76, .45), ("pop", 28.64, .45), ("pop", 29.52, .45), ("whoosh", 29.98, .45),
    ("stamp", 31.36, .6), ("whoosh", 32.08, .4), ("pop", 32.80, .45), ("whoosh", 33.95, .35),
    ("pop", 34.82, .45), ("whoosh", 36.08, .5), ("stamp", 36.70, .55), ("coin", 37.60, .4),
]
SFX_LEN = {"pop": .18, "whoosh": .55, "stamp": .5, "ding": 1.4, "tick": .12, "coin": .9}


def sfx_html():
    return "\n  ".join(
        f'<audio id="sfx{i}" src="assets/sfx/{f}.wav" data-start="{t}" data-duration="{SFX_LEN[f]}" data-track-index="{20+i}" data-volume="{v}"></audio>'
        for i, (f, t, v) in enumerate(SFX)
    )


def js(c, V, W, H):
    caps = json.dumps([[t for (_, t) in g] for g in CAPS])
    return f"""
window.__timelines = window.__timelines || {{}};
var tl = gsap.timeline({{ paused: true }});
var V = {str(V).lower()}, W = {W}, H = {H};
var CAPS = {caps}, CAPS_END = {CAPS_END};

// ── captions (karaoke: upcoming grey · current orange · spoken white) ──
CAPS.forEach(function (g, gi) {{
  var start = g[0], end = (gi + 1 < CAPS.length) ? CAPS[gi + 1][0] : CAPS_END;
  var el = '#cg' + gi;
  tl.set(el, {{ opacity: 1 }}, start);
  tl.fromTo(el, {{ y: 14, scale: .96 }}, {{ y: 0, scale: 1, duration: .16, ease: 'back.out(2)' }}, start);
  tl.set(el, {{ opacity: 0 }}, end);
  g.forEach(function (t, wi) {{
    tl.set('#w' + gi + '_' + wi, {{ attr: {{ class: 'w on' }} }}, t);
    var nt = (wi + 1 < g.length) ? g[wi + 1] : end;
    if (nt - t > .05) tl.set('#w' + gi + '_' + wi, {{ attr: {{ class: 'w done' }} }}, Math.min(nt, t + .45));
  }});
}});
// dark captions on the beige scene
tl.set('#caps', {{ '--past': '#081230', '--up': 'rgba(8,18,48,.4)', textShadow: 'none' }}, 14.30);
tl.set('#caps', {{ '--past': '#ffffff', '--up': 'rgba(255,255,255,.42)' }}, 17.75);
tl.set('#caps', {{ '--past': '#081230', '--up': 'rgba(8,18,48,.4)', '--on': '#ffffff' }}, 17.80);
tl.set('#caps', {{ '--past': '#ffffff', '--up': 'rgba(255,255,255,.42)', '--on': '#FF6B1A' }}, 18.35);

// ── HUD timecode ──
var tc = {{ t: 0 }};
tl.fromTo(tc, {{ t: 0 }}, {{ t: 40, duration: 40, ease: 'none', onUpdate: function () {{
  var s = Math.floor(tc.t); document.getElementById('tc').textContent = '00:' + (s < 10 ? '0' : '') + s;
}} }}, 0);

// ── helpers ──
function titleIn(sel, t) {{ tl.fromTo(sel + ' .ln > span', {{ yPercent: 115 }}, {{ yPercent: 0, duration: .45, stagger: .07, ease: 'power4.out' }}, t); }}
function labelIn(sel, t) {{ tl.fromTo(sel, {{ opacity: 0, x: -24 }}, {{ opacity: 1, x: 0, duration: .3, ease: 'power3.out' }}, t); }}
function cardIn(sel, t, rot) {{ tl.fromTo(sel, {{ opacity: 0, scale: .82, rotation: rot || -4, y: 40 }}, {{ opacity: 1, scale: 1, rotation: 0, y: 0, duration: .5, ease: 'back.out(1.5)' }}, t); }}
function cycle(ids, times) {{ ids.forEach(function (id, i) {{ tl.set(id, {{ opacity: 1 }}, times[i]); tl.fromTo(id, {{ scale: 1.08 }}, {{ scale: 1, duration: .4, ease: 'power2.out' }}, times[i]); }}); }}
function prog(sel, a, b) {{ tl.fromTo(sel, {{ scaleX: 0 }}, {{ scaleX: 1, duration: b - a, ease: 'none' }}, a); }}
// orange bar wipes between projects
function wipe(sel, t, dir) {{
  var horiz = dir === 'x';
  var w = horiz ? W * .55 : W, h = horiz ? H : H * .4;
  tl.set(sel, {{ left: horiz ? -w : 0, top: horiz ? 0 : -h, width: w, height: h, borderRadius: 24 }}, 0);
  if (horiz) tl.fromTo(sel, {{ x: 0 }}, {{ x: W + w, duration: .42, ease: 'power3.inOut' }}, t - .21);
  else tl.fromTo(sel, {{ y: 0 }}, {{ y: H + h, duration: .42, ease: 'power3.inOut' }}, t - .21);
}}

// ── S1 intro 0–3.2 ──
tl.fromTo('#s1-dot', {{ scale: 0 }}, {{ scale: 1, duration: .35, ease: 'back.out(3)' }}, .05);
tl.to('#s1-dot', {{ y: -26, duration: .3, ease: 'power2.out', yoyo: true, repeat: 1 }}, .4);
tl.to('#s1-dot', {{ scale: 0, duration: .2 }}, .78);
var introT = [.82, 1.34, 1.78, 1.94];
for (var i = 0; i < {len(c['intro_lines'])}; i++) {{
  var t = introT[Math.min(i, 3)];
  if ({len(c['intro_lines'])} === 3) t = [.82, 1.30, 1.94][i];
  tl.fromTo('#i' + i, {{ yPercent: 115, filter: 'blur(6px)' }}, {{ yPercent: 0, filter: 'blur(0px)', duration: .35, ease: 'power4.out' }}, t);
}}
tl.fromTo('#s1-strike', {{ scaleX: 0 }}, {{ scaleX: 1, duration: .3, ease: 'power3.out' }}, 2.30);
tl.to('#s1-txt', {{ opacity: 0, x: -60, filter: 'blur(10px)', duration: .3, ease: 'power2.in' }}, 2.62);
tl.fromTo('#s1-block', {{ scale: 0, borderRadius: 26 }}, {{ scale: 1, duration: .3, ease: 'back.out(2)' }}, 2.62);
tl.to('#s1-block', {{ scaleX: W / 320 * 1.05, scaleY: H / 180 * 1.05, borderRadius: 0, duration: .28, ease: 'power3.in' }}, 2.90);

// ── S2 Allô 3.10–5.45 ──
cardIn('#s2-card', 3.16, -5);
tl.fromTo('#s2-phone', {{ opacity: 0, y: 160, rotation: 8 }}, {{ opacity: 1, y: 0, rotation: 3, duration: .55, ease: 'back.out(1.4)' }}, 3.40);
labelIn('#s2-lbl', 3.30); titleIn('#s2-ttl', 3.36);
cycle(['#a2', '#a3', '#a4'], [3.85, 4.40, 4.90]);
prog('#s2-prog', 3.2, 5.45);
tl.fromTo('#s2-route', {{ attr: {{ 'stroke-dashoffset': 1 }} }}, {{ attr: {{ 'stroke-dashoffset': 0 }}, duration: 1, ease: 'power2.inOut' }}, 3.9);
tl.fromTo('#s2-btn', {{ scale: 1 }}, {{ scale: .92, duration: .1, yoyo: true, repeat: 1 }}, 4.95);
wipe('#wp1', 5.40, 'y');

// ── S3 restaurant 5.40–7.25 ──
cardIn('#s3-card', 5.42, 4);
tl.fromTo('#s3-side', {{ opacity: 0, x: 120, rotation: 10 }}, {{ opacity: 1, x: 0, rotation: 4, duration: .5, ease: 'back.out(1.5)' }}, 5.95);
labelIn('#s3-lbl', 5.50); titleIn('#s3-ttl', 5.55);
cycle(['#c2', '#c3', '#c4'], [5.95, 6.40, 6.85]);
tl.set('#sv2', {{ opacity: 1 }}, 6.6);
prog('#s3-prog', 5.45, 7.25);
wipe('#wp2', 7.20, 'x');

// ── S4 boutique 7.20–8.75 ──
cardIn('#s4-card', 7.22, -4);
labelIn('#s4-lbl', 7.30); titleIn('#s4-ttl', 7.34);
cycle(['#b2', '#b3', '#b4'], [7.62, 8.0, 8.38]);
prog('#s4-prog', 7.25, 8.75);
wipe('#wp3', 8.70, 'y');

// ── S5 soirée 8.70–10.30 ──
cardIn('#s5-card', 8.72, 5);
labelIn('#s5-lbl', 8.78); titleIn('#s5-ttl', 8.82);
cycle(['#l2', '#l3', '#l4', '#l5', '#l6'], [9.0, 9.25, 9.50, 9.75, 10.0]);
prog('#s5-prog', 8.75, 10.3);
wipe('#wp4', 10.24, 'x');

// ── S6 YouTube 10.24–12.56 ──
cardIn('#s6-player', 10.26, -3);
labelIn('#s6-lbl', 10.40); titleIn('#s6-ttl', 10.95);
tl.set('#s6-ep2', {{ opacity: 0 }}, 0); tl.set('#s6-ep3', {{ opacity: 0 }}, 0);
tl.set('#s6-ep2', {{ opacity: 1 }}, 10.88); tl.set('#s6-ep3', {{ opacity: 1 }}, 11.18);
prog('#s6-prog', 10.3, 11.7);
tl.to('#s6-player', {{ scale: .32, xPercent: -34, yPercent: -25, borderRadius: 40, duration: .45, ease: 'power3.inOut' }}, 11.62);
tl.to('#s6-player', {{ opacity: 0, duration: .1 }}, 12.0);
tl.fromTo('#s6-grid .yt-th', {{ opacity: 0, scale: .6 }}, {{ opacity: 1, scale: 1, duration: .35, stagger: .05, ease: 'back.out(1.8)' }}, 11.80);

// ── S7 MOI 12.50–14.35 ──
tl.fromTo('#wall', {{ yPercent: -50, rotation: -8, scale: 1.25, opacity: 0 }}, {{ yPercent: -50, rotation: -8, scale: 1, opacity: 1, duration: .5, ease: 'power3.out' }}, 12.50);
tl.to('#wall', {{ x: -120, duration: 1.8, ease: 'none' }}, 12.5);
tl.fromTo('#moi', {{ scale: 2.2, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: .28, ease: 'power4.out' }}, 13.40);
tl.to('#moi', {{ scale: .08, opacity: 0, duration: .3, ease: 'power3.in' }}, 14.0);
tl.fromTo('#moi-dot', {{ scale: 0 }}, {{ scale: 1, duration: .25, ease: 'back.out(2)' }}, 14.05);
tl.to('#wall, #wall-dim', {{ opacity: 0, duration: .25 }}, 14.05);

// ── S8 textes / transitions / sons 14.30–17.80 ──
tl.fromTo('#s8', {{ clipPath: 'circle(0% at 50% 50%)' }}, {{ clipPath: 'circle(150% at 50% 50%)', duration: .4, ease: 'power3.inOut' }}, 14.30);
tl.fromTo('#sk1', {{ opacity: 0, y: 80 }}, {{ opacity: 1, y: 0, duration: .45, ease: 'back.out(1.6)' }}, 14.45);
tl.fromTo('#sk-txt i', {{ yPercent: 120, rotation: 12 }}, {{ yPercent: 0, rotation: 0, duration: .4, stagger: .06, ease: 'back.out(2.4)' }}, 14.60);
tl.to('#sk-txt i', {{ yPercent: -18, duration: .18, stagger: .05, yoyo: true, repeat: 1, ease: 'power2.out' }}, 15.20);
tl.fromTo('#sk2', {{ opacity: 0, y: 80 }}, {{ opacity: 1, y: 0, duration: .45, ease: 'back.out(1.6)' }}, 15.45);
tl.fromTo('#sk-circ', {{ scale: 0 }}, {{ scale: 6, duration: .7, ease: 'power3.inOut' }}, 15.60);
tl.fromTo('#sk-sq', {{ rotation: 0, scale: 0 }}, {{ rotation: 180, scale: 1, duration: .6, ease: 'back.out(1.6)' }}, 16.10);
tl.fromTo('#sk3', {{ opacity: 0, y: 80 }}, {{ opacity: 1, y: 0, duration: .45, ease: 'back.out(1.6)' }}, 16.50);
tl.fromTo('#sk-bars i', {{ scaleY: .12 }}, {{ scaleY: function (i) {{ return [.4, .9, .6, 1, .3, .7, .95, .5, .8, .35, .65][i % 11]; }}, duration: .18, stagger: {{ each: .02, from: 'center' }}, yoyo: true, repeat: 5, ease: 'sine.inOut' }}, 16.6);
tl.fromTo('.sk-ok', {{ scale: 0 }}, {{ scale: 1, duration: .3, stagger: .06, ease: 'back.out(3)' }}, 17.56);

// ── S9 iris 17.70–19.0 ──
tl.fromTo('#iris', {{ scale: 0 }}, {{ scale: Math.hypot(W, H) / 120 * 1.05, duration: .55, ease: 'power3.in' }}, 17.72);

// ── S10/S11 le plus dur → t'es encore là → ça marche 18.90–26.15 ──
tl.fromTo('#s10', {{ clipPath: 'circle(0% at 50% 50%)' }}, {{ clipPath: 'circle(150% at 50% 50%)', duration: .5, ease: 'power3.inOut' }}, 18.40);
tl.fromTo('#d1', {{ yPercent: 115 }}, {{ yPercent: 0, duration: .4, ease: 'power4.out' }}, 19.12);
tl.fromTo('#d2', {{ yPercent: 115 }}, {{ yPercent: 0, duration: .4, ease: 'power4.out' }}, 19.95);
tl.fromTo('#dur-strike', {{ scaleX: 0 }}, {{ scaleX: 1, duration: .3, ease: 'power3.out' }}, 20.55);
tl.fromTo('#d3', {{ yPercent: 115 }}, {{ yPercent: 0, duration: .4, ease: 'power4.out' }}, 21.05);
tl.fromTo('#d4', {{ yPercent: 115 }}, {{ yPercent: 0, duration: .4, ease: 'power4.out' }}, 21.70);
tl.fromTo('#feedph', {{ opacity: 0, y: 200 }}, {{ opacity: 1, y: 0, duration: .55, ease: 'power3.out' }}, 19.3);
tl.fromTo('#feed', {{ yPercent: 0 }}, {{ yPercent: -62, duration: 2.45, ease: 'power1.in' }}, 19.4);
tl.to('#feed', {{ yPercent: -66, duration: .5, ease: 'back.out(3)' }}, 21.88);
// → t'es encore là
tl.to('#dur', {{ opacity: 0, x: -80, duration: .35, ease: 'power2.in' }}, 22.50);
var fp2 = {json.dumps(c['feed_phone2'])}, fp = {json.dumps(c['feed_phone'])};
tl.to('#feedph', {{ x: fp2[0] - fp[0], y: fp2[1] - fp[1], duration: .55, ease: 'power3.inOut' }}, 22.55);
tl.fromTo('#ring', {{ opacity: 0, scale: .6 }}, {{ opacity: 1, scale: 1, duration: .45, ease: 'back.out(1.6)' }}, 22.70);
tl.fromTo('#ring-arc', {{ attr: {{ 'stroke-dashoffset': .62 }} }}, {{ attr: {{ 'stroke-dashoffset': .55 }}, duration: 1.7, ease: 'none' }}, 22.6);
var rt = {{ t: 22 }};
tl.fromTo(rt, {{ t: 22.6 }}, {{ t: 24.4, duration: 1.8, ease: 'none', onUpdate: function () {{
  var s = Math.floor(rt.t); document.getElementById('ring-t').textContent = '00:' + s;
}} }}, 22.6);
tl.to('#ring', {{ scale: .4, opacity: 0, duration: .25, ease: 'power3.in' }}, 24.30);
tl.fromTo('#check', {{ scale: 0, rotation: -40 }}, {{ scale: 1, rotation: 0, duration: .45, ease: 'back.out(2.2)' }}, 24.36);
tl.fromTo('#check-p', {{ attr: {{ 'stroke-dashoffset': 1 }} }}, {{ attr: {{ 'stroke-dashoffset': 0 }}, duration: .3, ease: 'power2.out' }}, 24.55);
tl.fromTo('#marche', {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: .35, ease: 'power3.out' }}, 24.62);
tl.fromTo('#non', {{ opacity: 0 }}, {{ opacity: 1, duration: .2 }}, 24.95);
tl.to('#check', {{ rotation: 10, duration: .12, yoyo: true, repeat: 3, ease: 'sine.inOut' }}, 25.30);
tl.to('#feedph, #check, #marche, #non', {{ opacity: 0, scale: 1.08, duration: .3, ease: 'power2.in' }}, 25.85);

// ── S12 bref / t'as… 26.10–30.10 ──
tl.fromTo('#bref', {{ scale: 1.6, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: .2, ease: 'power4.out' }}, 26.16);
tl.to('#bref', {{ opacity: 0, scale: .8, duration: .2 }}, 26.62);
tl.fromTo('#tas', {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: .35, ease: 'power3.out' }}, 26.74);
var pT = [27.14, 27.76, 28.64, 29.52];
pT.forEach(function (t, i) {{
  tl.fromTo('#p' + i, {{ opacity: 0, scale: .7 }}, {{ opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }}, t - .22);
  tl.to('#p' + i, {{ backgroundColor: '#FF6B1A', borderColor: '#FF6B1A', color: '#081230', duration: .15 }}, t);
  tl.fromTo('#p' + i + ' .ck', {{ scale: 0 }}, {{ scale: 1, duration: .3, ease: 'back.out(3)' }}, t + .05);
}});

// ── S13 comme ça ? 30.0–32.15 ──
tl.fromTo('#row1', {{ x: 0 }}, {{ x: -{c['tile'][0]*4}, duration: 2.2, ease: 'none' }}, 30.0);
tl.fromTo('#row2', {{ x: -{c['tile'][0]*4} }}, {{ x: 0, duration: 2.2, ease: 'none' }}, 30.0);
tl.fromTo('#band', {{ scaleY: 0 }}, {{ scaleY: 1, duration: .3, ease: 'power4.out' }}, 30.50);
tl.fromTo('#band1', {{ yPercent: 100, opacity: 0 }}, {{ yPercent: 0, opacity: 1, duration: .3, ease: 'power3.out' }}, 30.80);
tl.to('#band1', {{ yPercent: -100, opacity: 0, duration: .2, ease: 'power3.in' }}, 31.26);
tl.fromTo('#band2', {{ scale: 1.8, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: .25, ease: 'power4.out' }}, 31.36);

// ── S14 WhatsApp 32.10–36.20 ──
tl.fromTo('#chat', {{ opacity: 0, y: 160 }}, {{ opacity: 1, y: 0, duration: .5, ease: 'power3.out' }}, 32.10);
tl.fromTo('#ch-typing', {{ clipPath: 'inset(0 100% 0 0)' }}, {{ clipPath: 'inset(0 0% 0 0)', duration: .45, ease: 'none' }}, 32.30);
tl.set('#ch-typing', {{ opacity: 0 }}, 32.80);
tl.fromTo('#bub1', {{ opacity: 0, y: 40, scale: .8 }}, {{ opacity: 1, y: 0, scale: 1, duration: .35, ease: 'back.out(2)' }}, 32.80);
tl.fromTo('#num', {{ opacity: 0, x: V ? 0 : 60, y: V ? 40 : 0 }}, {{ opacity: 1, x: 0, y: 0, duration: .4, ease: 'power3.out' }}, 33.40);
tl.fromTo('#num-u', {{ scaleX: 0 }}, {{ scaleX: 1, duration: .4, ease: 'power3.out' }}, 33.80);
tl.fromTo('#arrow-p', {{ attr: {{ 'stroke-dashoffset': 1 }} }}, {{ attr: {{ 'stroke-dashoffset': 0 }}, duration: .4, ease: 'power2.out' }}, 33.95);
tl.fromTo('#arrow-h', {{ opacity: 0 }}, {{ opacity: 1, duration: .1 }}, 34.30);
tl.fromTo('#bub2', {{ opacity: 0, y: 40, scale: .8 }}, {{ opacity: 1, y: 0, scale: 1, duration: .35, ease: 'back.out(2)' }}, 34.82);
tl.fromTo('#num div', {{ scale: 1 }}, {{ scale: 1.05, duration: .15, yoyo: true, repeat: 1, ease: 'power2.out' }}, 35.30);

// ── S15 end card 36.10–40 ──
tl.fromTo('#s15', {{ clipPath: 'inset(100% 0% 0% 0%)' }}, {{ clipPath: 'inset(0% 0% 0% 0%)', duration: .45, ease: 'power4.inOut' }}, 36.10);
tl.fromTo('#endname i', {{ yPercent: 110, opacity: 0, filter: 'blur(8px)' }}, {{ yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: .45, stagger: .04, ease: 'power4.out' }}, 36.45);
tl.fromTo('#endtag', {{ opacity: 0, y: -16 }}, {{ opacity: 1, y: 0, duration: .4 }}, 37.1);
tl.fromTo('#endpill', {{ opacity: 0, scale: .7 }}, {{ opacity: 1, scale: 1, duration: .45, ease: 'back.out(2)' }}, 37.30);
tl.fromTo('#endtk', {{ opacity: 0, y: 16 }}, {{ opacity: 1, y: 0, duration: .4 }}, 37.65);
tl.to('#endname', {{ scale: 1.04, duration: 3.2, ease: 'none' }}, 36.8);

tl.to({{}}, {{ duration: {TOTAL} }}, 0);
window.__timelines['main'] = tl;
"""


if __name__ == "__main__":
    for fmt, name in (("V", "index.html"), ("H", "horizontal/index.html")):
        with open(os.path.join(ROOT, name), "w", encoding="utf-8") as f:
            f.write(build(fmt))
        print("wrote", name)
