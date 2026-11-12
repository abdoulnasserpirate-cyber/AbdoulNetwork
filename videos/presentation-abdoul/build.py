#!/usr/bin/env python3
"""Génère les deux compositions HyperFrames (16:9 et 9:16) à partir d'un seul gabarit.

    python3 build.py   ->  index.html (1920x1080) + index-9x16.html (1080x1920)

Toutes les scènes, timings et sons sont partagés ; seule la mise en page change.
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).parent

# ---------------------------------------------------------------- contenu
HANDLE = "@abdoulnetwork"
MARQUE = "Abdoul Network"
WHATSAPP = "WhatsApp : +227 96 66 99 98"
ABONNES_TIKTOK = 3965  # lu sur capture-tiktok.jpg : « 3 965 Followers »

CLIPS = {
    "court1": "assets/clips/court1-stop-aux-pubs.mp4",
    "court2": "assets/clips/court2-competences-ia.mp4",
    "court3": "assets/clips/court3-sublime-booty-9x16.mp4",
    "motion1": "assets/clips/motion1-chief-maradi.mp4",
    "motion2": "assets/clips/motion2-sublime-booty.mp4",
    "perso1": "assets/clips/perso1-chief-plats-9x16.mp4",
    "perso2": "assets/clips/perso2-chief-allo-500f.mp4",
}

# ---------------------------------------------------------------- mises en page
LAYOUTS = {
    "16x9": dict(
        W=1920, H=1080, out="index.html", bg="assets/fond-lumiere-16x9.jpg",
        s1_small=54, s1_big=140, s1_width=1700,
        photo_d=560, photo_x=150, photo_y=260,
        col=dict(left=760, top=0, width=1110, height=1080, justify="center"),
        badge=36, title=94, title_width=1110, roles=40, btn=38,
        sec_title=92, sec_top=105,
        # cartes : (left, top, width, height)
        courts=[(470, 300, 330, 587), (830, 260, 330, 587), (1190, 320, 330, 587)],
        motions=[(170, 340, 760, 428), (990, 340, 760, 428)],
        persos=[(380, 270, 380, 676), (850, 470, 760, 428)],
        cta=68, cta_width=1500,
        card=dict(w=1180, h=490), pill=dict(w=280, h=80),
        handle=58, name=32, stat_n=48, stat_l=24, follow_btn=(270, 70, 28),
        sig_handle=64, sig_wa=32,
    ),
    "9x16": dict(
        W=1080, H=1920, out="../presentation-abdoul-9x16/index.html", bg="assets/fond-lumiere-9x16.jpg",
        s1_small=68, s1_big=150, s1_width=920,
        photo_d=700, photo_x=190, photo_y=250,
        col=dict(left=40, top=1000, width=1000, height=800, justify="flex-start"),
        badge=46, title=112, title_width=1000, roles=40, btn=48,
        sec_title=104, sec_top=190,
        courts=[(130, 340, 370, 658), (580, 370, 370, 658), (355, 1075, 370, 658)],
        motions=[(80, 420, 920, 518), (80, 1020, 920, 518)],
        persos=[(110, 360, 420, 747), (180, 1180, 820, 461)],
        cta=84, cta_width=900,
        card=dict(w=920, h=880), pill=dict(w=300, h=86),
        handle=62, name=36, stat_n=52, stat_l=28, follow_btn=(330, 88, 34),
        sig_handle=72, sig_wa=38,
    ),
}

# ---------------------------------------------------------------- sons (start, fichier, volume)
SFX = []
SFX_DUR = {"tick": 0.12, "pop": 0.18, "slash": 0.35, "whoosh": 0.55, "coin": 0.9, "ding": 1.4}
def sfx(t, name, vol=0.6):
    SFX.append((round(t, 3), name, vol))

# scène 1 — tic machine à écrire
for i in range(8):
    sfx(0.15 + i * 0.09, "tick", 0.35)
sfx(0.92, "slash", 0.55)
sfx(1.05, "pop", 0.6)
sfx(1.80, "whoosh", 0.6)          # flash blanc
# scène 2
sfx(2.12, "pop", 0.6)              # photo
sfx(2.50, "pop", 0.45)             # badge
for i in range(11):
    sfx(2.72 + i * 0.075, "tick", 0.3)   # titre tapé
sfx(3.62, "tick", 0.5)             # séparateurs
sfx(3.85, "pop", 0.45)             # rôles
sfx(4.35, "pop", 0.55)             # bouton
sfx(4.55, "whoosh", 0.35)          # remplissage
sfx(5.42, "slash", 0.6)            # la flèche s'envole
sfx(5.68, "whoosh", 0.6)
# scène 3
for t in (6.15, 6.30, 6.45):
    sfx(t, "pop", 0.5)
sfx(8.82, "whoosh", 0.55)
# scène 4
sfx(9.10, "slash", 0.45)
sfx(9.25, "pop", 0.45)
sfx(9.40, "pop", 0.45)
sfx(11.82, "whoosh", 0.55)
# scène 5
sfx(12.12, "pop", 0.5)
sfx(12.32, "pop", 0.5)
sfx(16.30, "whoosh", 0.7)          # dégradé jaune qui monte
# scène 6
for t in (17.15, 17.35, 17.55, 17.75, 17.95):
    sfx(t, "tick", 0.35)
sfx(18.62, "slash", 0.55)
sfx(19.55, "pop", 0.55)            # pilule noire
# scène 7
sfx(20.02, "whoosh", 0.6)
for i in range(6):
    sfx(20.85 + i * 0.18, "tick", 0.3)   # compteurs
sfx(21.95, "coin", 0.45)
sfx(21.55, "pop", 0.45)            # boutons
sfx(22.90, "tick", 0.8)            # clic
sfx(22.95, "pop", 0.6)
sfx(23.05, "ding", 0.4)
# scène 8
sfx(24.00, "whoosh", 0.55)
sfx(25.00, "pop", 0.6)
sfx(25.25, "pop", 0.4)


# ---------------------------------------------------------------- helpers
def typed(text, cls):
    """Texte découpé en caractères (mise en page figée dès le départ : rien ne bouge pendant la frappe)."""
    out = []
    for wi, word in enumerate(text.split(" ")):
        chars = "".join(f'<span class="ch {cls}">{html.escape(c)}</span>' for c in word)
        out.append(f'<span class="w">{chars}</span>')
    sep = f'<span class="ch {cls}"> </span>'
    return sep.join(out)


def card(id_, box, clip, start, dur, kind):
    l, t, w, h = box
    return (
        f'<div id="{id_}" class="vcard {kind}" style="left:{l}px;top:{t}px;width:{w}px;height:{h}px">'
        f'<video id="{id_}-v" class="clip" src="{clip}" muted playsinline '
        f'data-start="{start}" data-duration="{dur}" data-track-index="{2 + int(id_[-1])}"></video>'
        f'</div>'
    )


HAND_SVG = (
    '<svg viewBox="0 0 64 64" width="100%" height="100%">'
    '<path d="M24 6c3 0 5 2 5 5v18l2-1c0-3 2-5 5-5s5 2 5 5v1c1-1 2-2 4-2 3 0 5 2 5 5v2c1-1 2-1 3-1 3 0 4 2 4 5v9'
    'c0 9-7 16-16 16H34c-6 0-10-3-13-8L10 37c-1-2-1-5 2-6 2-1 5 0 6 2l1 3V11c0-3 2-5 5-5z" '
    'fill="#fff" stroke="#111" stroke-width="3" stroke-linejoin="round"/>'
    '<path d="M29 29v10M37 31v8M45 34v6" stroke="#111" stroke-width="2.5" stroke-linecap="round"/></svg>'
)


def build(key):
    L = LAYOUTS[key]
    W, H = L["W"], L["H"]
    v = key == "9x16"
    col = L["col"]
    pd = L["photo_d"]
    cw, ch = L["card"]["w"], L["card"]["h"]
    pw, ph = L["pill"]["w"], L["pill"]["h"]
    fbw, fbh, fbs = L["follow_btn"]

    audio = [
        '<audio id="bgm" src="assets/bgm/musique.wav" data-start="0" data-duration="27" '
        'data-track-index="20" data-volume="0.55"></audio>'
    ]
    for i, (t, name, vol) in enumerate(SFX):
        audio.append(
            f'<audio id="sfx-{i:02d}" src="assets/sfx/{name}.wav" data-start="{t}" data-duration="{SFX_DUR[name]}" '
            f'data-track-index="{21 + i}" data-volume="{vol}"></audio>'
        )

    title_text = "Salut, moi c'est Abdul"
    if v:
        # 2 lignes en vertical : « Salut, moi » / « c'est Abdul »
        title_html = (
            f'<div class="line">{typed("Salut, moi", "tt")}</div>'
            f'<div class="line">{typed("c’est Abdul", "tt")}</div>'
        )
    else:
        title_html = typed("Salut, moi c’est Abdul", "tt")

    big_html = (
        '<div class="line">Monteur</div><div class="line">vidéo ?</div>' if v else "Monteur vidéo ?"
    )

    # cartes profil : contenu
    if v:
        prof_inner = f"""
        <div id="p-logo" class="p-logo" style="left:{(cw-280)//2}px;top:70px;width:280px;height:280px"><img src="assets/logo.png" alt=""></div>
        <div id="p-text" class="p-text" style="left:0;top:390px;width:{cw}px;align-items:center;text-align:center">
          <div id="p-handle" class="p-handle">{HANDLE}</div>
          <div id="p-name" class="p-name">{MARQUE}</div>
          <div id="p-stats" class="p-stats" style="justify-content:center;gap:56px">
            <div class="st"><div class="n" id="n-proj">0</div><div class="l">Projets</div></div>
            <div class="st"><div class="n" id="n-abo">0</div><div class="l">Abonnés TikTok</div></div>
            <div class="st"><div class="n" id="n-cli">0</div><div class="l">Clients</div></div>
          </div>
          <div id="p-btns" class="p-btns" style="justify-content:center">
        """
    else:
        prof_inner = f"""
        <div id="p-logo" class="p-logo" style="left:60px;top:{(ch-300)//2}px;width:300px;height:300px"><img src="assets/logo.png" alt=""></div>
        <div id="p-text" class="p-text" style="left:410px;top:52px;width:{cw-450}px;align-items:flex-start;text-align:left">
          <div id="p-handle" class="p-handle">{HANDLE}</div>
          <div id="p-name" class="p-name">{MARQUE}</div>
          <div id="p-stats" class="p-stats" style="gap:54px">
            <div class="st"><div class="n" id="n-proj">0</div><div class="l">Projets</div></div>
            <div class="st"><div class="n" id="n-abo">0</div><div class="l">Abonnés TikTok</div></div>
            <div class="st"><div class="n" id="n-cli">0</div><div class="l">Clients</div></div>
          </div>
          <div id="p-btns" class="p-btns">
        """
    prof_inner += f"""
            <div id="b-follow" class="pbtn" style="width:{fbw}px;height:{fbh}px;font-size:{fbs}px">
              <span id="b-follow-a" class="lbl">Suivre</span><span id="b-follow-b" class="lbl">Abonné</span></div>
            <div id="b-msg" class="pbtn" style="width:{fbw}px;height:{fbh}px;font-size:{fbs}px"><span class="lbl">Message</span></div>
          </div>
        </div>"""

    sections = []
    for sid, title, boxes, keys, start, dur, kind in [
        ("s3", "Montages courts", L["courts"], ["court1", "court2", "court3"], 6.0, 3.0, ["vv", "vv", "vv"]),
        ("s4", "Motion Design", L["motions"], ["motion1", "motion2"], 9.0, 3.0, ["hh", "hh"]),
        ("s5", "Projets perso", L["persos"], ["perso1", "perso2"], 12.0, 5.0, ["vv", "hh"]),
    ]:
        cards = "".join(
            card(f"{sid}-c{i+1}", b, CLIPS[k], start, dur, kd)
            for i, (b, k, kd) in enumerate(zip(boxes, keys, kind))
        )
        sections.append(
            f'<div id="{sid}" class="scene sec">'
            f'<div id="{sid}-title" class="sec-title" style="top:{L["sec_top"]}px">{title}</div>{cards}</div>'
        )

    # ------------------------------------------------------------ HTML
    doc = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width={W}, height={H}">
<script src="assets/vendor/gsap.min.js"></script>
<style>
@font-face {{ font-family: "Montserrat"; font-weight: 300; src: url("assets/fonts/montserrat-latin-300-normal.woff2") format("woff2"); }}
@font-face {{ font-family: "Montserrat"; font-weight: 500; src: url("assets/fonts/montserrat-latin-500-normal.woff2") format("woff2"); }}
@font-face {{ font-family: "Montserrat"; font-weight: 600; src: url("assets/fonts/montserrat-latin-600-normal.woff2") format("woff2"); }}
@font-face {{ font-family: "Montserrat"; font-weight: 800; src: url("assets/fonts/montserrat-latin-800-normal.woff2") format("woff2"); }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: #111111; }}
#root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #111111;
  font-family: "Montserrat", sans-serif; font-weight: 500; color: #111111; }}
.scene {{ position: absolute; left: 0; top: 0; width: {W}px; height: {H}px; overflow: hidden; opacity: 0; }}
.grad {{ position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 75% at 52% 50%, #EDE52A 0%, #E8E01E 28%, #B8B11C 62%, #6B6A1A 100%); }}
.blob {{ position: absolute; border-radius: 50%; filter: blur(50px); }}
.w {{ white-space: nowrap; display: inline-block; }}
.ch {{ opacity: 0; }}
.line {{ display: block; }}

/* scène 1 */
#s1-wrap {{ position: absolute; left: {(W - L['s1_width'])//2}px; top: 0; width: {L['s1_width']}px; height: {H}px;
  display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }}
#s1-small {{ font-weight: 500; font-size: {L['s1_small']}px; color: #FFFFFF; letter-spacing: 0.5px; margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(30,30,5,0.55), 0 4px 22px rgba(30,30,5,0.45); }}
#s1-big {{ font-weight: 800; font-size: {L['s1_big']}px; line-height: 1.02; color: #FFFFFF; letter-spacing: -2px;
  text-shadow: 0 3px 6px rgba(30,30,5,0.45), 0 12px 44px rgba(30,30,5,0.45); }}

/* scène 2 */
#s2 {{ background: #FFFFFF; }}
#s2-photo {{ position: absolute; left: {L['photo_x']}px; top: {L['photo_y']}px; width: {pd}px; height: {pd}px;
  border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, #E8E01E 0%, #E8E01E 30%, #6B6A1A 78%, #111111 100%);
  box-shadow: 0 30px 70px rgba(17,17,17,0.18); }}
#s2-photo img {{ position: absolute; left: {int(pd*0.04)}px; top: {int(pd*0.10)}px; width: {int(pd*0.98)}px; height: auto;
  filter: grayscale(1) contrast(1.08); }}
#s2-col {{ position: absolute; left: {col['left']}px; top: {col['top']}px; width: {col['width']}px; height: {col['height']}px;
  display: flex; flex-direction: column; justify-content: {col['justify']}; align-items: center; text-align: center; gap: 26px; }}
#s2-badge {{ border: 3px solid #111111; border-radius: 999px; padding: 12px 30px; font-size: {L['badge']}px; font-weight: 600; color: #111111;
  white-space: nowrap; background: #FFFFFF; }}
#s2-title {{ font-weight: 800; font-size: {L['title']}px; line-height: 1.08; letter-spacing: -1.5px; width: {L['title_width']}px;{'' if v else ' white-space: nowrap;'} }}
#s2-roles {{ font-size: {L['roles']}px; font-weight: 600; color: #111111; white-space: nowrap; display: flex; align-items: center; gap: 14px; }}
#s2-roles .sep {{ display: inline-block; width: 4px; height: {int(L['roles']*1.25)}px; background: #111111; opacity: 0; }}
#s2-roles .rl {{ opacity: 0; display: inline-block; }}
#s2-btn {{ position: relative; height: {int(L['btn']*2.7)}px; border-radius: 999px; border: 3px solid #111111; overflow: hidden;
  display: flex; align-items: center; padding: 0 {int(L['btn']*0.35)}px 0 {int(L['btn']*1.1)}px; gap: {int(L['btn']*0.6)}px;
  margin-top: 10px; }}
#s2-btn-fill {{ position: absolute; inset: 0; background: #111111; transform-origin: 0% 50%; }}
#s2-btn-lbl {{ position: relative; color: #FFFFFF; font-weight: 800; font-size: {L['btn']}px; white-space: nowrap; opacity: 0; }}
#s2-btn-circ {{ position: relative; width: {int(L['btn']*2)}px; height: {int(L['btn']*2)}px; border-radius: 50%; background: #FFFFFF;
  opacity: 0; }}
#s2-arrow {{ position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: {int(L['btn']*1.3)}px; color: #111111; }}

/* sections vidéo */
.sec-bg {{ position: absolute; left: -100px; top: -60px; width: {W+200}px; height: {H+120}px;
  background: #EDEDED url("{L['bg']}") center / cover no-repeat; }}
.sec {{ background: transparent; }}
.sec-title {{ position: absolute; left: 0; width: {W}px; text-align: center; font-weight: 800; font-size: {L['sec_title']}px;
  letter-spacing: -1px; line-height: 1.2;
  background: linear-gradient(100deg, #34330B 0%, #4F4E12 30%, #6B6A1A 60%, #7C6807 85%, #5E5208 100%);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
  -webkit-background-clip: text; background-clip: text; color: transparent; }}
.vcard {{ position: absolute; border-radius: 24px; overflow: hidden; background: #1a1a1a;
  box-shadow: 0 24px 60px rgba(17,17,17,0.22), 0 6px 16px rgba(17,17,17,0.12); }}
.vcard video {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
#rise {{ position: absolute; left: 0; top: 0; width: {W}px; height: {int(H*1.6)}px;
  background: linear-gradient(180deg, rgba(232,224,30,0) 0%, #E8E01E 30%, #CFC81C 60%, #6B6A1A 100%); }}

/* scène 6 */
#s6-wrap {{ position: absolute; left: {(W - L['cta_width'])//2}px; top: 0; width: {L['cta_width']}px; height: {H}px;
  display: grid; place-items: center; text-align: center; }}
.cta {{ grid-area: 1 / 1; width: 100%; font-weight: 500; font-size: {L['cta']}px; color: #FFFFFF; line-height: 1.25;
  text-shadow: 0 2px 4px rgba(30,30,5,0.55), 0 4px 22px rgba(30,30,5,0.45); }}
.scrim {{ position: absolute; inset: 0; background: radial-gradient(ellipse 55% 38% at 50% 50%, rgba(40,40,8,0.38) 0%, rgba(40,40,8,0.18) 45%, rgba(40,40,8,0) 75%); }}
.cta .wd {{ display: inline-block; opacity: 0; white-space: nowrap; }}

/* scène 7-8 */
#stage {{ position: absolute; left: 0; top: 0; width: {W}px; height: {H}px; display: flex; align-items: center; justify-content: center; }}
#pcard {{ position: relative; width: {pw}px; height: {ph}px; border-radius: 40px; background: #141414; overflow: hidden;
  box-shadow: 0 40px 90px rgba(40,38,5,0.45), 0 10px 24px rgba(0,0,0,0.25); }}
#pcard-inner {{ position: absolute; left: 0; top: 0; width: {cw}px; height: {ch}px; }}
.p-logo {{ position: absolute; border-radius: 50%; background: #FFFFFF; overflow: hidden; opacity: 0;
  display: flex; align-items: center; justify-content: center; }}
.p-logo img {{ width: 78%; height: 78%; object-fit: contain; }}
.p-text {{ position: absolute; display: flex; flex-direction: column; color: #FFFFFF; }}
.p-handle {{ font-weight: 800; font-size: {L['handle']}px; letter-spacing: -0.5px; opacity: 0; }}
.p-name {{ font-weight: 500; font-size: {L['name']}px; color: #EDEDED; margin-top: 6px; opacity: 0; }}
.p-stats {{ display: flex; margin-top: {28 if not v else 46}px; opacity: 0; }}
.st .n {{ font-weight: 800; font-size: {L['stat_n']}px; line-height: 1.1; font-variant-numeric: tabular-nums; }}
.st .l {{ font-weight: 500; font-size: {L['stat_l']}px; color: #EDEDED; margin-top: 4px; white-space: nowrap; }}
.p-btns {{ display: flex; gap: 22px; margin-top: {34 if not v else 60}px; width: 100%; }}
.pbtn {{ position: relative; border-radius: 999px; background: #4A4DFF; color: #FFFFFF; font-weight: 800; opacity: 0; }}
.pbtn .lbl {{ position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }}
#b-follow-b {{ opacity: 0; }}
#hand {{ position: absolute; width: {90 if v else 70}px; height: {90 if v else 70}px; opacity: 0; left: 0; top: 0; }}
#sig {{ position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; color: #FFFFFF; text-align: center; }}
#sig-h {{ font-weight: 800; font-size: {L['sig_handle']}px; opacity: 0; letter-spacing: -0.5px; }}
#sig-w {{ font-weight: 500; font-size: {L['sig_wa']}px; color: #EDEDED; margin-top: 14px; opacity: 0; white-space: nowrap; }}
#flash, #black {{ position: absolute; inset: 0; opacity: 0; }}
#flash {{ background: #FFFFFF; }}
#black {{ background: #000000; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="27" data-fps="30" data-width="{W}" data-height="{H}">

  <!-- 1. ACCROCHE -->
  <div id="s1" class="scene">
    <div class="grad"></div>
    <div id="s1-b1" class="blob" style="left:{int(-0.18*W)}px;top:{int(-0.25*H)}px;width:{int(0.62*max(W,H))}px;height:{int(0.62*max(W,H))}px;background:rgba(107,106,26,0.32)"></div>
    <div id="s1-b2" class="blob" style="left:{int(0.62*W)}px;top:{int(0.45*H)}px;width:{int(0.55*max(W,H))}px;height:{int(0.55*max(W,H))}px;background:rgba(255,250,170,0.40)"></div>
    <div class="scrim"></div>
    <div id="s1-wrap">
      <div id="s1-small">{typed("Tu cherches un…", "t1")}</div>
      <div id="s1-big">{big_html}</div>
    </div>
  </div>

  <!-- 3-5. SECTIONS VIDÉO (fond commun) -->
  <div id="secbg" class="scene"><div id="secbg-img" class="sec-bg"></div></div>
  {''.join(sections)}
  <div id="s5-rise" class="scene" style="opacity:1;background:transparent"><div id="rise"></div></div>

  <!-- 2. PRÉSENTATION -->
  <div id="s2" class="scene">
    <div id="s2-photo"><img src="assets/photo.png" alt=""></div>
    <div id="s2-col">
      <div id="s2-badge">★ Créer du beau, avec style</div>
      <div id="s2-title">{title_html}</div>
      <div id="s2-roles"><span class="rl" id="r1">Monteur vidéo</span><span class="sep" id="sep1"></span><span class="rl" id="r2">Motion Designer</span><span class="sep" id="sep2"></span><span class="rl" id="r3">Créateur IA</span></div>
      <div id="s2-btn"><div id="s2-btn-fill"></div><span id="s2-btn-lbl">Voici mon travail</span><div id="s2-btn-circ"><div id="s2-arrow">↑</div></div></div>
    </div>
  </div>

  <!-- 6-8. CTA, CARTE PROFIL, SIGNATURE -->
  <div id="s6" class="scene">
    <div class="grad"></div>
    <div id="s6-b1" class="blob" style="left:{int(-0.15*W)}px;top:{int(0.40*H)}px;width:{int(0.6*max(W,H))}px;height:{int(0.6*max(W,H))}px;background:rgba(107,106,26,0.30)"></div>
    <div id="s6-b2" class="blob" style="left:{int(0.55*W)}px;top:{int(-0.2*H)}px;width:{int(0.5*max(W,H))}px;height:{int(0.5*max(W,H))}px;background:rgba(255,250,170,0.35)"></div>
    <div id="s6-scrim" class="scrim"></div>
    <div id="s6-wrap">
      <div id="cta1" class="cta">{' '.join(f'<span class="wd">{html.escape(w)}</span>' for w in "Transformons ton idée en\u00a0visuels".split(" "))}</div>
      <div id="cta2" class="cta">{' '.join(f'<span class="wd">{html.escape(w)}</span>' for w in "Écris-moi, on\u00a0en\u00a0parle\u00a0:)".split(" "))}</div>
    </div>
    <div id="stage">
      <div id="pcard">
        <div id="pcard-inner">{prof_inner}</div>
        <div id="sig"><div id="sig-h">{HANDLE}</div><div id="sig-w">{WHATSAPP}</div></div>
      </div>
    </div>
    <div id="hand">{HAND_SVG}</div>
  </div>

  <div id="flash"></div>
  <div id="black"></div>

  {chr(10).join('  ' + a for a in audio)}
</div>

<script>
document.fonts.ready.then(function () {{
  const W = {W}, H = {H}, V = {str(v).lower()};
  const ABO = {ABONNES_TIKTOK};
  const tl = gsap.timeline({{ paused: true }});
  const IN = "back.out(1.6)", IO = "power2.inOut";
  const show = (sel, t) => tl.set(sel, {{ opacity: 1 }}, t);
  const hide = (sel, t) => tl.set(sel, {{ opacity: 0 }}, t);

  /* ---------------- 1. ACCROCHE 0–2 s */
  show("#s1", 0); hide("#s1", 2.0);
  tl.fromTo("#s1-b1", {{ x: 0, y: 0 }}, {{ x: W * 0.10, y: H * 0.06, duration: 2.1, ease: "sine.inOut" }}, 0);
  tl.fromTo("#s1-b2", {{ x: 0, y: 0 }}, {{ x: -W * 0.12, y: -H * 0.08, duration: 2.1, ease: "sine.inOut" }}, 0);
  tl.to(".t1", {{ opacity: 1, duration: 0.01, stagger: 0.05 }}, 0.12);
  tl.fromTo("#s1-big", {{ scale: 2.4, opacity: 0, filter: "blur(14px)" }},
    {{ scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "back.out(2.2)" }}, 0.92);
  tl.to("#s1-big", {{ scale: 1.06, duration: 0.45, ease: "sine.inOut" }}, 1.5);
  // flash blanc
  tl.to("#flash", {{ opacity: 1, duration: 0.16, ease: "power2.in" }}, 1.84);
  tl.to("#flash", {{ opacity: 0, duration: 0.22, ease: "power2.out" }}, 2.0);

  /* ---------------- 2. PRÉSENTATION 2–6 s */
  show("#s2", 2.0);
  tl.fromTo("#s2-photo", {{ scale: 0 }}, {{ scale: 1, duration: 0.6, ease: IN }}, 2.08);
  tl.fromTo("#s2-photo img", {{ y: 40 }}, {{ y: 0, duration: 0.8, ease: "power2.out" }}, 2.15);
  tl.fromTo("#s2-badge", {{ opacity: 0, y: 24, scale: 0.8 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.45, ease: IN }}, 2.45);
  tl.to(".tt", {{ opacity: 1, duration: 0.01, stagger: 0.04 }}, 2.7);
  tl.fromTo(".sep", {{ opacity: 0, scaleY: 0 }}, {{ opacity: 1, scaleY: 1, duration: 0.25, ease: IN, stagger: 0.08 }}, 3.6);
  tl.fromTo(".rl", {{ opacity: 0, y: 14 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: IN, stagger: 0.12 }}, 3.85);
  tl.fromTo("#s2-btn", {{ opacity: 0, scale: 0.6 }}, {{ opacity: 1, scale: 1, duration: 0.4, ease: IN }}, 4.32);
  tl.fromTo("#s2-btn-fill", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.55, ease: IO }}, 4.55);
  tl.to("#s2-btn-lbl", {{ opacity: 1, duration: 0.3 }}, 4.85);
  tl.fromTo("#s2-btn-circ", {{ opacity: 0, scale: 0 }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: IN }}, 4.9);
  tl.to("#s2-btn", {{ scale: 1.05, duration: 0.18, yoyo: true, repeat: 1, ease: "sine.inOut" }}, 5.15);
  // la flèche s'envole vers le haut → transition
  tl.to("#s2-arrow", {{ y: -H * 1.1, duration: 0.42, ease: "power3.in" }}, 5.42);
  tl.to("#s2", {{ y: -H, duration: 0.42, ease: IO }}, 5.6);
  hide("#s2", 6.05);

  /* ---------------- 3-5. fond commun 5.6–17 s */
  show("#secbg", 5.6); hide("#secbg", 17.05);
  tl.fromTo("#secbg-img", {{ x: 0, y: 0, scale: 1.0 }}, {{ x: -60, y: -20, scale: 1.04, duration: 11.5, ease: "none" }}, 5.6);

  const titleIn = (sel, t) => tl.fromTo(sel, {{ opacity: 0, y: -30, scale: 0.92 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.45, ease: IN }}, t);
  const exitSec = (id, t) => {{
    tl.to(id + "-title", {{ opacity: 0, y: -40, duration: 0.25, ease: "power2.in" }}, t);
    tl.to(id + " .vcard", {{ opacity: 0, y: 60, scale: 0.94, duration: 0.25, ease: "power2.in", stagger: 0.04 }}, t);
  }};

  // 3. Montages courts 6–9 s
  show("#s3", 5.95); hide("#s3", 9.0);
  titleIn("#s3-title", 6.0);
  tl.fromTo("#s3 .vcard", {{ y: H * 0.75, opacity: 0, rotation: (i) => [-4, 3, -2][i] }},
    {{ y: 0, opacity: 1, rotation: 0, duration: 0.7, ease: "back.out(1.4)", stagger: 0.15 }}, 6.1);
  tl.to("#s3 .vcard", {{ y: -12, duration: 2.0, ease: "sine.inOut", stagger: 0.1 }}, 6.8);
  exitSec("#s3", 8.75);

  // 4. Motion Design 9–12 s
  show("#s4", 9.0); hide("#s4", 12.0);
  titleIn("#s4-title", 9.02);
  tl.fromTo("#s4-c1", {{ opacity: 0, x: V ? 0 : -140, y: V ? 120 : 0 }}, {{ opacity: 1, x: 0, y: 0, duration: 0.6, ease: "power3.out" }}, 9.15);
  tl.fromTo("#s4-c2", {{ opacity: 0, x: V ? 0 : 140, y: V ? 120 : 0 }}, {{ opacity: 1, x: 0, y: 0, duration: 0.6, ease: "power3.out" }}, 9.3);
  tl.to("#s4 .vcard", {{ scale: 1.03, duration: 2.0, ease: "sine.inOut" }}, 9.8);
  exitSec("#s4", 11.75);

  // 5. Projets perso 12–17 s
  show("#s5", 12.0); hide("#s5", 17.05);
  titleIn("#s5-title", 12.02);
  tl.fromTo("#s5-c1", {{ opacity: 0, y: 160, scale: 0.85 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.65, ease: IN }}, 12.1);
  tl.fromTo("#s5-c2", {{ opacity: 0, y: 160, scale: 0.85 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.65, ease: IN }}, 12.3);
  tl.to("#s5-c1", {{ y: -14, duration: 3.2, ease: "sine.inOut" }}, 13.0);
  tl.to("#s5-c2", {{ y: 14, duration: 3.2, ease: "sine.inOut" }}, 13.0);
  // sortie : dégradé jaune qui monte du bas
  tl.fromTo("#rise", {{ y: H }}, {{ y: -H * 0.6, duration: 0.85, ease: IO }}, 16.25);
  hide("#s5-rise", 17.3);

  /* ---------------- 6. APPEL À L'ACTION 17–20 s */
  show("#s6", 17.0);
  tl.fromTo("#s6-b1", {{ x: 0, y: 0 }}, {{ x: W * 0.12, y: -H * 0.10, duration: 10, ease: "sine.inOut" }}, 17.0);
  tl.fromTo("#s6-b2", {{ x: 0, y: 0 }}, {{ x: -W * 0.10, y: H * 0.12, duration: 10, ease: "sine.inOut" }}, 17.0);
  tl.fromTo("#cta1 .wd", {{ opacity: 0, y: 26 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: IN, stagger: 0.2 }}, 17.15);
  tl.to("#cta1", {{ opacity: 0, y: -30, filter: "blur(8px)", duration: 0.3, ease: "power2.in" }}, 18.45);
  tl.fromTo("#cta2 .wd", {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: IN, stagger: 0.1 }}, 18.65);
  tl.to("#cta2", {{ opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.in" }}, 19.4);
  tl.to("#s6-scrim", {{ opacity: 0, duration: 0.5 }}, 19.4);
  tl.fromTo("#pcard", {{ opacity: 0, scale: 0 }}, {{ opacity: 1, scale: 1, duration: 0.4, ease: IN }}, 19.5);

  /* ---------------- 7. CARTE PROFIL 20–24 s */
  tl.to("#pcard", {{ width: {cw}, height: {ch}, borderRadius: 28, duration: 0.6, ease: "back.out(1.2)" }}, 20.0);
  // inclinaison 3D continue
  tl.set("#pcard", {{ transformPerspective: 1400 }}, 20.0);
  tl.to("#pcard", {{ rotationY: -9, rotationX: 5, duration: 1.0, ease: "sine.inOut" }}, 20.0);
  tl.to("#pcard", {{ rotationY: 8, rotationX: -4, duration: 1.4, ease: "sine.inOut" }}, 21.0);
  tl.to("#pcard", {{ rotationY: -6, rotationX: 3, duration: 1.6, ease: "sine.inOut" }}, 22.4);
  tl.fromTo("#p-logo", {{ opacity: 0, scale: 0 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: IN }}, 20.5);
  tl.fromTo("#p-handle", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: IN }}, 20.6);
  tl.fromTo("#p-name", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: IN }}, 20.72);
  tl.fromTo("#p-stats", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: IN }}, 20.82);
  const fmt = (n) => String(n).replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, "\\u202F");
  const count = (id, to, suffix, t, d) => {{
    const o = {{ v: 0 }};
    tl.to(o, {{ v: to, duration: d, ease: "power2.out",
      onUpdate: () => {{ const n = Math.round(o.v); document.getElementById(id).textContent = fmt(n) + (n >= to ? suffix : ""); }} }}, t);
  }};
  count("n-proj", 30, "+", 20.85, 1.1);
  count("n-abo", ABO, "", 20.85, 1.2);
  count("n-cli", 20, "+", 20.85, 1.1);
  tl.fromTo(".pbtn", {{ opacity: 0, scale: 0.6 }}, {{ opacity: 1, scale: 1, duration: 0.4, ease: IN, stagger: 0.1 }}, 21.5);

  // curseur main → clic sur « Suivre »
  // position calculée sans tenir compte des transformations (offsets de mise en page uniquement)
  const HB = document.getElementById("b-follow"), HP = document.getElementById("p-text");
  const HX = (W - {cw}) / 2 + HP.offsetLeft + HB.offsetLeft + HB.offsetWidth * 0.5 - 14;
  const HY = (H - {ch}) / 2 + HP.offsetTop + HB.offsetTop + HB.offsetHeight * 0.5 - 6;
  tl.fromTo("#hand", {{ opacity: 0, x: W * 0.82, y: H * 0.95 }},
    {{ opacity: 1, x: HX, y: HY, duration: 0.65, ease: "power3.out" }}, 22.2);
  tl.to("#hand", {{ scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }}, 22.88);
  tl.to("#b-follow", {{ scale: 0.9, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }}, 22.88);
  tl.to("#b-follow", {{ backgroundColor: "#5A5A5A", duration: 0.15 }}, 22.98);
  tl.set("#b-follow-a", {{ opacity: 0 }}, 23.0);
  tl.set("#b-follow-b", {{ opacity: 1 }}, 23.0);
  tl.to("#hand", {{ opacity: 0, y: "+=60", duration: 0.35, ease: "power2.in" }}, 23.55);

  /* ---------------- 8. SIGNATURE 24–27 s */
  tl.to("#pcard-inner", {{ opacity: 0, duration: 0.3, ease: "power2.in" }}, 24.0);
  tl.to("#pcard", {{ rotationY: 32, rotationX: 0, duration: 0.3, ease: "power2.in" }}, 24.0);
  tl.to("#pcard", {{ rotationY: 0, duration: 0.45, ease: "back.out(1.5)" }}, 24.3);
  // carte vide 0,5 s, puis signature
  tl.fromTo("#sig-h", {{ opacity: 0, scale: 0.7 }}, {{ opacity: 1, scale: 1, duration: 0.45, ease: IN }}, 25.0);
  tl.fromTo("#sig-w", {{ opacity: 0, y: 16 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: IN }}, 25.25);
  tl.to("#pcard", {{ rotationY: -4, rotationX: 2, duration: 1.4, ease: "sine.inOut" }}, 24.8);
  // fondu au noir
  tl.to("#black", {{ opacity: 1, duration: 0.9, ease: "power1.in" }}, 26.1);

  window.__timelines["main"] = tl;
}});
</script>
</body>
</html>
"""
    (ROOT / L["out"]).write_text(doc, encoding="utf-8")
    print("écrit", L["out"])


if __name__ == "__main__":
    for k in LAYOUTS:
        build(k)
