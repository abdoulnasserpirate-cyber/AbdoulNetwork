"""Generates index.html (the HyperFrames composition) from timeline.py + captions.json + edit_plan.json.

Canvas 1920x1080 (rendered at --resolution 4k => 3840x2160 via device scale factor 2).
Usage: python3 scripts/build_comp.py
"""
import html
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from timeline import DURATION, PUNCH_SCALE, SHOTS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SIZES = json.load(open(ROOT / "assets/photos/sizes.json"))
CAPS = json.load(open(ROOT / "captions.json"))
PLAN = json.load(open(ROOT / "edit_plan.json"))
MARKERS = json.load(open(ROOT / "assets/maps/markers.json"))
E = html.escape
X_FADE = 0.28  # half-overlap of photo crossfades


def portrait(name):
    w, h = SIZES[name]
    return h > w * 0.95


def photo_block(s, name, cls=""):
    kb = s.get("kb", "50% 50%")
    if s.get("blur"):
        return (f'<div class="pf {cls}"><img class="kb" data-zoom="1" style="transform-origin:{kb}" '
                f'src="assets/photos/blur/{name}.jpg" alt=""></div>')
    filt = "grayscale(1) contrast(1.12) brightness(1.02)" if s.get("bw") else ("brightness(.62)" if s.get("dim") else "none")
    if portrait(name) and s["mode"] in ("C", "D"):
        return (f'<div class="pf {cls}">'
                f'<img class="kb contain" data-zoom="{s.get("zoom", 1)}" style="transform-origin:{kb};filter:{filt}" src="assets/photos/{name}.jpg" alt=""></div>')
    return (f'<div class="pf {cls}"><img class="kb" data-zoom="{s.get("zoom", 1)}" style="object-position:{kb};transform-origin:{kb};filter:{filt}" '
            f'src="assets/photos/{name}.jpg" alt=""></div>')


def kin_pos(s):
    m = s["mode"]
    if m == "A":
        return "pos-right"
    if m == "C":
        return "pos-left" if s.get("pip") == "br" else "pos-rightc"
    if m == "BL":
        return "pos-panel-r"
    if m == "BR":
        return "pos-panel-l"
    return "pos-center"


def label_pos(s):
    m = s["mode"]
    if m == "BL":
        return "lab-panel-r"
    if m == "BR":
        return "lab-panel-l"
    if m == "C" and s.get("pip") == "bl":
        return "lab-right"
    return "lab-left"


def build():
    shots_html, amb_html, gfx_html = [], [], []
    for i, s in enumerate(SHOTS):
        st = max(0.0, s["start"] - X_FADE)
        en = min(DURATION, s["end"] + X_FADE)
        dur = round(en - st, 3)
        sid = s["id"]
        # ambient (blurred) layer for every shot: the frame is never empty or black
        amb = s.get("photo") or s["mosaic"][0]
        amb_html.append(f'<div id="amb-{sid}" class="clip amb" data-start="{st:.3f}" data-duration="{dur}" data-track-index="1">'
                        f'<img src="assets/photos/blur/{amb}.jpg" alt=""></div>')
        inner = ""
        mode = s["mode"]
        if s.get("mosaic"):
            tiles = "".join(f'<div class="tile"><img src="assets/photos/{n}.jpg" alt=""></div>' for n in s["mosaic"])
            inner = f'<div class="mosaic">{tiles}</div>'
        elif s.get("photo") and mode in ("C", "D"):
            inner = photo_block(s, s["photo"], "full" + (" blur-photo" if s.get("blur") else ""))
        elif s.get("photo") and mode in ("BL", "BR"):
            inner = photo_block(s, s["photo"], "panel " + ("panel-r" if mode == "BL" else "panel-l"))
        if inner:
            shots_html.append(f'<div id="shot-{sid}" class="clip shot" data-start="{st:.3f}" data-duration="{dur}" data-track-index="2">{inner}</div>')
        # graphics -----------------------------------------------------------
        g = []
        if s.get("title"):
            g.append('<div class="title-card"><div class="t-kicker">L\'histoire de</div>'
                     '<div class="t-name">BAYA MAHIEDDINE</div><div class="t-rule"></div>'
                     '<div class="t-sub">L\'amour qui crée</div></div>')
        if s.get("big_title"):
            b = s["big_title"]
            g.append(f'<div class="big-title"><div class="bt-name">{E(b["name"])}</div><div class="bt-rule"></div>'
                     f'<div class="bt-years">{E(b["years"])}</div></div>')
        if s.get("lower_third"):
            l3 = s["lower_third"]
            g.append(f'<div class="l3"><div class="l3-bar"></div><div class="l3-name">{E(l3["name"])}</div>'
                     f'<div class="l3-role">{E(l3["role"])}</div><div class="l3-flags"><span class="fl-bj"></span><span class="fl-txt">Bénin → Niger</span></div></div>')
        if s.get("label"):
            lb = s["label"]
            small = f'<div class="lab-small">{E(lb["small"])}</div>' if lb.get("small") else ""
            g.append(f'<div class="lab {label_pos(s)}"><div class="lab-line"></div><div class="lab-big">{E(lb["big"])}</div>{small}</div>')
        if s.get("caption"):
            g.append(f'<div class="phcap {"phcap-r" if mode != "C" or s.get("pip") != "br" else "phcap-l"}">{E(s["caption"])}</div>')
        if s.get("word"):
            g.append(f'<div class="word">{E(s["word"])}</div>')
        for k, kn in enumerate(s.get("kinetic", [])):
            cls = "kin " + kin_pos(s) + (" kin-small" if kn.get("small") else "")
            strike = '<div class="kin-strike"></div>' if kn.get("strike") else ""
            g.append(f'<div class="{cls}" id="kin-{sid}-{k}"><span class="kin-txt">{E(kn["text"])}</span>{strike}</div>')
        if s.get("counter"):
            c = s["counter"]
            g.append(f'<div class="counter"><div class="cnt-num">{c["frm"]}</div><div class="cnt-age">{E(c["age"])}</div>'
                     f'<div class="cnt-place">PARIS</div></div>')
        if s.get("map"):
            mp = s["map"]
            svg = (ROOT / f"assets/maps/{mp['file']}.svg").read_text()
            px, py = MARKERS[mp["file"]][mp["point"]]
            g.append(f'<div class="mapcard"><div class="map-svg">{svg}</div>'
                     f'<div class="map-pin" style="left:{px * 100:.2f}%;top:{py * 100 * 1200 / 900:.2f}%"><span class="pin-halo"></span><span class="pin-dot"></span></div>'
                     f'<div class="map-txt"><div class="map-name">{E(mp["name"])}</div><div class="map-sub">{E(mp["sub"])}</div></div></div>')
        if s.get("chapter"):
            ch = s["chapter"]
            g.append(f'<div class="chapter"><div class="ch-num">II</div><div class="ch-title">{E(ch["text"])}</div>'
                     f'<div class="ch-rule"></div><div class="ch-sub">{E(ch["sub"])}</div></div>')
        if s.get("heritage"):
            hw = "".join(f'<div class="her-line">{E(w)}</div>' for w, _ in s["heritage"]["words"])
            g.append(f'<div class="heritage">{hw}</div>')
        if s.get("outro"):
            g.append('<div class="outro"><div class="o-kicker">Raconté par</div>'
                     '<div class="o-name">AMOUSSOU HOUNGBEDJI Marie Marthe</div>'
                     '<div class="o-school">Université Dan Dicko Dankoulodo de Maradi · Niger</div><div class="o-rule"></div>'
                     '<div class="o-baya">BAYA MAHIEDDINE <span>1931 – 1998</span></div>'
                     '<div class="o-credits">Photographies : Open Images Dataset (CC BY 2.0, auteurs crédités dans credits.txt) · Musique originale</div></div>')
        if g:
            gfx_html.append(f'<div id="gfx-{sid}" class="clip gfx" data-start="{s["start"]:.3f}" data-duration="{round(s["end"] - s["start"], 3)}" data-track-index="4">{"".join(g)}</div>')
    # chapter tag that stays on the first seconds of the "why" section
    gfx_html.append('<div id="gfx-chtag" class="clip gfx" data-start="50.25" data-duration="4.2" data-track-index="4">'
                    '<div class="chtag"><span>II</span> WHY THIS STORY MATTERS</div></div>')
    # captions
    cap_html = []
    for i, c in enumerate(CAPS):
        words = "".join(f'<span class="cw{" key" if w["key"] else ""}" id="cw-{i}-{j}">{E(w["w"])}</span>' for j, w in enumerate(c["words"]))
        cap_html.append(f'<div id="cap-{i}" class="clip cap" data-start="{c["s"]:.3f}" data-duration="{round(c["e"] - c["s"], 3)}" data-track-index="6">'
                        f'<div class="cap-line">{words.strip()}</div></div>')
    cuts = sorted({round(seg["program_start"], 3) for seg in PLAN["segments"] if seg["clip"] != "GAP"})
    js_data = {
        "D": DURATION, "X": X_FADE, "punch": PUNCH_SCALE, "cuts": cuts,
        "shots": SHOTS, "caps": [[[w["s"] for w in c["words"]], c["s"]] for c in CAPS],
    }
    return "\n".join(amb_html), "\n".join(shots_html), "\n".join(gfx_html), "\n".join(cap_html), json.dumps(js_data, ensure_ascii=False)


CSS = r"""
@font-face{font-family:"Montserrat";font-weight:500;src:url(assets/fonts/montserrat-latin-500-normal.woff2) format("woff2")}
@font-face{font-family:"Montserrat";font-weight:700;src:url(assets/fonts/montserrat-latin-700-normal.woff2) format("woff2")}
@font-face{font-family:"Montserrat";font-weight:800;src:url(assets/fonts/montserrat-latin-800-normal.woff2) format("woff2")}
@font-face{font-family:"Montserrat";font-weight:900;src:url(assets/fonts/montserrat-latin-900-normal.woff2) format("woff2")}
@font-face{font-family:"Playfair Display";font-weight:400;src:url(assets/fonts/playfair-display-latin-400-normal.woff2) format("woff2")}
@font-face{font-family:"Playfair Display";font-weight:700;src:url(assets/fonts/playfair-display-latin-700-normal.woff2) format("woff2")}
@font-face{font-family:"Playfair Display";font-weight:400;font-style:italic;src:url(assets/fonts/playfair-display-latin-400-italic.woff2) format("woff2")}
@font-face{font-family:"Playfair Display";font-weight:700;font-style:italic;src:url(assets/fonts/playfair-display-latin-700-italic.woff2) format("woff2")}
:root{--ink:#0d0f17;--cream:#f7efe2;--saffron:#f4b73f;--rose:#e9557f;--muted:#cfc5b4}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#07080c}
#root{position:relative;width:100%;height:100%;overflow:hidden;background:#07080c;font-family:"Montserrat",sans-serif;color:var(--cream)}
.clip{position:absolute;inset:0}
.amb img{position:absolute;inset:-4%;width:108%;height:108%;object-fit:cover}
#ambshade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(10,10,16,.15),rgba(6,6,10,.72) 75%);pointer-events:none}
.shot{overflow:hidden}
.pf{position:absolute;overflow:hidden}
.pf.full{inset:0}
.pf.panel{top:50px;width:1090px;height:980px;border-radius:26px;box-shadow:0 30px 90px rgba(0,0,0,.6);outline:2px solid rgba(255,255,255,.10);outline-offset:-2px}
.pf.panel-r{left:720px}
.pf.panel-l{left:110px}
.pf img.kb{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pf img.kb.contain{object-fit:contain}
.pf img.pf-bg{position:absolute;inset:-5%;width:110%;height:110%;object-fit:cover;opacity:.9}
.pf.blur-photo img.kb{opacity:.75}
.pf::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 62%,rgba(0,0,0,.55) 100%)}
.mosaic{position:absolute;inset:-40px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:16px;padding:16px}
.tile{position:relative;overflow:hidden;border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.tile img{width:100%;height:100%;object-fit:cover;display:block}
#pres-wrap{position:absolute;left:684px;top:50px;width:552px;height:980px;border-radius:26px;overflow:hidden;
  box-shadow:0 34px 90px rgba(0,0,0,.65),0 0 0 2px rgba(255,255,255,.12)}
#pres-inner{position:absolute;inset:0;transform-origin:50% 30%}
#pres{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#pres-wrap::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 70%,rgba(0,0,0,.35));pointer-events:none}
.gfx{pointer-events:none}
/* title */
.title-card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.t-kicker{font-family:"Playfair Display";font-style:italic;font-size:44px;color:var(--muted);letter-spacing:.04em}
.t-name{font-family:"Playfair Display";font-weight:700;font-size:150px;letter-spacing:.06em;line-height:1.05;margin-top:6px;text-shadow:0 8px 40px rgba(0,0,0,.6)}
.t-rule{width:420px;height:3px;background:var(--saffron);margin:26px 0 22px;transform-origin:50% 50%}
.t-sub{font-family:"Playfair Display";font-style:italic;font-size:54px;color:var(--saffron)}
.big-title{position:absolute;left:0;right:0;top:300px;text-align:center}
.bt-name{font-family:"Playfair Display";font-weight:700;font-size:168px;letter-spacing:.05em;text-shadow:0 10px 50px rgba(0,0,0,.7)}
.bt-rule{width:360px;height:3px;background:var(--saffron);margin:24px auto 18px}
.bt-years{font-family:"Montserrat";font-weight:700;font-size:40px;letter-spacing:.5em;color:var(--cream);padding-left:.5em}
/* lower third */
.l3{position:absolute;left:96px;top:590px;width:540px}
.l3-bar{width:84px;height:5px;background:var(--saffron);margin-bottom:22px}
.l3-name{font-weight:900;font-size:44px;line-height:1.08;letter-spacing:.01em;text-shadow:0 4px 20px rgba(0,0,0,.6)}
.l3-role{font-weight:500;font-size:25px;line-height:1.35;color:var(--muted);margin-top:14px}
.l3-flags{display:flex;align-items:center;gap:14px;margin-top:18px}
.fl-bj{width:54px;height:36px;border-radius:4px;background:linear-gradient(90deg,#008751 0 40%,transparent 40%),linear-gradient(180deg,#fcd116 0 50%,#e8112d 50% 100%);box-shadow:0 4px 14px rgba(0,0,0,.5)}
.fl-txt{font-weight:700;font-size:22px;letter-spacing:.18em;color:var(--saffron);text-transform:uppercase}
/* labels */
.lab{position:absolute;bottom:200px;max-width:900px}
.lab-left{left:110px}
.lab-right{right:110px;text-align:right}
.lab-right .lab-line{margin-left:auto}
.lab-panel-r{left:780px}
.lab-panel-l{left:170px}
.lab-line{width:90px;height:5px;background:var(--saffron);margin-bottom:18px;transform-origin:0 50%}
.lab-big{font-weight:900;font-size:76px;letter-spacing:.04em;line-height:1;text-shadow:0 6px 30px rgba(0,0,0,.65)}
.lab-small{font-family:"Playfair Display";font-style:italic;font-size:32px;color:var(--cream);opacity:.9;margin-top:12px;text-shadow:0 4px 18px rgba(0,0,0,.7)}
.phcap{position:absolute;top:70px;font-family:"Playfair Display";font-style:italic;font-size:26px;color:var(--cream);opacity:.85;text-shadow:0 3px 14px rgba(0,0,0,.8)}
.phcap-r{right:90px}
.phcap-l{left:90px}
.word{position:absolute;left:110px;bottom:190px;font-family:"Playfair Display";font-style:italic;font-weight:700;font-size:150px;line-height:1;text-shadow:0 10px 50px rgba(0,0,0,.7)}
/* kinetic */
.kin{position:absolute;font-weight:900;letter-spacing:.03em;line-height:1.02;text-shadow:0 8px 40px rgba(0,0,0,.7)}
.kin .kin-txt{display:inline-block}
.kin.pos-center{left:0;right:0;top:390px;text-align:center;font-size:150px}
.kin.pos-right{left:1270px;right:60px;top:380px;font-size:96px}
.kin.pos-left{left:110px;width:1200px;top:360px;font-size:120px}
.kin.pos-rightc{right:110px;width:1200px;top:360px;font-size:120px;text-align:right}
.kin.pos-panel-r{left:780px;width:980px;top:330px;font-size:104px}
.kin.pos-panel-l{left:170px;width:980px;top:330px;font-size:104px}
.kin.kin-small.pos-center{font-size:96px}
.kin.kin-small.pos-right{font-size:64px}
.kin.kin-small.pos-left,.kin.kin-small.pos-rightc{font-size:82px}
.kin.kin-small.pos-panel-r,.kin.kin-small.pos-panel-l{font-size:76px}
.kin-strike{position:absolute;left:-2%;width:104%;top:54%;height:9px;background:var(--rose);transform-origin:0 50%;box-shadow:0 4px 16px rgba(0,0,0,.5)}
/* counter */
.counter{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.cnt-num{font-family:"Playfair Display";font-weight:700;font-size:300px;line-height:1;letter-spacing:.02em;text-shadow:0 14px 60px rgba(0,0,0,.75);font-variant-numeric:lining-nums tabular-nums}
.cnt-age{font-weight:900;font-size:82px;letter-spacing:.3em;color:var(--saffron);margin-top:10px;padding-left:.3em}
.cnt-place{position:absolute;top:150px;font-weight:700;font-size:28px;letter-spacing:.8em;color:var(--cream);opacity:.85;padding-left:.8em}
/* map */
.mapcard{position:absolute;left:1290px;top:96px;width:460px;height:430px;border-radius:20px;background:rgba(10,12,20,.72);box-shadow:0 20px 60px rgba(0,0,0,.6);overflow:hidden;outline:2px solid rgba(255,255,255,.1);outline-offset:-2px}
.map-svg{position:absolute;left:10px;top:10px;width:440px;height:330px}
.map-svg svg{width:100%;height:100%}
.map-svg .land{fill:#2a2e3d;stroke:#4a4f63;stroke-width:2}
.map-svg .hi{fill:#c89a3a;stroke:#f4c766;stroke-width:3}
.map-svg .pt{display:none}
.map-pin{position:absolute;width:0;height:0;margin-left:10px;margin-top:10px}
.map-pin span{position:absolute;border-radius:50%;transform:translate(-50%,-50%)}
.pin-dot{width:18px;height:18px;background:var(--rose);box-shadow:0 0 0 4px rgba(255,255,255,.9)}
.pin-halo{width:70px;height:70px;border:3px solid var(--rose)}
.map-txt{position:absolute;left:24px;bottom:16px}
.map-name{font-weight:900;font-size:34px;letter-spacing:.06em}
.map-sub{font-size:20px;font-weight:500;color:var(--muted);margin-top:2px}
/* chapter */
.chapter{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.ch-num{font-family:"Playfair Display";font-style:italic;font-size:70px;color:var(--saffron)}
.ch-title{font-weight:900;font-size:96px;letter-spacing:.12em;margin-top:8px;padding-left:.12em}
.ch-rule{width:300px;height:3px;background:var(--saffron);margin:30px 0 22px}
.ch-sub{font-family:"Playfair Display";font-style:italic;font-size:44px;color:var(--muted)}
.chtag{position:absolute;left:70px;top:58px;font-weight:800;font-size:22px;letter-spacing:.32em;color:var(--cream);opacity:.92}
.chtag span{font-family:"Playfair Display";font-style:italic;letter-spacing:0;color:var(--saffron);font-size:30px;margin-right:12px}
/* heritage */
.heritage{position:absolute;left:0;right:0;top:300px;text-align:center}
.her-line{font-family:"Playfair Display";font-weight:700;font-size:128px;line-height:1.08;letter-spacing:.02em;text-shadow:0 10px 50px rgba(0,0,0,.75)}
.her-line:last-child{color:var(--saffron);font-style:italic}
/* outro */
.outro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.o-kicker{font-family:"Playfair Display";font-style:italic;font-size:40px;color:var(--muted)}
.o-name{font-weight:900;font-size:66px;letter-spacing:.03em;margin-top:10px}
.o-school{font-weight:500;font-size:28px;color:var(--muted);margin-top:12px}
.o-rule{width:260px;height:3px;background:var(--saffron);margin:34px 0 26px}
.o-baya{font-family:"Playfair Display";font-weight:700;font-size:64px;letter-spacing:.06em}
.o-baya span{font-family:"Montserrat";font-weight:700;font-size:28px;letter-spacing:.35em;color:var(--saffron);margin-left:18px;vertical-align:middle}
.o-credits{position:absolute;bottom:150px;font-size:20px;font-weight:500;color:var(--muted);opacity:.85;letter-spacing:.04em}
/* captions */
.cap{display:flex;align-items:flex-end;justify-content:center;padding-bottom:58px}
.cap-line{max-width:1290px;text-align:center;font-weight:800;font-size:46px;line-height:1.2;letter-spacing:.005em;
  text-shadow:0 0 2px rgba(0,0,0,.95),0 3px 10px rgba(0,0,0,.9),0 6px 26px rgba(0,0,0,.65)}
.cw{display:inline-block;color:rgba(247,239,226,.62);margin:0 .14em}
/* finishing */
#capbed{position:absolute;left:0;right:0;bottom:0;height:300px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.5));pointer-events:none}
.bar{position:absolute;left:0;right:0;height:112px;background:#000;transform:scaleY(0)}
#bar-top{top:0;transform-origin:50% 0}
#bar-bot{bottom:0;transform-origin:50% 100%}
#vignette{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.42) 100%);pointer-events:none}
#grain-box{position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:.075;mix-blend-mode:overlay}
#grain{position:absolute;left:0;top:0;width:2640px;height:1800px;background:url(assets/grain.png) repeat}
#black{position:absolute;inset:0;background:#000;pointer-events:none}
"""

JS = r"""
const DATA = __DATA__;
const tl = gsap.timeline({ paused: true });
const D = DATA.D, X = DATA.X;
const q = (s) => document.querySelector(s);
// ---------- global finishing ----------
tl.fromTo("#black", { opacity: 1 }, { opacity: 0, duration: 0.7, ease: "power1.out" }, 0);
tl.to("#black", { opacity: 1, duration: 0.9, ease: "power1.in" }, D - 1.0);
tl.fromTo("#grain", { x: 0, y: 0 }, { x: -700, y: -560, duration: D, ease: "steps(" + Math.round(D * 12) + ")" }, 0);
// ---------- presenter geometry per mode ----------
const GEO = {
  A: { x: 0, y: 0, scale: 1, opacity: 1 },
  BL: { x: -574, y: 0, scale: 1, opacity: 1 },
  BR: { x: 574, y: 0, scale: 1, opacity: 1 },
  "C-br": { x: 770, y: 276, scale: 0.42, opacity: 1 },
  "C-bl": { x: -770, y: 276, scale: 0.42, opacity: 1 },
};
let lastGeo = { x: 0, y: 0, scale: 1 };
tl.set("#pres-wrap", { x: 0, y: 0, scale: 0.94, opacity: 0 }, 0);
DATA.shots.forEach((s, i) => {
  const key = s.mode === "C" ? "C-" + (s.pip || "br") : s.mode;
  const t0 = Math.max(0, s.start - 0.3);
  if (s.mode === "D") {
    tl.to("#pres-wrap", { opacity: 0, scale: lastGeo.scale * 0.94, duration: 0.45, ease: "power2.inOut" }, t0);
  } else {
    const g = GEO[key];
    const wasHidden = i === 0 || DATA.shots[i - 1].mode === "D";
    if (wasHidden) {
      tl.set("#pres-wrap", { x: g.x, y: g.y, scale: g.scale * 0.94 }, t0);
      tl.to("#pres-wrap", { opacity: 1, scale: g.scale, duration: 0.55, ease: "power3.out" }, t0);
    } else {
      tl.to("#pres-wrap", { x: g.x, y: g.y, scale: g.scale, opacity: 1, duration: 0.6, ease: "power3.inOut" }, t0);
    }
    lastGeo = g;
  }
});
// punch-in alternation on every hard cut of the presenter footage (hides jump cuts)
DATA.cuts.forEach((t, k) => tl.set("#pres-inner", { scale: k % 2 ? DATA.punch : 1.0 }, t));
// ---------- letterbox on full-screen (D) shots ----------
DATA.shots.forEach((s, i) => {
  const prevD = i > 0 && DATA.shots[i - 1].mode === "D";
  const nextD = i + 1 < DATA.shots.length && DATA.shots[i + 1].mode === "D";
  if (s.mode === "D" && !prevD) tl.to(".bar", { scaleY: 1, duration: 0.5, ease: "power2.out" }, Math.max(0, s.start - 0.25));
  if (s.mode === "D" && !nextD && s.end < D - 0.1) tl.to(".bar", { scaleY: 0, duration: 0.5, ease: "power2.inOut" }, s.end - 0.25);
});
// ---------- photo shots ----------
DATA.shots.forEach((s) => {
  const st = Math.max(0, s.start - X), en = Math.min(D, s.end + X);
  const shot = q("#shot-" + s.id), amb = q("#amb-" + s.id);
  [amb, shot].forEach((el) => {
    if (!el) return;
    const inner = el.firstElementChild;
    tl.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: Math.min(0.5, 2 * X), ease: "power1.out" }, st);
    if (en < D) tl.to(inner, { opacity: 0, duration: Math.min(0.5, 2 * X), ease: "power1.in" }, en - Math.min(0.5, 2 * X));
  });
  if (!shot) return;
  shot.querySelectorAll("img.kb").forEach((img) => {
    const z = parseFloat(img.dataset.zoom || "1");
    tl.fromTo(img, { scale: 1.035 * z }, { scale: 1.11 * z, duration: en - st, ease: "none" }, st);
  });
  const panel = shot.querySelector(".pf.panel");
  if (panel) tl.fromTo(panel, { y: 40 }, { y: 0, duration: 0.7, ease: "power3.out" }, st);
  if (s.fade_gray) tl.to(shot.querySelectorAll("img.kb"), { filter: "grayscale(1) brightness(.55)", duration: 0.5 }, s.fade_gray);
  const tiles = shot.querySelectorAll(".tile");
  if (tiles.length) {
    tl.fromTo(shot.querySelector(".mosaic"), { scale: 1.32 }, { scale: 1.0, duration: en - st, ease: "power2.out" }, st);
    tiles.forEach((t, k) => tl.fromTo(t, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, st + 0.15 + k * 0.32));
  }
});
// ---------- graphics ----------
DATA.shots.forEach((s) => {
  const g = q("#gfx-" + s.id);
  if (!g) return;
  const T = (t) => t; // absolute program time
  if (s.title) {
    tl.fromTo(g.querySelector(".t-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, 0.25);
    tl.fromTo(g.querySelector(".t-name"), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.4, ease: "power3.out" }, 0.35);
    tl.fromTo(g.querySelector(".t-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 0.9);
    tl.fromTo(g.querySelector(".t-sub"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, 1.25);
    tl.to(g.querySelector(".title-card"), { opacity: 0, scale: 1.04, duration: 0.45, ease: "power2.in" }, s.end - 0.45);
  }
  if (s.big_title) {
    const b = s.big_title;
    tl.fromTo(g.querySelector(".bt-name"), { opacity: 0, y: 40, scale: 1.06 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }, b.at);
    tl.fromTo(g.querySelector(".bt-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, b.at + 0.3);
    tl.fromTo(g.querySelector(".bt-years"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, b.at + 0.55);
    tl.to(g.querySelector(".big-title"), { opacity: 0, duration: 0.3 }, s.end - 0.3);
  }
  if (s.lower_third) {
    const l = s.lower_third, el = g.querySelector(".l3");
    tl.fromTo(el.querySelector(".l3-bar"), { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.5, ease: "power3.out" }, l.at);
    tl.fromTo(el.querySelector(".l3-name"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, l.at + 0.1);
    tl.fromTo(el.querySelector(".l3-role"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, l.at + 0.3);
    tl.fromTo(el.querySelector(".l3-flags"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, l.at + 0.55);
    tl.to(el, { opacity: 0, x: -40, duration: 0.35, ease: "power2.in" }, s.end - 0.35);
  }
  if (s.label) {
    const el = g.querySelector(".lab"), a = s.label.at;
    tl.fromTo(el.querySelector(".lab-line"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power3.out" }, a);
    tl.fromTo(el.querySelector(".lab-big"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, a + 0.08);
    const sm = el.querySelector(".lab-small");
    if (sm) tl.fromTo(sm, { opacity: 0, y: 14 }, { opacity: 0.92, y: 0, duration: 0.5, ease: "power2.out" }, a + 0.25);
    tl.to(el, { opacity: 0, duration: 0.25 }, s.end - 0.25);
  }
  const cap = g.querySelector(".phcap");
  if (cap) { tl.fromTo(cap, { opacity: 0 }, { opacity: 0.85, duration: 0.5 }, s.start + 0.3); tl.to(cap, { opacity: 0, duration: 0.25 }, s.end - 0.25); }
  const w = g.querySelector(".word");
  if (w) {
    tl.fromTo(w, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, s.start + 0.02);
    tl.to(w, { opacity: 0, duration: 0.15 }, s.end - 0.15);
  }
  (s.kinetic || []).forEach((k, n) => {
    const el = g.querySelector("#kin-" + s.id + "-" + n);
    tl.fromTo(el, { opacity: 0, y: 40, scale: 1.04 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }, k.at);
    if (k.strike) tl.fromTo(el.querySelector(".kin-strike"), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.inOut" }, k.strike);
    tl.to(el, { opacity: 0, y: -20, duration: 0.25, ease: "power2.in" }, k.out - 0.25);
  });
  if (s.counter) {
    const c = s.counter, num = g.querySelector(".cnt-num"), obj = { v: c.frm };
    tl.fromTo(g.querySelector(".counter"), { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, s.start + 0.05);
    tl.fromTo(obj, { v: c.frm }, { v: c.to, duration: c.dur, ease: "power2.out", onUpdate: () => { num.textContent = Math.round(obj.v); } }, c.at);
    tl.fromTo(g.querySelector(".cnt-place"), { opacity: 0, y: -14 }, { opacity: 0.85, y: 0, duration: 1.0, ease: "power2.out" }, c.at + 0.4);
    tl.fromTo(g.querySelector(".cnt-age"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" }, c.age_at);
    tl.to(g.querySelector(".counter"), { opacity: 0, duration: 0.3 }, s.end - 0.3);
  }
  if (s.map) {
    const m = s.map, card = g.querySelector(".mapcard");
    tl.fromTo(card, { opacity: 0, y: -30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" }, m.at);
    tl.fromTo(card.querySelector(".pin-dot"), { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(2)" }, m.at + 0.3);
    tl.fromTo(card.querySelector(".pin-halo"), { scale: 0.3, opacity: 1 }, { scale: 1.4, opacity: 0, duration: 1.1, ease: "power1.out", repeat: 1 }, m.at + 0.35);
    tl.to(card, { opacity: 0, duration: 0.25 }, s.end - 0.25);
  }
  if (s.chapter) {
    const c = s.chapter, el = g.querySelector(".chapter");
    tl.fromTo(el.querySelector(".ch-num"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45 }, c.at);
    tl.fromTo(el.querySelector(".ch-title"), { opacity: 0, scale: 1.07 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, c.at + 0.05);
    tl.fromTo(el.querySelector(".ch-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, c.at + 0.35);
    tl.fromTo(el.querySelector(".ch-sub"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, c.at + 0.55);
    tl.to(el, { opacity: 0, scale: 0.96, duration: 0.35, ease: "power2.in" }, s.end - 0.35);
  }
  if (s.heritage) {
    g.querySelectorAll(".her-line").forEach((el, n) => {
      tl.fromTo(el, { opacity: 0, y: 46 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, s.heritage.words[n][1]);
    });
    tl.to(g.querySelector(".heritage"), { opacity: 0, duration: 0.35 }, s.end - 0.35);
  }
  if (s.outro) {
    const o = g.querySelector(".outro");
    tl.fromTo(o.querySelector(".o-kicker"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, s.start + 0.15);
    tl.fromTo(o.querySelector(".o-name"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, s.start + 0.3);
    tl.fromTo(o.querySelector(".o-school"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, s.start + 0.55);
    tl.fromTo(o.querySelector(".o-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, s.start + 0.7);
    tl.fromTo(o.querySelector(".o-baya"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, s.start + 0.9);
    tl.fromTo(o.querySelector(".o-credits"), { opacity: 0 }, { opacity: 0.85, duration: 0.5 }, s.start + 1.1);
  }
});
tl.fromTo(".chtag", { opacity: 0, x: -20 }, { opacity: 0.92, x: 0, duration: 0.5, ease: "power2.out" }, 50.3);
tl.to(".chtag", { opacity: 0, duration: 0.4 }, 54.0);
// ---------- karaoke captions ----------
DATA.caps.forEach(([starts, s0], i) => {
  tl.fromTo("#cap-" + i + " .cap-line", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.16, ease: "power1.out" }, s0);
  starts.forEach((t, j) => {
    const el = q("#cw-" + i + "-" + j);
    const key = el.classList.contains("key");
    tl.set(el, { color: "#f4b73f", scale: key ? 1.08 : 1.0 }, t);
    if (j + 1 < starts.length) tl.set(el, { color: key ? "#f4b73f" : "#f7efe2", scale: 1.0 }, starts[j + 1]);
  });
});
window.__timelines["main"] = tl;
"""


def main():
    amb, shots, gfx, caps, data = build()
    page = f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Baya Mahieddine — L'amour qui crée</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>{CSS}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DURATION}" data-width="1920" data-height="1080" data-fps="30">
{amb}
      <div id="ambshade"></div>
{shots}
      <div id="pres-wrap"><div id="pres-inner">
        <video id="pres" class="clip" src="assets/video/presenter.mp4" muted playsinline data-start="0" data-duration="{DURATION}" data-track-index="3"></video>
      </div></div>
      <div id="capbed"></div>
{gfx}
{caps}
      <div class="bar" id="bar-top"></div><div class="bar" id="bar-bot"></div>
      <div id="vignette"></div>
      <div id="grain-box"><div id="grain"></div></div>
      <div id="black"></div>
      <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="{DURATION}" data-track-index="8" data-volume="1"></audio>
    </div>
    <script>{JS.replace("__DATA__", data)}</script>
  </body>
</html>
"""
    (ROOT / "index.html").write_text(page)
    print("index.html", len(page) // 1024, "KB")


if __name__ == "__main__":
    main()
