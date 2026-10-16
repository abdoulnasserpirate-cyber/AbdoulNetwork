"""Single source of truth for the film's picture timeline (program seconds).

Modes:
  A  presenter panel centred, ambient blurred photo behind
  BL presenter panel left, photo panel right   (BR = mirrored)
  C  full-frame photo, presenter picture-in-picture (corner given by pip: 'br' | 'bl')
  D  full-frame photo / title only (presenter hidden), cinema bars
Each shot: start, end, mode, photo (assets/photos/<photo>.jpg), optional kb (Ken Burns origin),
label/caption/kinetic overlays, sfx cue names (used by make_audio.py).
"""

DURATION = 91.52

SHOTS = [
    dict(id="title", start=0.0, end=2.75, mode="D", photo="constantine", kb="50% 60%", title=True, sfx=["boom"]),
    dict(id="hello", start=2.75, end=6.52, mode="A", photo="ouidah_museum",
         lower_third=dict(at=4.15, out=9.9, name="AMOUSSOU HOUNGBEDJI Marie Marthe",
                          role="Étudiante béninoise · Université Dan Dicko Dankoulodo de Maradi")),
    dict(id="benin", start=6.52, end=7.62, mode="BL", photo="ouidah_museum", kb="40% 50%",
         label=dict(at=6.58, big="BÉNIN", small="Musée d'Histoire de Ouidah"), sfx=["whoosh"]),
    dict(id="niger", start=7.62, end=12.05, mode="BL", photo="niamey", kb="50% 50%",
         label=dict(at=7.7, big="NIGER", small="Niamey"),
         map=dict(at=10.4, file="niger", point="pt-maradi", name="Maradi",
                  sub="Université Dan Dicko Dankoulodo"), sfx=["whoosh"]),
    dict(id="story-of", start=12.05, end=14.75, mode="C", pip="br", photo="algiers_harbour", kb="30% 50%",
         caption="Alger, vers 1899", sfx=["whoosh"]),
    dict(id="baya-title", start=14.75, end=16.45, mode="D", photo="algiers_terrace", kb="20% 40%",
         big_title=dict(at=14.85, name="BAYA MAHIEDDINE", years="1931 – 1998"), sfx=["hit"]),
    dict(id="french", start=16.45, end=18.95, mode="A", photo="algiers_terrace"),
    dict(id="algerienne", start=18.95, end=21.45, mode="BR", photo="algiers_terrace", kb="15% 45%",
         label=dict(at=19.1, big="ALGÉRIE", small="Alger, vers 1899 · photochrome"), sfx=["whoosh"]),
    dict(id="orpheline", start=21.45, end=24.3, mode="D", photo="embroidery_school", kb="50% 55%",
         kinetic=[dict(at=21.5, out=22.2, text="ORPHELINE"), dict(at=22.22, out=24.25, text="AUTODIDACTE")],
         caption="École de broderie arabe, Alger, vers 1899", sfx=["whoosh"]),
    dict(id="peinture", start=24.3, end=26.22, mode="C", pip="bl", photo="child_painting", kb="70% 40%",
         kinetic=[dict(at=24.4, out=26.2, text="UN AMOUR INTENSE", small=True)], sfx=["brush"]),
    dict(id="couleurs", start=26.22, end=27.25, mode="D", photo="paint_bottles", kb="50% 50%", word="LES COULEURS", sfx=["tick"]),
    dict(id="fleurs", start=27.25, end=28.05, mode="D", photo="delacroix_flowers", kb="50% 50%", word="LES FLEURS", sfx=["tick"]),
    dict(id="oiseaux", start=28.05, end=28.7, mode="D", photo="hoopoe", kb="55% 45%", word="LES OISEAUX", sfx=["tick"]),
    dict(id="jardins", start=28.7, end=30.38, mode="D", photo="rose_garden", kb="50% 60%", word="LES JARDINS", sfx=["tick"]),
    dict(id="langage", start=30.38, end=32.92, mode="C", pip="br", photo="girls_flower_paintings", kb="45% 55%", sfx=["whoosh"]),
    dict(id="formation", start=32.92, end=35.15, mode="BL", photo="classroom_archive", kb="50% 50%",
         kinetic=[dict(at=33.0, out=35.1, text="SANS FORMATION CLASSIQUE", small=True, strike=33.9)], sfx=["whoosh"]),
    dict(id="imagination", start=35.15, end=37.35, mode="A", photo="kingfisher"),
    dict(id="univers", start=37.35, end=40.6, mode="D", mosaic=["kingfisher", "matisse_anemones", "bulbul", "lavender", "king_parrot", "flowers_oil"],
         kinetic=[dict(at=38.4, out=40.55, text="UN UNIVERS LIBRE", small=False)], sfx=["shimmer"]),
    dict(id="1947", start=40.6, end=44.45, mode="D", photo="paris_1950_eiffel", kb="50% 35%", bw=True,
         counter=dict(at=40.95, frm=1931, to=1947, dur=1.1, age_at=43.75, age="16 ANS"), sfx=["boom"]),
    dict(id="expo", start=44.45, end=46.38, mode="C", pip="bl", photo="paris_vintage_street", kb="50% 45%", bw=True,
         label=dict(at=44.6, big="PARIS · 1947", small="Exposition à la Galerie Maeght"), sfx=["whoosh"]),
    dict(id="breton", start=46.38, end=47.62, mode="C", pip="bl", photo="breton_1938", kb="78% 35%", bw=True, zoom=1.6,
         label=dict(at=46.45, big="ANDRÉ BRETON", small="à droite · avec D. Rivera et L. Trotsky, 1938"), sfx=["click"]),
    dict(id="picasso", start=47.62, end=48.62, mode="C", pip="bl", photo="picasso_selfportrait", kb="50% 35%",
         label=dict(at=47.66, big="PABLO PICASSO", small="autoportrait au fusain"), sfx=["click"]),
    dict(id="chapter", start=48.62, end=50.25, mode="D", photo="museum_visitor", blur=True,
         chapter=dict(at=48.7, text="WHY THIS STORY MATTERS", sub="Pourquoi cette histoire compte"), sfx=["whoosh", "hit"]),
    dict(id="why", start=50.25, end=59.32, mode="A", photo="museum_visitor",
         kinetic=[dict(at=57.15, out=59.2, text="AIMER", small=False)]),
    dict(id="ca1", start=59.32, end=60.15, mode="C", pip="br", photo="couple_hands", kb="50% 45%", sfx=["tick"]),
    dict(id="ca2", start=60.15, end=60.95, mode="C", pip="br", photo="bridal_roses", kb="50% 50%", sfx=["tick"]),
    dict(id="ca3", start=60.95, end=61.6, mode="C", pip="br", photo="candle_love", kb="50% 50%", sfx=["tick"]),
    dict(id="ca4", start=61.6, end=63.0, mode="C", pip="br", photo="wedding_bw", kb="50% 40%", sfx=["tick"]),
    dict(id="ca5", start=63.0, end=64.02, mode="C", pip="br", photo="candle_table", kb="50% 50%", fade_gray=63.45, sfx=["tick"]),
    dict(id="gout", start=64.02, end=68.12, mode="BR", photo="kid_paints_floor", kb="50% 50%",
         label=dict(at=66.5, big="LE GOÛT DE VIVRE", small=""), sfx=["whoosh"]),
    dict(id="esprit", start=68.12, end=69.4, mode="BR", photo="book_achebe", kb="50% 50%",
         label=dict(at=68.2, big="L'ESPRIT", small="Chinua Achebe, « Things Fall Apart »"), sfx=["page"]),
    dict(id="avenir", start=69.4, end=72.35, mode="BR", photo="students_campus", kb="50% 60%",
         label=dict(at=69.5, big="L'AVENIR", small=""), sfx=["whoosh"]),
    dict(id="histoire-baya", start=72.35, end=76.55, mode="BL", photo="algiers_terrace", kb="20% 40%",
         label=dict(at=72.9, big="BAYA MAHIEDDINE", small="1931 – 1998"), sfx=["whoosh"]),
    dict(id="profond", start=76.55, end=78.42, mode="A", photo="algiers_terrace",
         kinetic=[dict(at=76.6, out=78.35, text="CE QUE NOUS AIMONS PROFONDÉMENT", small=True)]),
    dict(id="passion", start=78.42, end=83.5, mode="C", pip="bl", photo="museum_visitor", kb="45% 40%",
         kinetic=[dict(at=79.8, out=83.4, text="UNE PASSION DÉMESURÉE", small=True)], sfx=["whoosh"]),
    dict(id="heritage", start=83.5, end=87.0, mode="D", photo="museum_hall", kb="50% 45%", dim=True,
         heritage=dict(at=83.6, words=[("UN HÉRITAGE", 83.62), ("QUI NOUS", 85.45), ("SURVIVRA", 85.85)]), sfx=["swell"]),
    dict(id="merci", start=87.0, end=88.55, mode="A", photo="museum_hall"),
    dict(id="outro", start=88.55, end=91.52, mode="D", photo="constantine", blur=True, outro=True, sfx=["boom"]),
]

# Punch-in alternation at every hard cut inside the presenter footage (program times of segment starts).
PUNCH_SCALE = 1.12
