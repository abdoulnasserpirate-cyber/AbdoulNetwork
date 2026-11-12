"""Corrige l'orthographe de la transcription ASR et recale les timestamps (latence du modèle streaming)."""
import json
OFFSET = 0.34
w = json.load(open('tmp/asr.json'))['words']
for x in w:
    x['start'] = round(max(0.0, x['start'] - OFFSET), 3); x['end'] = round(max(0.05, x['end'] - OFFSET), 3)
up = [x['text'] for x in w]
# (séquence ASR) -> mots corrigés ; les fusions/séparations conservent les bornes temporelles
RULES = [
 (["VOTRE","COLIS","ARRIVE","DU","NIGERIA","OU","D'UN","AUTRE","PAYS"], "Votre colis arrive du Nigeria ou d'un autre pays,".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["MAIS","VOUS","N'ÊTES","PAS","DISPONIBLE","POUR","ALLER","LE","CHERCHER"], "mais vous n'êtes pas disponible pour aller le chercher ?".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["VOICI","HADISA","COMMERÇANT","AMAADI"], ["Voici","Hadiza,","commerçante","à Maradi."]),
 (["ÇA","MARCHANDISE","ARRIVE","AVEC","UN","CHAUFFEUR","MAIS","ELLE","NE","PEUT","PAS","QUITTER","SA","BOUTIQUE"], "Sa marchandise arrive avec un chauffeur, mais elle ne peut pas quitter sa boutique.".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["ALORS","ELLE","APPELLE","ALLO","MULTI SERVICE","MARADIS"], ["Alors,","elle","appelle","Allô","Multi-Services","Maradi."]),
 (["SUR","WATZAP","ELLE","ENVOIE","LE","NUMÉRO","DU","CHAUFFEUR","ET","UNE","PHOTO","DU","COLLIS"], "Sur WhatsApp, elle envoie le numéro du chauffeur et une photo du colis.".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["NOTRE","ÉQUIPE","APPELLE","LE","CHAUFFEUR","ET","ORGANISE","LA","RÉCUPÉRATION"], "Notre équipe appelle le chauffeur et organise la récupération.".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["LE","COLIS","EST","RÉCUPÉRÉ","VÉRIFIÉ","ET","RÉEMBALLÉ","SI","BESOIN"], "Le colis est récupéré, vérifié, et réemballé si besoin.".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["PUIS","IL","EST","LIVRÉ","À","MARADIS","OU","EXPÉDIÉ","VERS","NIAMEY","ZINDER","TAOUA","AGADEZ","ET","TOUTES","LES","VILLES","DU","NIGER","ET","LA","SOUS RÉGION"],
  "Puis il est livré à Maradi, ou expédié vers Niamey, Zinder, Tahoua, Agadez et toutes les villes du Niger et la sous-région.".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["ADISA","REÇOIT","LA","CONFIRMATION","SON","COLIS","EST","PRIS","EN","CHARGE"], "Hadiza reçoit la confirmation : son colis est pris en charge.".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["LES","TARIF"], ["Les","tarifs\u00a0?"]),
 (["LIVRAISON","À","MARADIS","À","PARTIR","DE","MILLE","FRANCS"], ["Livraison","à","Maradi","à","partir","de","1 000","francs."]),
 (["EXPÉDITION","VERS","UNE","AUTRE","VILLE","À","PARTIR","DE","MILLE CINQ CENTS","FRANCS"], ["Expédition","vers","une","autre","ville","à","partir","de","1 500","francs."]),
 (["OUVERTURE","ET","RÉEMBALLAGE","DES","DEUX MILLE","FRANCS"], ["Ouverture","et","réemballage","dès","2 000","francs."]),
 (["ET","UNE","FACTURE","CLAIRE","À","LA","FIN"], "Et une facture claire à la fin.".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["VOTRE","COLIS","ON","S'EN","OCCUPE"], "Votre colis, on s'en occupe !".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
 (["APPELÉE","OU","ÉCRIVÉE","SUR","WATZAPPO"], ["Appelez","ou","écrivez","sur","WhatsApp au"]),
 (["SOIXANTE QUATORZE","CINQUANTE HUIT","DIX HUIT","VINGT QUATRE"], ["74","58","18","24."]),
 (["À","LOMULISERVICE","MARADIS"], ["Allô","Multi-Services","Maradi."]),
 (["TOUT","VOS","BESOINS","UN","SEUL","APPEL"], "Tous vos besoins, un seul appel !".replace(" ?","\u00a0?").replace(" !","\u00a0!").replace(" :","\u00a0:").split(" ")),
]
out, i = [], 0
for src, dst in RULES:
    grp = []
    for token in src:
        parts = token.split(' ')
        seg = w[i:i+len(parts)]
        assert [s['text'] for s in seg] == parts, (token, [s['text'] for s in seg], i)
        grp.append({'start': seg[0]['start'], 'end': seg[-1]['end']}); i += len(parts)
    assert len(grp) == len(dst), (src, dst)
    for g, t in zip(grp, dst):
        out.append({'text': t, 'start': g['start'], 'end': g['end']})
assert i == len(w), (i, len(w))
json.dump(out, open('transcript.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), 'mots ; fin voix', out[-1]['end'])
