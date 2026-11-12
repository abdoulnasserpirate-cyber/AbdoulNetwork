"""Sous-titres mot par mot depuis la transcription Whisper (audio/transcription-whisper.json).
Corrige l'orthographe des noms et chiffres, applique le décalage de la voix, écrit compositions/captions.html
et transcript.json (timings du film)."""
import json, re
OFFSET = 0.9   # la voix démarre à 0.9 s (sonnerie avant)
w = json.load(open("audio/transcription-whisper.json"))
words = []
i = 0
while i < len(w):
    t, s, e = w[i]["text"], w[i]["start"], w[i]["end"]
    nxt = w[i + 1]["text"] if i + 1 < len(w) else ""
    if t == "l" and nxt.startswith("'alesive"):
        words += [("la", s, s + 0.1), ("lessive,", s + 0.12, w[i + 1]["end"])]; i += 2; continue
    if t == "s" and nxt == "'en":
        words.append(("s'en", s, w[i + 1]["end"])); i += 2; continue
    if t == "Multi" and nxt.startswith("-Service"):
        words.append(("Multi-Services" + nxt[len("-Service"):], s, w[i + 1]["end"])); i += 2; continue
    if t == "week" and nxt.startswith("-end"):
        words.append(("week-end" + nxt[4:], s, w[i + 1]["end"])); i += 2; continue
    t = {"1000": "1 000", "?": None}.get(t, t)
    if t is None:   # point d'interrogation isolé → collé au mot précédent
        words[-1] = (words[-1][0] + " ?", words[-1][1], e); i += 1; continue
    words.append((t, s, e)); i += 1
# l'ouverture : « régler » + « ? » ; corrections de casse
words = [(t.replace("Allô", "Allô"), round(s + OFFSET, 3), round(e + OFFSET, 3)) for t, s, e in words]
# groupes de sens (2 à 4 mots), choisis à la main pour un rythme de slogan
SIZES = [2, 3, 4, 4, 2, 2, 2, 3, 2, 2, 2, 3, 3, 3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 2, 4, 3, 3, 3, 3, 3, 4, 2, 3, 3]
assert sum(SIZES) == len(words), (sum(SIZES), len(words))
groups, k = [], 0
for n in SIZES:
    groups.append(words[k:k + n]); k += n
# le numéro : un seul groupe « 74 58 18 24 »
json.dump([{"id": f"w{n}", "text": t, "start": s, "end": e} for n, (t, s, e) in enumerate(words)],
          open("transcript.json", "w"), ensure_ascii=False, indent=1)
html_groups, js = [], []
for g_i, g in enumerate(groups):
    gs = round(max(0.1, g[0][1] - 0.08), 3)
    nxt_start = groups[g_i + 1][0][1] - 0.08 if g_i + 1 < len(groups) else 37.3
    ge = round(min(max(g[-1][2] + 0.35, g[-1][2]), nxt_start), 3)
    spans = " ".join(f'<span class="cw" data-t="{s}">{t}</span>' for t, s, e in g)
    html_groups.append(f'      <div class="cg clip" id="cg{g_i}" data-start="{gs}" data-duration="{round(ge - gs, 3)}"><div class="cbox">{spans}</div></div>')
html = '''<template>
  <style>
    #root { position: absolute; inset: 0; width: 100% !important; height: 100% !important; overflow: visible;
      container-type: size; container-name: sc; font-family: var(--font); pointer-events: none; }
    .cg { position: absolute; left: 0; right: 0; bottom: 6.6%; display: flex; justify-content: center; }
    .cbox { background: rgba(6, 18, 58, 0.88); border-radius: .32em; padding: .16em .5em .2em; font-size: 2.7cqw; font-weight: 800;
      color: #fff; white-space: nowrap; box-shadow: 0 .12em .4em rgba(0,0,0,.25); }
    .cw { display: inline-block; margin: 0 .07em; }
    @container sc (orientation: portrait) {
      .cg { bottom: auto; top: 70.4%; }
      .cbox { font-size: 5.4cqw; }
    }
  </style>
  <div id="root" data-composition-id="captions">
''' + "\n".join(html_groups) + '''
  </div>
  <script>
    (function () {
      const R = document.querySelector('[data-composition-id="captions"]');
      const tl = gsap.timeline({ paused: true });
      R.querySelectorAll(".cg").forEach((g) => {
        const s = +g.dataset.start, e = s + +g.dataset.duration;
        const box = g.querySelector(".cbox");
        tl.fromTo(box, { y: 18, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.16, ease: "back.out(2)" }, s);
        g.querySelectorAll(".cw").forEach((w) => {
          const t = +w.dataset.t;
          tl.fromTo(w, { color: "#ffffff", scale: 1 }, { color: "#ffc814", scale: 1.06, duration: 0.08, ease: "power2.out" }, Math.max(s, t - 0.02));
          tl.to(w, { scale: 1, duration: 0.14, ease: "power2.out" }, Math.max(s, t + 0.08));
        });
        tl.to(box, { opacity: 0, duration: 0.1, ease: "power2.in" }, e - 0.1);
        tl.set(box, { opacity: 0 }, e);
      });
      window.__timelines["captions"] = tl;
    })();
  </script>
</template>
'''
open("compositions/captions.html", "w").write(html)
for g in groups: print(round(g[0][1], 2), " ".join(t for t, s, e in g))
