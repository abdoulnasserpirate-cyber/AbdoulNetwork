"""Build the word-level timing table from voice segments (silencedetect -40 dB)
and the exact script. Words inside a segment are spread by syllable weight."""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
SEG = [  # (start, end, text) — speech islands between detected pauses
 (0.09, 2.12, "Tu vends des produits, mais tes publications ne font aucune"),
 (2.21, 2.79, "vue ?"),
 (3.42, 8.12, "Avec une seule photo de ton produit, l'intelligence artificielle peut te créer une vraie vidéo pub."),
 (8.58, 9.53, "Pas besoin de caméra,"),
 (9.64, 10.77, "pas besoin de monteur."),
 (11.18, 11.64, "Étape un :"),
 (12.21, 15.19, "télécharge l'application Kling AI et crée ton compte."),
 (15.68, 16.86, "Tu as des crédits gratuits"),
 (16.97, 17.60, "pour commencer."),
 (18.04, 18.60, "Étape deux :"),
 (18.95, 19.58, "appuie sur"),
 (19.78, 20.94, "« Image vers vidéo »"),
 (21.26, 22.70, "et ajoute la photo de ton produit."),
 (23.38, 24.50, "Prends une photo nette,"),
 (24.72, 25.88, "avec un fond propre."),
 (26.39, 27.79, "C'est ça qui fait la différence."),
 (28.21, 28.87, "Étape trois,"),
 (29.18, 30.31, "la plus importante :"),
 (30.58, 32.17, "décris le mouvement que tu veux."),
 (32.93, 33.57, "Par exemple :"),
 (33.80, 35.89, "le produit tourne lentement sur lui-même,"),
 (36.45, 37.46, "lumière de studio,"),
 (38.10, 38.67, "gouttes d'eau"),
 (38.91, 39.96, "qui tombent autour,"),
 (40.48, 41.08, "style"),
 (41.19, 42.42, "publicité de luxe."),
 (42.87, 43.85, "Tu lances la génération…"),
 (44.32, 45.36, "et regarde le résultat."),
 (45.88, 48.00, "Ta simple photo est devenue une vidéo pub."),
 (48.54, 49.16, "Étape quatre :"),
 (49.46, 50.34, "ajoute ton prix,"),
 (50.48, 51.51, "ton numéro WhatsApp"),
 (51.73, 53.02, "et une musique dans CapCut."),
 (53.45, 54.45, "C'est prêt à poster."),
 (55.03, 56.04, "Et si tu maîtrises ça,"),
 (56.12, 58.36, "tu peux même le vendre aux commerçants autour de toi."),
 (59.15, 59.53, "Écris"),
 (59.61, 60.17, "« VIDÉO » en commentaire"),
 (60.46, 62.69, "pour d'autres astuces comme celle-ci."),
 (63.52, 64.69, "Enregistre cette vidéo,"),
 (64.84, 65.51, "et abonne-toi."),
]
def syl(w):
    w = w.lower().replace("ai", "a").replace("au", "o").replace("eau", "o").replace("ou", "u")
    w = re.sub(r"e(s|nt)?$", "", w) if len(w) > 3 else w
    n = len(re.findall(r"[aeiouyéèêàâîïôûù]+", w))
    return max(1, n)
words = []
for s, e, text in SEG:
    toks = [t for t in re.split(r"\s+", text) if re.search(r"\w", t)]
    ws = [syl(re.sub(r"[^\wÀ-ÿ'-]", "", t)) + 0.6 for t in toks]
    tot = sum(ws); t = s
    for tok, w in zip(toks, ws):
        d = (e - s) * w / tot
        words.append({"w": re.sub(r"[^\wÀ-ÿ'-]", "", tok), "s": round(t, 2), "e": round(t + d, 2)})
        t += d
json.dump({"segments": [{"s": s, "e": e, "text": t} for s, e, t in SEG], "words": words},
          open(os.path.join(HERE, "..", "timing.json"), "w"), ensure_ascii=False, indent=1)
with open(os.path.join(HERE, "..", "TIMING.md"), "w") as f:
    f.write("# Table de timing (voix-off.mp3, 65,9 s)\n\nSegments de parole (silencedetect -40 dB / 0,08 s) alignés sur le texte exact. Mots répartis par poids syllabique dans chaque segment.\n\n| # | Début | Fin | Phrase |\n|---|---|---|---|\n")
    for i, (s, e, t) in enumerate(SEG, 1):
        f.write(f"| {i} | {s:.2f} | {e:.2f} | {t} |\n")
print(len(words), "words")
