#!/usr/bin/env python3
"""Generate index.html for the Allô Multiservice ad (monolithic composition)."""
import sys

OUT = sys.argv[1]
DUR = 34.72

# ---- SFX cue sheet: (time, file, duration, volume) -------------------------
SFX = [
    (0.00, "impact", 0.9, 0.55), (0.00, "moto", 1.6, 0.55), (0.42, "whoosh", 0.55, 0.35),
    (0.82, "pop", 0.18, 0.35),
    (1.40, "riser", 1.0, 0.0),  # placeholder removed below
    (1.45, "impact", 0.9, 0.5), (1.47, "whistle", 0.55, 0.22), (2.00, "pop", 0.18, 0.3),
    (2.55, "swoosh", 0.5, 0.45), (2.68, "moto", 1.6, 0.45), (2.78, "pop", 0.18, 0.3),
    (3.85, "stamp", 0.5, 0.55),
    (4.90, "swoosh", 0.5, 0.4), (5.05, "pop", 0.18, 0.3), (5.30, "ding", 1.4, 0.25), (6.35, "stamp", 0.5, 0.55),
    (7.30, "swoosh", 0.5, 0.45), (7.45, "pop", 0.18, 0.35), (8.65, "pop", 0.18, 0.35), (9.30, "pop", 0.18, 0.35),
    (9.92, "whoosh", 0.55, 0.35), (10.10, "click", 0.06, 0.3), (10.22, "click", 0.06, 0.3), (10.34, "click", 0.06, 0.3),
    (10.46, "click", 0.06, 0.3), (10.58, "click", 0.06, 0.3), (10.70, "click", 0.06, 0.3), (11.20, "stamp", 0.5, 0.45),
    (12.00, "swoosh", 0.5, 0.45), (12.15, "impact", 0.9, 0.45), (12.85, "impact", 0.9, 0.4), (13.30, "impact", 0.9, 0.45),
    (13.80, "swoosh", 0.5, 0.4), (13.90, "moto", 1.6, 0.4), (14.60, "pop", 0.18, 0.3), (14.85, "pop", 0.18, 0.3),
    (15.10, "pop", 0.18, 0.3),
    (16.12, "whoosh", 0.55, 0.35), (16.30, "click", 0.06, 0.4), (17.60, "click", 0.06, 0.4), (17.62, "ding", 1.4, 0.2),
    (18.75, "swoosh", 0.5, 0.45), (18.90, "notif", 0.9, 0.45), (20.00, "pop", 0.18, 0.35),
    (21.15, "impact", 0.9, 0.5), (21.20, "whistle", 0.55, 0.2), (22.30, "pop", 0.18, 0.3),
    (23.75, "swoosh", 0.5, 0.45), (23.90, "notif", 0.9, 0.35),
    (25.10, "pop", 0.18, 0.4), (25.95, "pop", 0.18, 0.4), (26.60, "pop", 0.18, 0.4), (27.40, "pop", 0.18, 0.4),
    (27.55, "coin", 0.9, 0.25), (28.10, "click", 0.06, 0.35),
    (28.70, "pop", 0.18, 0.4), (29.35, "pop", 0.18, 0.4), (30.10, "pop", 0.18, 0.4), (30.85, "pop", 0.18, 0.4),
    (31.00, "coin", 0.9, 0.25),
    (31.50, "impact", 0.9, 0.5), (31.55, "whistle", 0.55, 0.2), (33.05, "stamp", 0.5, 0.5), (33.10, "ding", 1.4, 0.3),
]
SFX = [s for s in SFX if s[3] > 0]

ICONS = r"""
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-moto" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="46" r="8"/><circle cx="50" cy="46" r="8"/><path d="M14 46h14l8-14h10l4 14"/><path d="M40 20h7l5 12"/><rect x="6" y="18" width="18" height="16" rx="2" fill="currentColor"/></g></symbol>
    <symbol id="i-med" viewBox="0 0 64 64"><path d="M24 6h16v18h18v16H40v18H24V40H6V24h18z" fill="currentColor"/></symbol>
    <symbol id="i-clean" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M40 6 26 34"/><path d="M18 34h20l6 22H12z" fill="currentColor"/><path d="M48 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="currentColor"/><path d="M54 32l1.5 3.5L59 37l-3.5 1.5L54 42l-1.5-3.5L49 37l3.5-1.5z" fill="currentColor"/></g></symbol>
    <symbol id="i-iron" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 46h50v-8c0-10-8-18-18-18H22" fill="currentColor"/><path d="M22 20h-4"/><path d="M14 54h4M28 54h4M42 54h4"/></g></symbol>
    <symbol id="i-cart" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h9l7 32h32l6-22H16"/><circle cx="24" cy="52" r="4.5" fill="currentColor"/><circle cx="48" cy="52" r="4.5" fill="currentColor"/></g></symbol>
    <symbol id="i-box" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"><path d="M32 6 56 18v28L32 58 8 46V18z"/><path d="M8 18l24 12 24-12M32 30v28"/><path d="M20 12l24 12"/></g></symbol>
    <symbol id="i-doc" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h26l12 12v44H14z"/><path d="M40 4v12h12M22 28h22M22 38h22M22 48h14"/></g></symbol>
    <symbol id="i-food" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6v20a6 6 0 0 1-12 0V6M12 6v52"/><path d="M46 58V6c-8 4-10 14-10 24h10"/></g></symbol>
    <symbol id="i-shop" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22h36l4 36H10z"/><path d="M24 28V16a8 8 0 0 1 16 0v12"/></g></symbol>
    <symbol id="i-pill" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"><rect x="8" y="22" width="48" height="20" rx="10" transform="rotate(-40 32 32)"/><path d="M25 25l14 14" transform="rotate(5 32 32)"/></g></symbol>
    <symbol id="i-key" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="40" r="12"/><path d="M28 32 54 6M44 16l6 6M38 22l5 5"/></g></symbol>
    <symbol id="i-wrench" viewBox="0 0 64 64"><path d="M50 6a14 14 0 0 0-18 17L8 47a6 6 0 0 0 9 9l24-24A14 14 0 0 0 58 14l-8 8-8-2-2-8z" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-bolt" viewBox="0 0 64 64"><path d="M36 4 10 36h18l-4 24 28-34H34z" fill="currentColor"/></symbol>
    <symbol id="i-shield" viewBox="0 0 64 64"><path d="M32 4 54 12v18c0 14-9 25-22 30C19 55 10 44 10 30V12z" fill="currentColor"/><path d="M21 31l8 8 15-16" fill="none" stroke="var(--shield-tick,#0A1E5E)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-clock" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><circle cx="32" cy="32" r="26"/><path d="M32 16v16l11 7"/></g></symbol>
    <symbol id="i-pin" viewBox="0 0 64 64"><path d="M32 4a20 20 0 0 0-20 20c0 15 20 36 20 36s20-21 20-36A20 20 0 0 0 32 4z" fill="currentColor"/><circle cx="32" cy="24" r="8" fill="#fff"/></symbol>
    <symbol id="i-phone" viewBox="0 0 64 64"><path d="M20 6l8 14-6 6c3 7 9 13 16 16l6-6 14 8-4 12c-24 2-48-22-46-46z" fill="currentColor"/></symbol>
    <symbol id="i-wa" viewBox="0 0 64 64"><path d="M32 4a27 27 0 0 0-23 41L5 59l15-4A27 27 0 1 0 32 4z" fill="currentColor"/><path d="M23 18l5 9-3 4c2 4 6 8 10 10l4-3 9 5-2 6c-14 1-29-14-28-28z" fill="#25D366"/></symbol>
    <symbol id="i-check" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="currentColor"/><path d="M19 33l9 9 18-19" fill="none" stroke="#0A1E5E" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  </defs>
</svg>
"""


def scene(sid, start, end, track, inner, bg=""):
    return (f'<section id="{sid}" class="scene clip {bg}" data-start="{start}" '
            f'data-duration="{round(end - start, 3)}" data-track-index="{track}">'
            f'<div class="cam">{inner}</div></section>\n')


def ic(name, cls=""):
    return f'<svg class="ico {cls}"><use href="#i-{name}"/></svg>'


SPEED = "".join(f'<div class="sl" style="top:{t}px;width:{w}px"></div>'
                for t, w in [(70, 520), (160, 900), (240, 380), (330, 700), (420, 560), (520, 980), (610, 420),
                             (700, 760), (790, 500), (880, 860), (960, 620), (1030, 400)])

scenes = []
# S1 hook ---------------------------------------------------------------
scenes.append(scene("s1", 0, 1.45, 0, f"""
<div class="glow g-gold" style="left:900px;top:-200px"></div>
<div class="speed">{SPEED}</div>
<div id="s1-card" class="photo" style="left:1040px;top:260px;width:800px;height:522px"><img src="assets/img/c_rider.jpg" alt=""></div>
<div class="col" style="left:110px;top:250px;width:860px">
  <div class="mask"><div id="s1-a" class="t t90 c-gold">BESOIN D'UN</div></div>
  <div class="mask"><div id="s1-b" class="t t160 c-white">SERVICE</div></div>
  <div class="mask"><div id="s1-c" class="t t160 c-orange">RAPIDE ?</div></div>
</div>""", "bg-navy"))

# S2 logo reveal --------------------------------------------------------
scenes.append(scene("s2", 1.45, 2.65, 1, """
<div class="rays"></div>
<div id="s2-ring" class="ring"></div>
<img id="s2-logo" class="logo" src="assets/img/logo.png" alt="Allô Multiservice" style="left:410px;top:110px;width:1100px">
<div class="center" style="top:790px"><div id="s2-t" class="t t96 c-white">EST LÀ POUR VOUS !</div></div>
<div id="s2-flash" class="flash"></div>""", "bg-navy"))

# S3 livraison ----------------------------------------------------------
scenes.append(scene("s3", 2.65, 5.0, 0, f"""
<div class="ghost c-navy">LIVRAISON</div>
<div id="s3-card" class="photo" style="left:90px;top:200px;width:980px;height:640px"><img id="s3-img" src="assets/img/c_rider.jpg" alt=""></div>
<div class="col" style="left:1130px;top:150px;width:720px">
  <div id="s3-ic" class="badge b-gold">{ic('moto')}</div>
  <div class="mask"><div id="s3-a" class="t t104 c-navy">LIVRAISON</div></div>
  <div class="mask"><div id="s3-b" class="t t104 c-navy">URGENTE ?</div></div>
  <div id="s3-bar" class="bar"></div>
</div>
<div id="s3-stamp" class="stamp" style="left:1110px;top:800px">ON S'EN CHARGE !</div>""", "bg-light"))

# S4 médical ------------------------------------------------------------
scenes.append(scene("s4", 5.0, 7.4, 1, f"""
<svg class="ecg" viewBox="0 0 1920 300" style="top:560px"><path id="s4-ecg" pathLength="1" d="M0 150 H520 L560 150 590 40 630 260 660 110 690 150 H1080 L1110 150 1140 60 1175 240 1205 150 H1920"/></svg>
<div id="s4-ic" class="medbadge" style="left:150px;top:190px">{ic('med')}</div>
<div class="col" style="left:760px;top:170px;width:1080px">
  <div class="mask"><div id="s4-a" class="t t110 c-white">ASSISTANCE</div></div>
  <div class="mask"><div id="s4-b" class="t t110 c-gold">MÉDICALE</div></div>
  <div class="mask"><div id="s4-c" class="t t80 c-white">À DOMICILE ?</div></div>
</div>
<div id="s4-stamp" class="stamp st-gold" style="left:760px;top:800px">ON S'EN OCCUPE !</div>""", "bg-navy"))

# S5 ménage / repassage / courses --------------------------------------
scenes.append(scene("s5", 7.4, 10.0, 0, f"""
<div id="s5-p1" class="panel p-navy" style="left:0"><div class="pin-in">{ic('clean','big')}<div class="t t84 c-white">MÉNAGE</div></div></div>
<div id="s5-p2" class="panel p-gold" style="left:640px"><div class="pin-in">{ic('iron','big')}<div class="t t84 c-navy">REPASSAGE</div></div></div>
<div id="s5-p3" class="panel p-white" style="left:1280px"><div class="pin-in">{ic('cart','big')}<div class="t t84 c-navy">COURSES</div></div></div>""", "bg-navy"))

# S6 et bien plus encore -----------------------------------------------
CHIPS = [("box", "COLIS"), ("doc", "DOCUMENTS"), ("food", "REPAS"), ("shop", "BOUTIQUES"),
         ("pill", "PHARMACIE"), ("key", "DÉMARCHES"), ("wrench", "DÉPANNAGE"), ("cart", "MARCHÉ")]
chips = "".join(f'<div class="chip" id="s6-c{i}">{ic(n)}<span>{l}</span></div>' for i, (n, l) in enumerate(CHIPS))
scenes.append(scene("s6", 10.0, 12.1, 1, f"""
<div class="center" style="top:95px"><div id="s6-t" class="t t110 c-navy">ET BIEN PLUS ENCORE…</div></div>
<div class="chips">{chips}</div>
<div id="s6-band" class="band"><div id="s6-b" class="t t96 c-white">ON FAIT TOUT POUR VOUS !</div></div>""", "bg-light"))

# S7 rapide fiable disponible -------------------------------------------
scenes.append(scene("s7", 12.1, 13.9, 0, f"""
<div id="s7-w1" class="word bg-orange"><div class="wrow">{ic('bolt','huge c-navy')}<div class="t t240 c-navy">RAPIDE</div></div></div>
<div id="s7-w2" class="word bg-navy"><div class="wrow">{ic('shield','huge c-gold')}<div class="t t240 c-white">FIABLE</div></div></div>
<div id="s7-w3" class="word bg-gold"><div class="wcol"><div class="t t210 c-navy">DISPONIBLE</div><div class="wrow small">{ic('clock','mid c-navy')}<div class="t t96 c-navy">7J/7 · MÊME LE WEEK-END</div></div></div></div>""", "bg-navy"))

# S8 partout ------------------------------------------------------------
pins = "".join(f'<svg class="mpin" id="s8-p{i}" style="left:{x}px;top:{y}px"><use href="#i-pin"/></svg>'
               for i, (x, y) in enumerate([(300, 180), (760, 90), (1250, 150), (1600, 300)]))
scenes.append(scene("s8", 13.9, 16.2, 1, f"""
<div class="full"><img id="s8-img" src="assets/img/c_city.jpg" alt=""></div>
<div class="shade"></div>
{pins}
<div class="col" style="left:110px;top:640px;width:1700px">
  <div class="mask"><div id="s8-a" class="t t84 c-white">NOS ÉQUIPES INTERVIENNENT</div></div>
  <div class="mask"><div id="s8-b" class="t t84 c-gold">PARTOUT OÙ VOUS AVEZ</div></div>
  <div class="mask"><div id="s8-c" class="t t84 c-gold">BESOIN DE NOUS !</div></div>
</div>""", "bg-navy"))

# S9 plus besoin --------------------------------------------------------
scenes.append(scene("s9", 16.2, 18.85, 0, f"""
<div class="ghost c-white" style="opacity:.06">ZÉRO STRESS</div>
<div class="glow g-gold" style="left:1200px;top:500px"></div>
<div id="s9-r1" class="row" style="top:250px">{ic('check','mid c-gold')}<div class="t t72 c-white">PLUS BESOIN DE VOUS DÉPLACER</div></div>
<div id="s9-r2" class="row" style="top:560px">{ic('check','mid c-gold')}<div class="t t72 c-white">PLUS BESOIN DE STRESSER</div></div>""", "bg-navy"))

# S10 un seul appel -----------------------------------------------------
scenes.append(scene("s10", 18.85, 21.25, 1, f"""
<div id="s10-card" class="photo" style="left:1150px;top:100px;width:680px;height:836px"><img id="s10-img" src="assets/img/c_phone.jpg" alt=""></div>
<div id="s10-ph" class="badge b-navy" style="position:absolute;left:110px;top:110px">{ic('phone')}<div class="wave w1"></div><div class="wave w2"></div></div>
<div class="col" style="left:110px;top:330px;width:1000px">
  <div class="mask"><div id="s10-a" class="t t150 c-navy">UN SEUL</div></div>
  <div class="mask"><div id="s10-b" class="t t150 hl">APPEL</div></div>
  <div class="mask" style="margin-top:20px"><div id="s10-c" class="t t80 c-navy">ET ON S'OCCUPE</div></div>
  <div class="mask"><div id="s10-d" class="t t80 c-navy">DU RESTE !</div></div>
</div>""", "bg-light"))

# S11 partenaire --------------------------------------------------------
scenes.append(scene("s11", 21.25, 23.85, 0, """
<div class="rays"></div>
<div id="s11-ring" class="ring"></div>
<img id="s11-logo" class="logo" src="assets/img/logo.png" alt="Allô Multiservice" style="left:460px;top:120px;width:1000px">
<div class="center" style="top:800px"><div id="s11-t" class="t t84 c-white">VOTRE PARTENAIRE <span class="c-gold">AU QUOTIDIEN</span></div></div>
<div id="s11-flash" class="flash"></div>""", "bg-navy"))


def num(prefix, n):
    return "".join(f'<span class="grp" id="{prefix}{i}">{g}</span>' for i, g in enumerate(n.split()))


# S12 CTA ---------------------------------------------------------------
scenes.append(scene("s12", 23.85, 31.6, 1, f"""
<div class="glow g-gold" style="left:-300px;top:300px"></div>
<div class="glow g-orange" style="left:1300px;top:500px"></div>
<div class="center" style="top:90px"><div id="s12-t" class="t t80 c-gold">APPELEZ-NOUS DÈS MAINTENANT !</div></div>
<div id="s12-r1" class="numrow" style="top:250px">
  <div class="icons"><div class="badge b-wa sm">{ic('wa')}</div><div class="badge b-gold sm">{ic('phone')}</div></div>
  <div class="num">{num('s12-a', '74 58 18 24')}</div>
</div>
<div class="center" style="top:520px"><div id="s12-ou" class="t t80 c-white">OU</div></div>
<div id="s12-r2" class="numrow" style="top:640px">
  <div class="icons"><div class="badge b-gold sm">{ic('phone')}</div></div>
  <div class="num">{num('s12-b', '88 57 92 90')}</div>
</div>
<div class="center" style="top:930px"><div id="s12-f" class="t t60 c-white">APPEL &amp; WHATSAPP · 7J/7</div></div>""", "bg-navy"))

# S13 end card ----------------------------------------------------------
scenes.append(scene("s13", 31.6, DUR, 0, f"""
<div class="rays"></div>
<img id="s13-logo" class="logo" src="assets/img/logo.png" alt="Allô Multiservice" style="left:560px;top:70px;width:800px">
<div class="center" style="top:560px"><div id="s13-t" class="t t96 c-white">UN APPEL ET C'EST <span class="c-gold">RÉGLÉ !</span></div></div>
<div id="s13-band" class="band b-goldband"><div class="wrow">{ic('phone','mid c-navy')}<div class="t t88 c-navy">74 58 18 24 · 88 57 92 90</div></div></div>
<div id="s13-flash" class="flash"></div>""", "bg-navy"))

WIPES = [2.65, 7.4, 12.1, 18.85, 23.85]

audio = ['<audio id="vo" src="assets/voice/voiceover.mp3" data-start="0" data-duration="34.72" data-track-index="10" data-volume="1"></audio>',
         '<audio id="bgm" src="assets/bgm/bed.wav" data-start="0" data-duration="34.72" data-track-index="11" data-volume="0.24"></audio>']
for i, (t, f, d, v) in enumerate(SFX):
    audio.append(f'<audio id="sfx{i:02d}" src="assets/sfx/{f}.wav" data-start="{t}" data-duration="{d}" '
                 f'data-track-index="{20 + i % 6}" data-volume="{v}"></audio>')

CSS = r"""
@font-face{font-family:'Montserrat';font-style:normal;font-weight:700;font-display:block;src:url('assets/fonts/montserrat-latin-700-normal.woff2') format('woff2');}
@font-face{font-family:'Montserrat';font-style:normal;font-weight:800;font-display:block;src:url('assets/fonts/montserrat-latin-800-normal.woff2') format('woff2');}
@font-face{font-family:'Montserrat';font-style:normal;font-weight:900;font-display:block;src:url('assets/fonts/montserrat-latin-900-normal.woff2') format('woff2');}
:root{--navy:#0A1E5E;--navy2:#061440;--gold:#F2A922;--orange:#F7841E;--white:#F7F9FF;--light:#EAF0FC}
*{margin:0;padding:0;box-sizing:border-box}
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#061440}
#root{position:relative;width:100%;height:100%;overflow:hidden;font-family:Montserrat,sans-serif;background:var(--navy2)}
.scene{position:absolute;inset:0;width:100%;height:100%;overflow:hidden}
.cam{position:absolute;inset:0;width:100%;height:100%}
.bg-navy{background:radial-gradient(1200px 800px at 70% 30%,#16348f 0%,rgba(22,52,143,0) 70%),var(--navy)}
.bg-light{background:radial-gradient(1100px 700px at 30% 20%,#ffffff 0%,rgba(255,255,255,0) 70%),var(--light)}
.bg-orange{background:var(--orange)} .bg-gold{background:var(--gold)}
.c-white{color:var(--white)} .c-gold{color:var(--gold)} .c-orange{color:var(--orange)} .c-navy{color:var(--navy)}
.t{font-weight:900;line-height:1.02;letter-spacing:-.01em;white-space:nowrap;display:block}
.t72{font-size:72px}.t60{font-size:60px;font-weight:800;letter-spacing:.04em}.t80{font-size:80px}.t84{font-size:84px}.t88{font-size:88px}.t90{font-size:90px}.t96{font-size:96px}
.t104{font-size:104px}.t110{font-size:110px}.t150{font-size:150px}.t160{font-size:160px}.t210{font-size:210px}.t240{font-size:240px}
.col{position:absolute;display:flex;flex-direction:column;gap:6px}
.mask{overflow:hidden;padding:4px 0 10px}
.center{position:absolute;left:0;width:100%;display:flex;justify-content:center}
.photo{position:absolute;border-radius:30px;overflow:hidden;box-shadow:0 30px 80px rgba(6,20,64,.45);border:6px solid var(--white)}
.photo img{width:100%;height:100%;object-fit:cover;display:block}
.full{position:absolute;inset:0;overflow:hidden}.full img{width:100%;height:100%;object-fit:cover;display:block}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,30,94,0) 25%,rgba(10,30,94,.88) 62%,rgba(6,20,64,.97) 100%)}
.glow{position:absolute;width:900px;height:900px;border-radius:50%;opacity:.35;filter:blur(40px)}
.g-gold{background:radial-gradient(circle,#F2A922 0%,rgba(242,169,34,0) 65%)}.g-orange{background:radial-gradient(circle,#F7841E 0%,rgba(247,132,30,0) 65%)}
.speed{position:absolute;inset:0}
.sl{position:absolute;left:0;height:6px;border-radius:6px;background:linear-gradient(90deg,rgba(242,169,34,0),rgba(242,169,34,.55));}
.ico{width:120px;height:120px;display:block;flex:none}
.ico.big{width:230px;height:230px}.ico.huge{width:250px;height:250px}.ico.mid{width:130px;height:130px}
.badge{width:200px;height:200px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:24px;position:relative;flex:none}
.badge.sm{width:150px;height:150px;margin:0}.badge.sm .ico{width:86px;height:86px}
.b-gold{background:var(--gold);color:var(--navy)}.b-navy{background:var(--navy);color:var(--gold)}.b-wa{background:#25D366;color:#fff}
.bar{width:520px;height:16px;border-radius:8px;background:var(--gold);margin-top:10px;transform-origin:0 50%}
.stamp{position:absolute;padding:22px 46px;border-radius:22px;background:var(--navy);color:var(--gold);font-weight:900;font-size:76px;white-space:nowrap;box-shadow:0 18px 40px rgba(6,20,64,.35)}
.stamp.st-gold{background:var(--gold);color:var(--navy)}
.ghost{position:absolute;left:-40px;bottom:-60px;font-weight:900;font-size:330px;white-space:nowrap;opacity:.06}
.logo{position:absolute;display:block;height:auto}
.ring{position:absolute;left:660px;top:240px;width:600px;height:600px;border-radius:50%;border:14px solid var(--gold)}
.rays{position:absolute;left:-40px;top:-460px;width:2000px;height:2000px;border-radius:50%;background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(242,169,34,.10) 0deg 8deg,rgba(242,169,34,0) 8deg 20deg)}
.flash{position:absolute;inset:0;background:#fff;opacity:0}
.ecg{position:absolute;left:0;width:1920px;height:300px;overflow:visible}
.ecg path{fill:none;stroke:var(--gold);stroke-width:10;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1;stroke-dashoffset:1;opacity:.85}
.medbadge{position:absolute;width:480px;height:480px;border-radius:50%;background:var(--white);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 22px rgba(242,169,34,.35)}
.medbadge .ico{width:280px;height:280px;color:#E0322F}
.panel{position:absolute;top:0;width:640px;height:1080px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.p-navy{background:var(--navy);color:var(--white)}.p-gold{background:var(--gold);color:var(--navy)}.p-white{background:var(--white);color:var(--navy)}
.pin-in{display:flex;flex-direction:column;align-items:center;gap:40px}
.chips{position:absolute;left:70px;top:310px;width:1780px;display:grid;grid-template-columns:repeat(4,1fr);gap:34px 24px}
.chip{display:flex;align-items:center;gap:16px;height:170px;padding:0 20px;border-radius:28px;background:var(--navy);color:var(--gold);box-shadow:0 16px 36px rgba(6,20,64,.25)}
.chip .ico{width:70px;height:70px}
.chip span{font-weight:900;font-size:44px;color:var(--white);white-space:nowrap}
.band{position:absolute;left:0;top:800px;width:1920px;height:200px;background:var(--navy);display:flex;align-items:center;justify-content:center;transform-origin:0 50%}
.b-goldband{background:var(--gold);top:760px;height:220px}
.word{position:absolute;inset:0;overflow:hidden;display:flex;align-items:center;justify-content:center}
.wrow{display:flex;align-items:center;gap:40px}.wrow.small{gap:24px}
.wcol{display:flex;flex-direction:column;align-items:center;gap:30px}
.mpin{position:absolute;width:120px;height:120px;color:var(--gold);filter:drop-shadow(0 10px 14px rgba(0,0,0,.4))}
.row{position:absolute;left:150px;display:flex;align-items:center;gap:40px;padding:40px 54px;border-radius:30px;background:rgba(247,249,255,.08);border:3px solid rgba(242,169,34,.4)}
.hl{display:inline-block;background:var(--gold);color:var(--navy);padding:0 30px;border-radius:18px}
.wave{position:absolute;inset:0;border-radius:50%;border:8px solid var(--navy)}
.numrow{position:absolute;left:0;width:1920px;display:flex;align-items:center;justify-content:center;gap:50px}
.icons{display:flex;gap:22px}
.num{display:flex;gap:44px;font-weight:900;font-size:200px;line-height:1;color:var(--white);font-variant-numeric:tabular-nums}
.grp{display:inline-block}
#wipe{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.wb{position:absolute;top:-300px;height:1700px;width:900px;transform-origin:50% 50%}
.wb1{background:var(--gold)}.wb2{background:var(--orange)}.wb3{background:var(--navy2)}
"""

JS = r"""
(function(){
var tl = gsap.timeline({paused:true});
var E3='power3.out', EX='expo.out', BK='back.out(1.8)';
function camIn(id,t,from){ tl.fromTo(id+' .cam',from,{x:0,y:0,scale:1,rotation:0,filter:'blur(0px)',duration:0.34,ease:E3},t); }
function camOut(id,t,to){ to.duration=0.2; to.ease='power2.in'; tl.to(id+' .cam',to,t-0.2); }
function rise(sel,t,d){ tl.fromTo(sel,{yPercent:115},{yPercent:0,duration:d||0.42,ease:EX},t); }
function pop(sel,t,s){ tl.fromTo(sel,{scale:s||0,opacity:0},{scale:1,opacity:1,duration:0.45,ease:BK},t); }
function stamp(sel,t){ tl.fromTo(sel,{scale:2.4,opacity:0,rotation:-14},{scale:1,opacity:1,rotation:-4,duration:0.32,ease:'power4.in'},t);
  tl.fromTo(sel,{y:0},{keyframes:[{y:8,duration:0.05},{y:-4,duration:0.05},{y:0,duration:0.05}],immediateRender:false},t+0.32); }
function kb(sel,t,d,s0,s1,x0,x1){ tl.fromTo(sel,{scale:s0,xPercent:x0||0},{scale:s1,xPercent:x1||0,duration:d,ease:'none'},t); }

// ---------- S1 hook 0–1.45
tl.fromTo('#s1 .sl',{x:2100},{x:-1100,duration:0.55,ease:'none',stagger:{each:0.045,repeat:1}},0);
tl.fromTo('#s1-card',{x:1300,skewX:-18,rotation:6,filter:'blur(18px)'},{x:0,skewX:0,rotation:-2,filter:'blur(0px)',duration:0.42,ease:EX},0);
kb('#s1-card img',0,1.45,1.25,1.05,6,0);
tl.fromTo('#s1 .cam',{scale:1.18},{scale:1,duration:0.5,ease:E3},0);
rise('#s1-a',0.04); rise('#s1-b',0.42); rise('#s1-c',0.82);
tl.fromTo('#s1-c',{scale:1},{keyframes:{scale:[1,1.12,1]},duration:0.35,immediateRender:false,transformOrigin:'0% 50%'},1.05);
camOut('#s1',1.45,{scale:1.25,filter:'blur(10px)',opacity:0});

// ---------- S2 logo 1.45–2.65
tl.fromTo('#s2-flash',{opacity:0.95},{opacity:0,duration:0.3,ease:'power2.out'},1.45);
tl.fromTo('#s2-logo',{scale:0.25,rotation:-10,opacity:0},{scale:1,rotation:0,opacity:1,duration:0.5,ease:'back.out(2.2)'},1.47);
tl.fromTo('#s2-ring',{scale:0.2,opacity:1},{scale:2.6,opacity:0,duration:0.8,ease:'power2.out'},1.5);
tl.fromTo('#s2 .rays',{rotation:0},{rotation:25,duration:1.2,ease:'none'},1.45);
pop('#s2-t',1.98,0.4);
tl.fromTo('#s2-logo',{y:0},{y:-12,duration:0.6,ease:'sine.inOut',immediateRender:false},2.0);
camOut('#s2',2.65,{x:-500,filter:'blur(12px)'});

// ---------- S3 livraison 2.65–5.0
camIn('#s3',2.65,{x:520,filter:'blur(14px)'});
tl.fromTo('#s3-card',{x:-700,rotation:-8},{x:0,rotation:-1.5,duration:0.5,ease:EX},2.65);
kb('#s3-img',2.65,2.35,1.3,1.05,-5,3);
pop('#s3-ic',2.75); rise('#s3-a',2.78); rise('#s3-b',2.95);
tl.fromTo('#s3-ic .ico',{x:-30},{x:16,duration:0.5,ease:'sine.inOut',yoyo:true,repeat:3},3.2);
tl.fromTo('#s3-bar',{scaleX:0},{scaleX:1,duration:0.45,ease:E3},3.3);
stamp('#s3-stamp',3.82);
tl.fromTo('#s3 .ghost',{x:200},{x:-200,duration:2.35,ease:'none'},2.65);
camOut('#s3',5.0,{y:-300,filter:'blur(12px)'});

// ---------- S4 médical 5.0–7.4
camIn('#s4',5.0,{y:400,filter:'blur(14px)'});
pop('#s4-ic',5.05);
tl.fromTo('#s4-ic .ico',{scale:1},{scale:1.12,duration:0.3,ease:'sine.inOut',yoyo:true,repeat:5,immediateRender:false},5.5);
tl.fromTo('#s4-ecg',{attr:{'stroke-dashoffset':1}},{attr:{'stroke-dashoffset':0},duration:1.3,ease:'power1.inOut'},5.1);
rise('#s4-a',5.08); rise('#s4-b',5.3); rise('#s4-c',5.75);
stamp('#s4-stamp',6.32);
camOut('#s4',7.4,{scale:0.8,filter:'blur(12px)',opacity:0});

// ---------- S5 panels 7.4–10.0
[['#s5-p1',7.42],['#s5-p2',8.62],['#s5-p3',9.28]].forEach(function(p){
  tl.fromTo(p[0],{yPercent:100},{yPercent:0,duration:0.42,ease:EX},p[1]);
  tl.fromTo(p[0]+' .ico',{scale:0,rotation:-30},{scale:1,rotation:0,duration:0.5,ease:'back.out(2.4)'},p[1]+0.12);
  tl.fromTo(p[0]+' .t',{y:60,opacity:0},{y:0,opacity:1,duration:0.4,ease:E3},p[1]+0.18);
});
tl.fromTo('#s5-p1 .ico',{rotation:0},{rotation:12,duration:0.35,yoyo:true,repeat:3,ease:'sine.inOut',immediateRender:false},8.0);
tl.fromTo('#s5-p2 .ico',{x:0},{x:30,duration:0.3,yoyo:true,repeat:1,ease:'sine.inOut',immediateRender:false},9.0);
camOut('#s5',10.0,{x:-600,filter:'blur(12px)'});

// ---------- S6 bien plus 10.0–12.1
camIn('#s6',10.0,{x:600,filter:'blur(14px)'});
pop('#s6-t',10.05,0.5);
tl.fromTo('.chip',{scale:0,opacity:0,y:80},{scale:1,opacity:1,y:0,duration:0.42,ease:'back.out(2)',stagger:0.09},10.15);
tl.fromTo('#s6-band',{scaleX:0},{scaleX:1,duration:0.35,ease:EX},11.15);
rise('#s6-b',11.25);
camOut('#s6',12.1,{scale:1.3,filter:'blur(12px)',opacity:0});

// ---------- S7 rapide / fiable / disponible 12.1–13.9
[['#s7-w1',12.12,{xPercent:100}],['#s7-w2',12.83,{yPercent:100}],['#s7-w3',13.28,{xPercent:-100}]].forEach(function(w){
  var to={xPercent:0,yPercent:0,duration:0.22,ease:'power4.out'};
  tl.fromTo(w[0],w[2],to,w[1]);
  tl.fromTo(w[0]+' .t',{scale:1.6,filter:'blur(12px)'},{scale:1,filter:'blur(0px)',duration:0.35,ease:E3},w[1]+0.04);
  tl.fromTo(w[0]+' .ico',{scale:0,rotation:-40},{scale:1,rotation:0,duration:0.4,ease:'back.out(2.4)'},w[1]+0.1);
});
tl.set('#s7-w1 .wrow',{opacity:0},13.06); tl.set('#s7-w2 .wrow',{opacity:0},13.52);
tl.fromTo('#s7-w3 .wrow',{y:40,opacity:0},{y:0,opacity:1,duration:0.3,ease:E3},13.42);

// ---------- S8 partout 13.9–16.2
camIn('#s8',13.9,{scale:1.3,filter:'blur(16px)'});
kb('#s8-img',13.9,2.3,1.08,1.25,-2,2);
[0,1,2,3].forEach(function(i){ tl.fromTo('#s8-p'+i,{y:-120,opacity:0,scale:0.4},{y:0,opacity:1,scale:1,duration:0.45,ease:'bounce.out'},14.35+i*0.25); });
rise('#s8-a',14.0); rise('#s8-b',14.95); rise('#s8-c',15.15);
camOut('#s8',16.2,{x:-500,filter:'blur(12px)'});

// ---------- S9 plus besoin 16.2–18.85
camIn('#s9',16.2,{x:500,filter:'blur(14px)'});
tl.fromTo('#s9-r1',{x:-1400,opacity:0},{x:0,opacity:1,duration:0.45,ease:EX},16.25);
tl.fromTo('#s9-r2',{x:1400,opacity:0},{x:0,opacity:1,duration:0.45,ease:EX},17.55);
tl.fromTo('#s9-r1 .ico',{scale:0,rotation:-90},{scale:1,rotation:0,duration:0.45,ease:'back.out(2.6)'},16.4);
tl.fromTo('#s9-r2 .ico',{scale:0,rotation:-90},{scale:1,rotation:0,duration:0.45,ease:'back.out(2.6)'},17.7);
tl.fromTo('#s9 .ghost',{x:0},{x:-300,duration:2.65,ease:'none'},16.2);
tl.fromTo('#s9 .glow',{scale:0.8},{scale:1.2,duration:2.65,ease:'sine.inOut'},16.2);
camOut('#s9',18.85,{y:300,filter:'blur(12px)'});

// ---------- S10 un seul appel 18.85–21.25
camIn('#s10',18.85,{y:-400,filter:'blur(14px)'});
tl.fromTo('#s10-card',{x:900,rotation:10},{x:0,rotation:2,duration:0.5,ease:EX},18.88);
kb('#s10-img',18.85,2.4,1.25,1.05,0,0);
pop('#s10-ph',18.9);
tl.fromTo('#s10-ph .ico',{rotation:-14},{rotation:14,duration:0.07,yoyo:true,repeat:13,ease:'none'},19.0);
tl.fromTo('#s10-ph .w1',{scale:1,opacity:0.8},{scale:1.8,opacity:0,duration:0.8,ease:'power2.out',repeat:2},19.0);
tl.fromTo('#s10-ph .w2',{scale:1,opacity:0.8},{scale:1.8,opacity:0,duration:0.8,ease:'power2.out',repeat:1},19.4);
rise('#s10-a',18.92); rise('#s10-b',19.3); rise('#s10-c',20.0); rise('#s10-d',20.25);
camOut('#s10',21.25,{scale:1.3,filter:'blur(12px)',opacity:0});

// ---------- S11 partenaire 21.25–23.85
tl.fromTo('#s11-flash',{opacity:0.9},{opacity:0,duration:0.3},21.25);
tl.fromTo('#s11-logo',{scale:3,opacity:0,filter:'blur(20px)'},{scale:1,opacity:1,filter:'blur(0px)',duration:0.5,ease:'power4.out'},21.25);
tl.fromTo('#s11-ring',{scale:0.2,opacity:1},{scale:2.8,opacity:0,duration:0.9,ease:'power2.out'},21.6);
tl.fromTo('#s11 .rays',{rotation:0},{rotation:40,duration:2.6,ease:'none'},21.25);
tl.fromTo('#s11-logo',{scale:1},{scale:1.06,duration:1.8,ease:'sine.inOut',immediateRender:false},21.8);
pop('#s11-t',22.3,0.6);
camOut('#s11',23.85,{x:-500,filter:'blur(12px)'});

// ---------- S12 CTA 23.85–31.6
camIn('#s12',23.85,{x:500,filter:'blur(14px)'});
rise('#s12-t',23.9);
tl.fromTo('#s12-r1 .badge',{scale:0},{scale:1,duration:0.4,ease:'back.out(2.4)',stagger:0.12},24.5);
var A=[25.1,25.95,26.6,27.4], B=[28.7,29.35,30.1,30.85];
A.forEach(function(t,i){ tl.fromTo('#s12-a'+i,{y:140,opacity:0,scale:0.6,color:'#F2A922'},{y:0,opacity:1,scale:1,duration:0.32,ease:'back.out(2.2)'},t);
  tl.to('#s12-a'+i,{color:'#F7F9FF',duration:0.3},t+0.45); });
pop('#s12-ou',28.1,0.3);
tl.fromTo('#s12-r2 .badge',{scale:0},{scale:1,duration:0.4,ease:'back.out(2.4)'},28.3);
B.forEach(function(t,i){ tl.fromTo('#s12-b'+i,{y:140,opacity:0,scale:0.6,color:'#F2A922'},{y:0,opacity:1,scale:1,duration:0.32,ease:'back.out(2.2)'},t);
  tl.to('#s12-b'+i,{color:'#F7F9FF',duration:0.3},t+0.45); });
tl.fromTo('#s12-r1 .icons',{rotation:0},{keyframes:[{rotation:-6,duration:0.06},{rotation:6,duration:0.06},{rotation:-6,duration:0.06},{rotation:0,duration:0.06}],immediateRender:false},27.6);
tl.fromTo('#s12-r2 .icons',{rotation:0},{keyframes:[{rotation:-6,duration:0.06},{rotation:6,duration:0.06},{rotation:-6,duration:0.06},{rotation:0,duration:0.06}],immediateRender:false},31.05);
tl.fromTo('#s12-f',{y:40,opacity:0},{y:0,opacity:1,duration:0.4,ease:E3},29.0);
tl.fromTo('#s12 .glow',{scale:0.8},{scale:1.25,duration:7.75,ease:'sine.inOut'},23.85);

// ---------- S13 end 31.6–34.72
tl.fromTo('#s13-flash',{opacity:0.9},{opacity:0,duration:0.3},31.6);
tl.fromTo('#s13-logo',{scale:0.3,opacity:0,rotation:8},{scale:1,opacity:1,rotation:0,duration:0.55,ease:'back.out(2)'},31.6);
tl.fromTo('#s13-band',{yPercent:110},{yPercent:0,duration:0.45,ease:EX},31.8);
tl.fromTo('#s13-band .wrow',{y:50,opacity:0},{y:0,opacity:1,duration:0.4,ease:E3},32.0);
tl.fromTo('#s13 .rays',{rotation:0},{rotation:35,duration:3.12,ease:'none'},31.6);
pop('#s13-t',33.05,1.8);
tl.fromTo('#s13-logo',{scale:1},{scale:1.05,duration:1.5,ease:'sine.inOut',immediateRender:false},33.2);

// ---------- diagonal wipes at major cuts
WIPES.forEach(function(t){
  ['.wb1','.wb2','.wb3'].forEach(function(c,i){
    tl.fromTo('#wipe '+c,{x:2300,rotation:18},{x:-1300,rotation:18,duration:0.42,ease:'power2.inOut',immediateRender:false},t-0.24+i*0.04);
  });
});
tl.set('#wipe .wb',{x:2300,rotation:18},0);

window.__timelines['main'] = tl;
})();
"""
JS = JS.replace("WIPES", str(WIPES))

html = f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>{CSS}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1920" data-height="1080">
{ICONS}
{''.join(scenes)}
<div id="wipe" class="clip" data-start="0" data-duration="{DUR}" data-track-index="3"><div class="wb wb1" data-layout-allow-overflow></div><div class="wb wb2" data-layout-allow-overflow></div><div class="wb wb3" data-layout-allow-overflow></div></div>
{chr(10).join(audio)}
    </div>
    <script>{JS}</script>
  </body>
</html>
"""
open(OUT, "w").write(html)
print("wrote", OUT, len(html))
