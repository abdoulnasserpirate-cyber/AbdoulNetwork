"""Alignement voix <-> script quand les silences entre lignes sont courts (voix IA, débit rapide).

    python3 scripts/align.py <wav> <episodes/jour-XX.json> [noise_dB] [min_pause_s]

Détecte toutes les pauses (même courtes), puis choisit par programmation dynamique les
N-1 pauses qui découpent la voix en N lignes, en minimisant l'écart entre la durée de chaque
morceau et la longueur de son texte, et en préférant les pauses longues comme frontières.
Affiche les segments (JSON sur la dernière ligne) : [[debut, fin], ...] en secondes dans le WAV.
"""
import json
import re
import subprocess
import sys
import unicodedata

wav, ep_path = sys.argv[1], sys.argv[2]
noise = sys.argv[3] if len(sys.argv) > 3 else '-35'
dmin = sys.argv[4] if len(sys.argv) > 4 else '0.15'

ep = json.load(open(ep_path, encoding='utf8'))
texts = [l['voix'] for l in ep['lignes']]
N = len(texts)

log = subprocess.run(
    ['ffmpeg', '-hide_banner', '-i', wav, '-af', f'silencedetect=noise={noise}dB:d={dmin}', '-f', 'null', '-'],
    capture_output=True, text=True,
).stderr
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], capture_output=True, text=True).stdout)
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
pauses = list(zip(starts, ends + [dur] * (len(starts) - len(ends))))
# morceaux de parole entre pauses
chunks = []
cur = 0.0
for s, e in pauses:
    if s - cur > 0.08:
        chunks.append([cur, s])
    cur = e
if dur - cur > 0.08:
    chunks.append([cur, dur])
M = len(chunks)
if M < N:
    sys.exit(f'Seulement {M} morceaux de parole pour {N} lignes')


def weight(t):
    """longueur « parlée » d'un texte : lettres + pauses de ponctuation."""
    t = unicodedata.normalize('NFD', t)
    letters = len(re.findall(r'[A-Za-z0-9]', t))
    punct = len(re.findall(r'[…,.:;?!]', t))
    return letters + punct * 4


w = [weight(t) for t in texts]
gap = [chunks[i + 1][0] - chunks[i][1] for i in range(M - 1)]
INF = float('inf')


def solve(rate):
    # best[k][j] = coût minimal pour placer k lignes sur les morceaux [0, j)
    best = [[INF] * (M + 1) for _ in range(N + 1)]
    back = [[0] * (M + 1) for _ in range(N + 1)]
    best[0][0] = 0
    for k in range(1, N + 1):
        for j in range(k, M - (N - k) + 1):
            for i in range(k - 1, j):
                if best[k - 1][i] == INF:
                    continue
                d = chunks[j - 1][1] - chunks[i][0]
                exp = rate * w[k - 1]
                c = ((d - exp) / max(exp, 0.6)) ** 2
                if j < M:  # frontière à la pause qui suit : préférer les pauses longues
                    c += 1.6 * max(0.0, 0.5 - gap[j - 1]) ** 1 * 4
                tot = best[k - 1][i] + c
                if tot < best[k][j]:
                    best[k][j] = tot
                    back[k][j] = i
    segs = []
    j = M
    for k in range(N, 0, -1):
        i = back[k][j]
        segs.append([chunks[i][0], chunks[j - 1][1]])
        j = i
    return best[N][M], segs[::-1]


speech = sum(b - a for a, b in chunks)
rate = speech / sum(w)
for _ in range(6):  # réestime le débit à partir de la solution
    cost, segs = solve(rate)
    rate = sum(b - a for a, b in segs) / sum(w)

for k, (a, b) in enumerate(segs):
    print(f'{k + 1:2d}  {a:6.2f} -> {b:6.2f}  ({b - a:4.2f} s, attendu {rate * w[k]:4.2f})  {texts[k]}')
print(f'coût {cost:.2f}, débit {1 / rate:.1f} car/s')
print(json.dumps([[round(a, 3), round(b, 3)] for a, b in segs]))
