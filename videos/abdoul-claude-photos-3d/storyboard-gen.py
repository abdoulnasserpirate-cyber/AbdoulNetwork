"""Generate storyboard.html (static sketch sheet) for both formats."""
import sys

OUT = sys.argv[1]

def u(n):
    return f"calc(var(--u)*{n})"

def box(x, y, w=None, h=None, extra="", cls="", inner=""):
    st = f"left:{u(x)};top:{u(y)};"
    if w is not None: st += f"width:{u(w)};"
    if h is not None: st += f"height:{u(h)};"
    return f'<div class="abs {cls}" style="{st}{extra}">{inner}</div>'

def title(fmt, html):
    if fmt == "v":
        return box(110, 170, 860, None, f"font-size:{u(62)};", "title", html)
    return box(210, 64, 1500, None, f"font-size:{u(60)};", "title", html)

def counter(fmt, text):
    if fmt == "v":
        return box(0, 1340, 1080, None, f"font-size:{u(122)};", "counter", text)
    return box(0, 870, 1920, None, f"font-size:{u(128)};", "counter", text)

def led(x, y, w, extra=""):
    h = w * 1254 / 1003
    return box(x, y, w, h, extra, "led", '<img src="assets/photo/selfie-led-red.png" alt="">')

def corners(x, y, w, h, t=8, l=70):
    s = ""
    for cx, cy, b in [(0, 0, "border-left:{t};border-top:{t};"), (1, 0, "border-right:{t};border-top:{t};"),
                      (0, 1, "border-left:{t};border-bottom:{t};"), (1, 1, "border-right:{t};border-bottom:{t};")]:
        bb = b.replace("{t}", f"{u(t)} solid #F5F5F5")
        s += box(x + cx * (w - l), y + cy * (h - l), l, l, bb)
    return s

def laser(x, y, w):
    return box(x, y, w, 6, "", "laser")

def grid(x, y, cw, ch, gap, depth=True):
    s = ""
    for i in range(9):
        cx, cy = i % 3, i // 3
        z = [0, 1, 0, 1, 0, 1, 0, 1, 0][i]
        sh = f"box-shadow:0 0 {u(30)} rgba(255,42,42,{0.45 if z else 0.15});" if depth else ""
        s += box(x + cx * (cw + gap), y + cy * (ch + gap), cw, ch, sh, "thumb",
                 f'<img src="assets/thumbs/found-{i+1}.png" alt="">')
    return s

def lines(fx, fy, x, y, cw, ch, gap):
    s = ""
    for i in range(9):
        cx, cy = i % 3, i // 3
        tx = x + cx * (cw + gap) + cw / 2
        ty = y + cy * (ch + gap) + ch / 2
        s += f'<line x1="{fx}" y1="{fy}" x2="{tx}" y2="{ty}"/>'
    return s

def svg(fmt, body):
    W, H = (1080, 1920) if fmt == "v" else (1920, 1080)
    return f'<svg class="abs full" viewBox="0 0 {W} {H}" preserveAspectRatio="none">{body}</svg>'

STAR = ('<svg viewBox="0 0 24 24" class="star"><g stroke="#D97757" stroke-width="2.6" stroke-linecap="round">'
        + "".join(f'<line x1="12" y1="12" x2="{12+10*__import__("math").cos(a*0.5236):.2f}" y2="{12+10*__import__("math").sin(a*0.5236):.2f}"/>' for a in range(12))
        + "</g></svg>")

CURSOR = ('<svg viewBox="0 0 24 24" class="cursor"><path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.2 L17.5 13.2 Z" '
          'fill="#fff" stroke="#000" stroke-width="1.2"/></svg>')

def cursor(x, y, halo=True):
    s = ""
    if halo:
        s += box(x - 38, y - 38, 76, 76, "", "halo")
    s += box(x - 4, y - 2, 44, 44, "", "", CURSOR)
    return s

ENV = ('<svg viewBox="0 0 64 48" class="env"><rect x="2" y="2" width="60" height="44" rx="5" fill="none" stroke="#F5F5F5" stroke-width="3.5"/>'
       '<path d="M4 6 L32 28 L60 6" fill="none" stroke="#F5F5F5" stroke-width="3.5" stroke-linejoin="round"/></svg>')

def panel(x, y, w, h, inner, tilt=""):
    return box(x, y, w, h, tilt, "panel", '<div class="dots3"><i></i><i></i><i></i></div>' + inner)

def pills(x, y, items, fmt, checked=None, wrap_w=None):
    s = '<div class="pills">'
    for n, t in items:
        on = checked is not None and n in checked
        s += f'<span class="pill{" on" if on else ""}"><b>{"✓" if on else n}</b>{t}</span>'
    s += "</div>"
    return box(x, y, wrap_w, None, "", "", s)

def chat_input(text, avatar=True, caret=True, w=None):
    th = '<div class="att"><img src="assets/photo/avatar-natural-256.png" alt=""></div>' if avatar else ""
    c = '<span class="caret"></span>' if caret else ""
    return (f'<div class="input">{th}<div class="itext">{text}{c}</div>'
            '<div class="ibar"><span class="plus">+</span><span class="model">Claude ▾</span><span class="send">↑</span></div></div>')

# ---------------------------------------------------------------- frames
def f1(fmt):
    if fmt == "v":
        b = led(160, 340, 760)
        b += corners(250, 360, 580, 600)
        b += laser(200, 640, 680)
    else:
        b = led(690, 150, 540)
        b += corners(750, 165, 420, 440, 7, 56)
        b += laser(720, 360, 480)
    return title(fmt, 'Claude peut retrouver <em>toutes tes photos</em>') + b + counter(fmt, '<span class="blur">?</span> PHOTOS')

def f2(fmt):
    if fmt == "v":
        fx, fy = 540, 560
        b = svg(fmt, f'<g class="ln">{lines(fx, fy, 141, 690, 250, 190, 24)}</g>')
        b += led(400, 330, 280)
        b += grid(141, 690, 250, 190, 24)
    else:
        b = svg(fmt, f'<g class="ln">{lines(560, 470, 820, 190, 300, 200, 24)}</g>')
        b += led(250, 200, 440)
        b += grid(820, 190, 300, 200, 24)
    return title(fmt, "J'ai testé sur moi : <em>9 endroits</em>") + b + counter(fmt, "9 ENDROITS")

PROMPT1 = ("<u>Analyse cette photo et liste chaque détail précis qui me rend reconnaissable</u>, "
           "pour que tu puisses m'identifier n'importe où en ligne.")
PROMPT2 = ("<u>Voici mon selfie, je m'appelle Abdoul Nasser Oumarou.</u> Utilise Chrome pour faire une "
           "<u>recherche d'image inversée</u> de mon visage, trouve <u>chaque endroit</u> où j'apparais en ligne "
           "et donne-moi le lien de chacun.")
P1 = [("1", "Ajoute ton selfie"), ("2", "Décris chaque détail"), ("3", "Ce qui te rend reconnaissable")]
P2 = [("1", "Selfie + nom"), ("2", "Recherche d'image inversée"), ("3", "Chaque endroit + le lien")]

def hello():
    return f'<div class="hello">{STAR}<span>Bonjour, Abdul</span></div><div class="me"><img src="assets/photo/avatar-natural-256.png" alt=""></div>'

def f3(fmt):
    if fmt == "v":
        p = panel(80, 340, 840, 760, hello() + chat_input(PROMPT1), "transform:perspective(1600px) rotateY(-8deg) rotateX(4deg);")
        p += pills(80, 1130, P1, fmt, wrap_w=840)
        p += cursor(160, 940, True)
    else:
        p = panel(400, 170, 1120, 640, hello() + chat_input(PROMPT1), "transform:perspective(2000px) rotateY(-6deg) rotateX(3deg);")
        p += pills(400, 840, P1, fmt, wrap_w=1120)
        p += cursor(470, 700, True)
    return title(fmt, "Étape 1 : <em>un selfie + un prompt</em>") + p

DESC = [("Cheveux", "Courts, noirs, coupe nette et dégradée."), ("Visage", "Ovale allongé, pommettes marquées."),
        ("Yeux", "Marron foncé, en amande, regard direct."), ("Barbe", "Fine et courte, sur la mâchoire et le menton."),
        ("Teint", "Foncé, uniforme."), ("Vêtements", "Chemise blanche col ouvert, blazer bleu marine."),
        ("Arrière-plan", "Fond gris dégradé de studio.")]

def desc_html(hl="Barbe", n=7):
    s = '<div class="resp"><h4>Description visuelle détaillée</h4>'
    for k, v in DESC[:n]:
        s += f'<p class="{"hl" if k == hl else ""}"><b>{k}</b> — {v}</p>'
    return s + "</div>"

def f4(fmt):
    bubble = '<div class="bubble"><img src="assets/photo/avatar-natural-256.png" alt="">Analyse cette photo et liste chaque détail…</div>'
    if fmt == "v":
        p = panel(80, 330, 840, 980, bubble + desc_html(), "transform:perspective(1600px) rotateY(6deg);")
    else:
        p = panel(420, 160, 1080, 760, bubble + desc_html(), "transform:perspective(2000px) rotateY(5deg);")
    return title(fmt, "Claude décrit <em>ton visage</em>") + p

def settings_html():
    side = "".join(f'<li class="{"act" if t == "Connecteurs" else ""}">{t}</li>' for t in
                   ["Général", "Compte", "Confidentialité", "Facturation", "Capacités", "Connecteurs"])
    cards = ('<div class="search">🔍 Chrome<span class="caret"></span></div>'
             '<div class="conn big"><div class="ci">◎</div><div><b>Claude in Chrome</b><small>Laisse Claude naviguer, lire les pages et remplir des formulaires dans Chrome.</small></div>'
             '<span class="btn">Installer</span></div>'
             '<div class="conn dim"><div class="ci">▣</div><div><b>Google Drive</b><small>Fichiers et dossiers</small></div></div>')
    return f'<div class="set"><ul>{side}</ul><div class="setmain"><h4>Connecteurs</h4>{cards}</div></div>'

def f5(fmt):
    ghost = '<span>L\'ASTUCE</span>'
    if fmt == "v":
        p = box(0, 1260, 1080, None, f"font-size:{u(150)};", "ghost", ghost)
        p += panel(60, 330, 880, 880, settings_html(), "transform:perspective(1600px) rotateY(-10deg) rotateX(3deg);")
        p += cursor(800, 760, True)
    else:
        p = panel(330, 160, 1260, 700, settings_html(), "transform:perspective(2000px) rotateY(-8deg) rotateX(3deg);")
        p += cursor(1400, 470, True)
        p += box(0, 880, 1920, None, f"font-size:{u(130)};", "ghost", ghost)
    return title(fmt, "L'astuce : <em>le connecteur Chrome</em>") + p

def f6(fmt):
    inner = '<div class="fadeup">' + desc_html(None, 5) + "</div>" + chat_input(PROMPT2)
    if fmt == "v":
        p = panel(80, 370, 840, 800, inner, "transform:perspective(1600px) rotateY(-7deg) rotateX(3deg);")
        p += pills(80, 1200, P2, fmt, wrap_w=840)
    else:
        p = panel(400, 160, 1120, 660, inner, "transform:perspective(2000px) rotateY(-6deg) rotateX(3deg);")
        p += pills(400, 845, P2, fmt, wrap_w=1120)
    return title(fmt, "Étape 2 : <em>ton visage + ton nom</em>") + p

PLACES = ["Page Facebook Abdoul Network", "TikTok @abdoulnetwork", "Instagram", "LinkedIn", "YouTube",
          "Chaîne WhatsApp AbdoulNetwork Lab", "Portfolio Abdoul Network", "Digital Abdoul Academy", "Boutique Chariow"]

def browser(i):
    return (f'<div class="brow"><div class="bbar"><i></i><i></i><i></i><span class="url"></span></div>'
            f'<div class="bbody"><div class="bq"><img src="assets/photo/avatar-natural-256.png" alt=""></div>'
            f'<div class="bres">' + "".join(f'<img src="assets/thumbs/found-{(i+k)%9+1}.png" alt="">' for k in range(6)) + "</div></div></div>")

def listing():
    s = '<div class="found"><p class="lead">J\'ai trouvé <b>9 endroits</b> où tu apparais :</p><ol>'
    for p in PLACES:
        s += f'<li><span>{p}</span><span class="lk"></span></li>'
    return s + "</ol></div>"

STEPS = [("1", "Selfie + nom"), ("2", "Chrome"), ("3", "Endroits"), ("4", "Liens")]

def f7(fmt):
    b = ""
    if fmt == "v":
        for k, (x, y, r) in enumerate([(120, 380, -9), (220, 350, -2), (330, 400, 6)]):
            b += box(x, y, 600, 400, f"transform:perspective(1400px) rotateY({-20+k*14}deg) rotate({r}deg);opacity:{0.55+k*0.2};", "", browser(k * 3))
        b += panel(100, 790, 820, 530, listing())
        b += pills(100, 1345, STEPS, fmt, checked={"1", "2", "3", "4"}, wrap_w=840)
    else:
        for k, (x, y, r) in enumerate([(130, 230, -8), (260, 200, -2), (390, 250, 5)]):
            b += box(x, y, 640, 430, f"transform:perspective(1400px) rotateY({-22+k*14}deg) rotate({r}deg);opacity:{0.55+k*0.2};", "", browser(k * 3))
        b += panel(1130, 160, 660, 690, listing())
        b += pills(130, 870, STEPS, fmt, checked={"1", "2", "3", "4"}, wrap_w=900)
    return title(fmt, "Claude ouvre <em>son propre navigateur</em>") + b

def f8(fmt):
    if fmt == "v":
        b = grid(111, 330, 270, 300, 24)
        b += led(380, 520, 320, "filter:drop-shadow(0 0 30px rgba(255,42,42,.6));")
    else:
        b = grid(450, 165, 320, 215, 24)
        b += led(800, 250, 320, "filter:drop-shadow(0 0 30px rgba(255,42,42,.6));")
    return title(fmt, "Le résultat fait <em>vraiment peur</em>") + b + counter(fmt, "9 ENDROITS")

DOC = ('<div class="doc"><div class="dh"><b>Demandes de retrait</b><span class="dn">3/9</span></div><pre>'
       "3. Instagram\n──────────────\nObjet : demande de retrait de photos\n\nBonjour,\n\nDes photos de moi sont publiées\n"
       "à cette adresse : instagram.com/…\nJe vous demande de les retirer,\nau nom de la protection de mes\n"
       "données personnelles.\n\nCordialement,\nAbdoul Nasser Oumarou</pre></div>")

def envgrid(x, y, cw, ch, gap):
    s = ""
    for i in range(9):
        cx, cy = i % 3, i // 3
        red = i % 2 == 0
        s += box(x + cx * (cw + gap), y + cy * (ch + gap), cw, ch, "", "envc" + (" red" if red else ""), ENV)
    return s

def f9(fmt):
    if fmt == "v":
        b = box(170, 330, 600, 560, "transform:perspective(1400px) rotateY(10deg) rotate(-2deg);", "", DOC)
        b += envgrid(200, 930, 210, 116, 24)
    else:
        b = box(260, 170, 620, 660, "transform:perspective(1400px) rotateY(16deg) rotate(-3deg);", "", DOC)
        b += envgrid(1050, 200, 210, 170, 28)
    return title(fmt, "Le bonus : <em>une demande de retrait</em> par site") + b + counter(fmt, "9 DEMANDES")

def wordmark():
    return ('<div class="wm"><div class="mark"><i></i><i></i><i></i><b></b></div>'
            '<div class="wt"><span>ABDOUL</span><span class="r">NETWORK</span></div></div>')

def searchbar():
    return '<div class="sbar"><span class="mag">⌕</span><span>@abdoulnetwork</span><span class="caret"></span><span class="sub">S\'abonner</span></div>'

def f10(fmt):
    if fmt == "v":
        b = box(140, 560, 800, 300, "", "", wordmark())
        b += box(110, 930, 860, 110, "", "", searchbar())
        b += led(470, 1080, 140)
    else:
        b = box(560, 250, 800, 300, "", "", wordmark())
        b += box(530, 600, 860, 110, "", "", searchbar())
        b += led(890, 760, 140)
    return title(fmt, "Abonne-toi pour <em>plus d'astuces IA</em>") + b

FRAMES = [
    ("01", "Accroche", "0.00–3.55", f1, "Combien de photos de toi traînent sur Internet ? Tu n'en as aucune idée.",
     "<b>Le mur LED s'allume de bas en haut</b>, le laser balaie le visage en volume, les coins se verrouillent sur « idée ». Caméra : dolly-in + orbite lente.", "→ recul caméra"),
    ("02", "Preuve", "3.55–6.80", f2, "J'ai testé sur moi-même, Claude m'a retrouvé à neuf endroits différents.",
     "<b>9 lignes lumineuses partent du visage</b> ; une carte floutée jaillit au bout de chacune. Le compteur roule 1 → 9 sur « neuf ».", "→ pan droite vers le panneau"),
    ("03", "Étape 1", "6.80–13.60", f3, "Étape une. Ouvre Claude. Ajoute un selfie et demande-lui de décrire chaque détail qui te rend reconnaissable.",
     "<b>Clic sur « + » (halo rouge)</b>, le selfie glisse dans le champ, le prompt se tape en direct ; les pastilles sortent du panneau en relief.", "→ le message monte"),
    ("04", "Description", "13.60–17.75", f4, "Il analyse tout. Ton visage, tes yeux, ta barbe, tes vêtements.",
     "<b>La réponse s'écrit</b> ; chaque rubrique s'allume sur son mot, « Barbe » se surligne en rouge.", "→ carton glitch"),
    ("05", "L'astuce", "17.75–24.15", f5, "Maintenant, l'astuce : va dans Paramètres, puis Connecteurs, cherche Chrome et installe Claude in Chrome.",
     "<b>« L'ASTUCE » traverse la caméra</b> (3D, glitch), puis le panneau pivote : Paramètres → Connecteurs → « Chrome » → Installer.", "→ le panneau pivote"),
    ("06", "Étape 2", "24.15–32.20", f6, "Étape deux. Renvoie ton selfie avec ton nom. Demande une recherche d'image inversée, chaque endroit où tu apparais, et tous les liens.",
     "<b>Le 2e prompt se tape en direct</b>, la description floutée derrière ; pastilles 1-2-3 sur les mots.", "→ envoi, le panneau recule"),
    ("07", "Navigateur", "32.20–37.00", f7, "Là, Claude ouvre son propre navigateur et cherche à ta place, site après site.",
     "<b>Éventail de fenêtres traversé par la caméra</b> ; les 4 étapes se cochent en rouge ; la liste des 9 endroits défile (liens floutés).", "→ la liste s'envole en 9 cartes"),
    ("08", "Choc", "37.00–39.65", f8, "Et franchement, le résultat fait peur.",
     "<b>Retour au visage entouré des 9 cartes</b> ; punch-in sur « peur », puis image tenue 0,4 s.", "→ carton glitch"),
    ("09", "Le bonus", "39.65–49.65", f9, "Le bonus : fais-lui rédiger une demande de retrait personnalisée pour chaque site où tu ne veux plus apparaître, au nom de la protection de tes données. Une par site, prête à envoyer.",
     "<b>« LE BONUS » traverse la caméra</b>, prompt tapé, le document défile, puis 9 enveloppes 3D s'envolent en grille avec rebond.", "→ plongée vers la fin"),
    ("10", "Abonne-toi", "49.65–56.00", f10, "Abonne-toi à Abdoul Network pour plus d'astuces IA comme celle-ci.",
     "<b>Le mot-symbole Abdoul Network se pose en 3D</b>, « @abdoulnetwork » se tape, mini-portrait LED ; la caméra ralentit jusqu'à l'arrêt.", "fin"),
]

CSS = r"""
@font-face{font-family:Inter;font-weight:400;src:url(assets/fonts/inter-latin-400-normal.woff2) format('woff2')}
@font-face{font-family:Inter;font-weight:500;src:url(assets/fonts/inter-latin-500-normal.woff2) format('woff2')}
@font-face{font-family:Inter;font-weight:600;src:url(assets/fonts/inter-latin-600-normal.woff2) format('woff2')}
@font-face{font-family:Inter;font-weight:700;src:url(assets/fonts/inter-latin-700-normal.woff2) format('woff2')}
@font-face{font-family:Inter;font-weight:800;src:url(assets/fonts/inter-latin-800-normal.woff2) format('woff2')}
@font-face{font-family:Inter;font-weight:900;src:url(assets/fonts/inter-latin-900-normal.woff2) format('woff2')}
@font-face{font-family:'Source Serif 4';font-weight:400;src:url(assets/fonts/source-serif-4-latin-400-normal.woff2) format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:500;src:url(assets/fonts/jetbrains-mono-latin-500-normal.woff2) format('woff2')}
:root{--red:#FF2A2A;--bg:#050505;--fg:#F5F5F5;--ui:#262624;--ui2:#30302E;--uit:#C2C0B6}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0d0d;color:#eee;font-family:Inter,system-ui,sans-serif;padding:40px 36px 60px}
header{display:flex;align-items:baseline;gap:18px;flex-wrap:wrap;margin-bottom:8px}
header h1{font-weight:900;font-size:34px;letter-spacing:-.02em}
header h1 em{font-style:normal;color:var(--red)}
.tag{font:500 13px/1 'JetBrains Mono',monospace;color:#aaa;border:1px solid #333;border-radius:99px;padding:7px 12px}
.dek{color:#aaa;font-size:15px;margin-bottom:28px;max-width:1100px}
.row{display:grid;grid-template-columns:minmax(0,9fr) minmax(0,32fr) minmax(0,15fr);gap:22px;align-items:start;margin-bottom:34px;padding-bottom:30px;border-bottom:1px solid #222}
.cell{position:relative;container-type:inline-size;overflow:hidden;border-radius:10px;background:var(--bg);box-shadow:0 0 0 1px #2a2a2a}
.cell.v{aspect-ratio:9/16}.cell.h{aspect-ratio:16/9}
.cell.v>.stage{--u:calc(100cqw/1080)}.cell.h>.stage{--u:calc(100cqw/1920)}
.stage{position:absolute;inset:0;font-family:Inter}
.stage::before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,42,42,.16) 28%,transparent 32%);background-size:calc(var(--u)*14) calc(var(--u)*14)}
.stage::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 45%,rgba(0,0,0,.85) 100%);pointer-events:none}
.abs{position:absolute}.full{inset:0;width:100%;height:100%}
.title{text-align:center;font-weight:900;line-height:1.08;letter-spacing:-.02em;color:var(--fg);z-index:5}
.title em{font-style:normal;color:var(--red)}
.counter{text-align:center;font-weight:900;color:var(--red);letter-spacing:-.01em;z-index:5;
  text-shadow:calc(var(--u)*-5) 0 rgba(0,220,255,.45),calc(var(--u)*5) 0 rgba(255,0,60,.6),0 0 calc(var(--u)*30) rgba(255,42,42,.55)}
.counter .blur{filter:blur(calc(var(--u)*6))}
.ghost{text-align:center;font-weight:900;color:var(--red);opacity:.9;z-index:6;letter-spacing:-.02em;
  text-shadow:calc(var(--u)*-8) 0 rgba(0,220,255,.5),calc(var(--u)*8) 0 rgba(255,0,60,.6);transform:skewX(-6deg)}
.led img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 calc(var(--u)*24) rgba(255,42,42,.45))}
.laser{background:linear-gradient(90deg,transparent,var(--red) 15%,#fff 50%,var(--red) 85%,transparent);box-shadow:0 0 calc(var(--u)*30) calc(var(--u)*8) rgba(255,42,42,.6)}
.thumb{border-radius:calc(var(--u)*10);overflow:hidden;outline:calc(var(--u)*2) solid rgba(255,255,255,.12)}
.thumb img{width:100%;height:100%;object-fit:cover;display:block}
.ln line{stroke:rgba(255,42,42,.6);stroke-width:2.2;stroke-dasharray:6 6}
.halo{border-radius:50%;background:radial-gradient(circle,rgba(255,42,42,.65),rgba(255,42,42,0) 70%);border:calc(var(--u)*3) solid rgba(255,42,42,.9)}
.cursor{width:100%;height:100%}
.panel{background:var(--ui);border-radius:calc(var(--u)*26);border:calc(var(--u)*2) solid #3a3a37;padding:calc(var(--u)*58) calc(var(--u)*44) calc(var(--u)*40);
  box-shadow:0 calc(var(--u)*40) calc(var(--u)*90) rgba(0,0,0,.7),0 0 0 calc(var(--u)*1) rgba(255,42,42,.15);color:var(--uit);display:flex;flex-direction:column;justify-content:flex-end;gap:calc(var(--u)*26);overflow:hidden}
.dots3{position:absolute;left:calc(var(--u)*24);top:calc(var(--u)*22);display:flex;gap:calc(var(--u)*10)}
.dots3 i{width:calc(var(--u)*16);height:calc(var(--u)*16);border-radius:50%;background:#4a4a46}
.hello{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*18);font-family:'Source Serif 4',serif;font-size:calc(var(--u)*58);color:#EDEBE3;margin-bottom:auto;margin-top:calc(var(--u)*120)}
.star{width:calc(var(--u)*52);height:calc(var(--u)*52)}
.me{position:absolute;right:calc(var(--u)*26);top:calc(var(--u)*16);width:calc(var(--u)*54);height:calc(var(--u)*54);border-radius:50%;overflow:hidden}
.me img{width:100%;height:100%}
.input{background:var(--ui2);border:calc(var(--u)*2) solid #45453F;border-radius:calc(var(--u)*24);padding:calc(var(--u)*24)}
.att{width:calc(var(--u)*110);height:calc(var(--u)*110);border-radius:calc(var(--u)*14);overflow:hidden;margin-bottom:calc(var(--u)*16);outline:calc(var(--u)*2) solid #555}
.att img{width:100%;height:100%}
.itext{font-size:calc(var(--u)*30);line-height:1.38;color:#EDEBE3}
.itext u{text-decoration-color:var(--red);text-decoration-thickness:calc(var(--u)*3);text-underline-offset:calc(var(--u)*6)}
.caret{display:inline-block;width:calc(var(--u)*3);height:1em;background:#EDEBE3;vertical-align:-.15em;margin-left:calc(var(--u)*3)}
.ibar{display:flex;align-items:center;gap:calc(var(--u)*16);margin-top:calc(var(--u)*20);font-size:calc(var(--u)*24)}
.plus{width:calc(var(--u)*48);height:calc(var(--u)*48);border-radius:calc(var(--u)*12);border:calc(var(--u)*2) solid #555;display:grid;place-items:center;font-size:calc(var(--u)*32)}
.model{margin-left:auto;color:#999}
.send{width:calc(var(--u)*52);height:calc(var(--u)*52);border-radius:calc(var(--u)*12);background:#D97757;color:#fff;display:grid;place-items:center;font-weight:700}
.pills{display:flex;flex-wrap:wrap;gap:calc(var(--u)*14);justify-content:center}
.pill{display:flex;align-items:center;gap:calc(var(--u)*12);background:#1c1c1b;border:calc(var(--u)*2) solid #3a3a37;border-radius:calc(var(--u)*16);padding:calc(var(--u)*14) calc(var(--u)*22);font-size:calc(var(--u)*27);font-weight:600;color:#eee;
  box-shadow:0 calc(var(--u)*14) calc(var(--u)*24) rgba(0,0,0,.6)}
.pill b{width:calc(var(--u)*40);height:calc(var(--u)*40);border-radius:50%;background:#333;display:grid;place-items:center;font-size:calc(var(--u)*22)}
.pill.on{border-color:var(--red)}.pill.on b{background:var(--red);color:#fff}
.bubble{align-self:flex-end;display:flex;gap:calc(var(--u)*14);align-items:center;background:var(--ui2);border-radius:calc(var(--u)*18);padding:calc(var(--u)*14) calc(var(--u)*20);font-size:calc(var(--u)*24);color:#ddd;max-width:85%}
.bubble img{width:calc(var(--u)*64);height:calc(var(--u)*64);border-radius:calc(var(--u)*8)}
.resp{font-size:calc(var(--u)*27);line-height:1.4;color:#D6D4CB}
.resp h4{font-size:calc(var(--u)*36);color:#fff;margin-bottom:calc(var(--u)*14);font-weight:700}
.resp p{padding:calc(var(--u)*6) calc(var(--u)*10);border-radius:calc(var(--u)*8)}
.resp b{color:#fff}
.resp p.hl{background:rgba(255,42,42,.22);box-shadow:inset calc(var(--u)*5) 0 0 var(--red)}
.fadeup{opacity:.28;filter:blur(calc(var(--u)*2));margin-bottom:auto}
.set{display:flex;gap:calc(var(--u)*30);height:100%;font-size:calc(var(--u)*27)}
.set ul{list-style:none;width:32%;display:flex;flex-direction:column;gap:calc(var(--u)*8);padding-top:calc(var(--u)*10)}
.set li{padding:calc(var(--u)*12) calc(var(--u)*16);border-radius:calc(var(--u)*10);color:#aaa}
.set li.act{background:#3a3a37;color:#fff;box-shadow:inset calc(var(--u)*5) 0 0 var(--red)}
.setmain{flex:1;display:flex;flex-direction:column;gap:calc(var(--u)*20)}
.setmain h4{font-size:calc(var(--u)*38);color:#fff}
.search{background:var(--ui2);border:calc(var(--u)*2) solid var(--red);border-radius:calc(var(--u)*14);padding:calc(var(--u)*16) calc(var(--u)*20);color:#fff}
.conn{display:flex;gap:calc(var(--u)*18);align-items:center;background:#2d2d2b;border:calc(var(--u)*2) solid #45453F;border-radius:calc(var(--u)*16);padding:calc(var(--u)*20)}
.conn small{display:block;color:#999;font-size:calc(var(--u)*21);margin-top:calc(var(--u)*6);line-height:1.3}
.conn b{color:#fff}
.conn.dim{opacity:.35}
.ci{flex:none;width:calc(var(--u)*64);height:calc(var(--u)*64);border-radius:calc(var(--u)*14);background:#3a3a37;display:grid;place-items:center;color:#fff;font-size:calc(var(--u)*34)}
.btn{margin-left:auto;flex:none;background:var(--red);color:#fff;font-weight:700;border-radius:calc(var(--u)*12);padding:calc(var(--u)*14) calc(var(--u)*22)}
.brow{width:100%;height:100%;background:#f4f4f2;border-radius:calc(var(--u)*16);overflow:hidden;box-shadow:0 calc(var(--u)*30) calc(var(--u)*60) rgba(0,0,0,.7)}
.bbar{height:calc(var(--u)*50);background:#ddd;display:flex;align-items:center;gap:calc(var(--u)*8);padding:0 calc(var(--u)*16)}
.bbar i{width:calc(var(--u)*13);height:calc(var(--u)*13);border-radius:50%;background:#aaa}
.url{flex:1;height:calc(var(--u)*24);background:#fff;border-radius:calc(var(--u)*12);margin-left:calc(var(--u)*12)}
.bbody{display:flex;gap:calc(var(--u)*16);padding:calc(var(--u)*18)}
.bq{width:32%;aspect-ratio:1;border-radius:calc(var(--u)*10);overflow:hidden;outline:calc(var(--u)*4) solid var(--red)}
.bq img{width:100%;height:100%}
.bres{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--u)*8)}
.bres img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:calc(var(--u)*6);filter:blur(calc(var(--u)*1.5))}
.found{font-size:calc(var(--u)*26);color:#D6D4CB}
.found .lead{color:#fff;margin-bottom:calc(var(--u)*14)}.found .lead b{color:var(--red)}
.found ol{padding-left:calc(var(--u)*40);display:flex;flex-direction:column;gap:calc(var(--u)*8)}
.found li{line-height:1.25}
.found li span:first-child{color:#fff;font-weight:600}
.lk{display:inline-block;width:calc(var(--u)*150);height:calc(var(--u)*14);margin-left:calc(var(--u)*12);border-radius:calc(var(--u)*7);background:linear-gradient(90deg,rgba(255,42,42,.7),rgba(255,42,42,.15));filter:blur(calc(var(--u)*2))}
.doc{width:100%;height:100%;background:#1b1b1a;border:calc(var(--u)*2) solid #45453F;border-radius:calc(var(--u)*18);padding:calc(var(--u)*30);box-shadow:0 calc(var(--u)*30) calc(var(--u)*60) rgba(0,0,0,.7);overflow:hidden}
.dh{display:flex;justify-content:space-between;align-items:center;font-size:calc(var(--u)*30);color:#fff;margin-bottom:calc(var(--u)*20)}
.dn{background:var(--red);border-radius:calc(var(--u)*8);padding:calc(var(--u)*4) calc(var(--u)*12);font-size:calc(var(--u)*24)}
.doc pre{font:500 calc(var(--u)*22)/1.45 'JetBrains Mono',monospace;color:#c9c7bd;white-space:pre-wrap}
.envc{display:grid;place-items:center;border-radius:calc(var(--u)*14);background:#151515;outline:calc(var(--u)*2) solid #333;box-shadow:0 calc(var(--u)*18) calc(var(--u)*30) rgba(0,0,0,.6)}
.envc.red{background:#b3161a}
.env{width:58%}
.wm{display:flex;align-items:center;gap:calc(var(--u)*34);justify-content:center;height:100%}
.mark{position:relative;width:calc(var(--u)*170);height:calc(var(--u)*170);flex:none}
.mark i{position:absolute;width:calc(var(--u)*44);height:calc(var(--u)*44);border-radius:50%;background:var(--red);box-shadow:0 0 calc(var(--u)*30) rgba(255,42,42,.8)}
.mark i:nth-child(1){left:calc(var(--u)*63);top:0}.mark i:nth-child(2){left:0;bottom:calc(var(--u)*6)}.mark i:nth-child(3){right:0;bottom:calc(var(--u)*6)}
.mark b{position:absolute;inset:calc(var(--u)*22);border:calc(var(--u)*7) solid #F5F5F5;clip-path:polygon(50% 0,100% 100%,0 100%);background:transparent}
.wt{display:flex;flex-direction:column;font-weight:900;font-size:calc(var(--u)*92);line-height:.92;letter-spacing:-.02em;color:#fff}
.wt .r{color:var(--red)}
.sbar{height:100%;display:flex;align-items:center;gap:calc(var(--u)*18);background:#fff;border-radius:calc(var(--u)*55);padding:0 calc(var(--u)*14) 0 calc(var(--u)*36);font-size:calc(var(--u)*44);font-weight:700;color:#111;
  box-shadow:0 0 0 calc(var(--u)*5) var(--red),0 0 calc(var(--u)*60) rgba(255,42,42,.5)}
.sbar .caret{background:#111}
.mag{font-size:calc(var(--u)*50);color:#555}
.sub{margin-left:auto;background:var(--red);color:#fff;border-radius:calc(var(--u)*44);padding:calc(var(--u)*20) calc(var(--u)*30);font-size:calc(var(--u)*32)}
.notes{font-size:14px;line-height:1.5;color:#bbb}
.notes .lbl{display:flex;justify-content:space-between;font:600 12px/1 'JetBrains Mono',monospace;color:#888;margin-bottom:12px;letter-spacing:.04em}
.notes .lbl b{color:#fff}
.notes .vo{color:#fff;font-size:15px;border-left:3px solid var(--red);padding-left:10px;margin-bottom:12px;font-style:italic}
.notes p b{color:#fff}
.chip{display:inline-block;margin-top:12px;font:600 12px/1 'JetBrains Mono',monospace;background:#1d1d1d;border:1px solid #333;border-radius:99px;padding:6px 10px;color:#ff6b6b}
.colh{display:grid;grid-template-columns:minmax(0,9fr) minmax(0,32fr) minmax(0,15fr);gap:22px;font:600 12px/1 'JetBrains Mono',monospace;color:#777;margin-bottom:12px;letter-spacing:.06em}
.tokens{display:flex;gap:28px;flex-wrap:wrap;align-items:center;font-size:14px;color:#bbb;margin-top:10px}
.sw{display:inline-flex;align-items:center;gap:8px}.sw i{width:22px;height:22px;border-radius:5px;display:inline-block;border:1px solid #333}
"""

def build():
    rows = []
    for nid, name, t, fn, vo, note, seam in FRAMES:
        rows.append(f'''<section class="row" id="frame-{nid}">
<div class="cell v"><div class="stage">{fn("v")}</div></div>
<div class="cell h"><div class="stage">{fn("h")}</div></div>
<div class="notes"><div class="lbl"><b>{nid} · {name.upper()}</b><span>{t} s</span></div>
<div class="vo">« {vo} »</div><p>{note}</p><span class="chip">{seam}</span></div>
</section>''')
    html = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Storyboard v1 — Claude retrouve tes photos</title><style>{CSS}</style></head><body>
<header><h1>Claude retrouve <em>tes photos</em> — storyboard v1</h1><span class="tag">1080×1920 + 1920×1080 · 60 fps · 56 s · 10 scènes</span></header>
<p class="dek">Abdoul Network · @abdoulnetwork — chaque scène dessinée dans les deux formats, avec le vrai texte, les vraies couleurs et tes photos. Images fixes : le mouvement 3D (caméra continue, relief, flou de mouvement) arrive à la construction.</p>
<div class="colh"><span>VERTICAL 9:16</span><span>PAYSAGE 16:9</span><span>VOIX · MOUVEMENT · TRANSITION</span></div>
{"".join(rows)}
<div class="tokens"><span class="sw"><i style="background:#050505"></i>#050505 fond</span><span class="sw"><i style="background:#FF2A2A"></i>#FF2A2A accent unique</span>
<span class="sw"><i style="background:#F5F5F5"></i>#F5F5F5 texte</span><span class="sw"><i style="background:#262624"></i>#262624 UI Claude</span>
<span>Inter 900 titres · Inter UI · Source Serif 4 « Bonjour » · JetBrains Mono document</span>
<span>Interdits : coupe sèche, diaporama, logo TikTok/Google, URL complète, visage retouché</span></div>
</body></html>'''
    open(OUT, "w").write(html)

build()
