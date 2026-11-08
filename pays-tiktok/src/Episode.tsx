import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {World} from './world/World';
import {Grass} from './world/Grass';
import {getGeography, type Geography} from './world/geography';
import {getUnivers} from './world/univers';
import type {Clearing} from './world/Vegetation';
import {cameraKeys, cameraPosAt, project} from './scenes/shots';
import {resolveTimeline, itemStart, type Element, type EpisodeSpec, type Timeline} from './lib/timeline';
import {clamp01, easeInOutCubic} from './lib/easing';
import {mulberry32, range} from './lib/prng';
import {GhostInstances, ghostCityItems, houseGeometry, marketGeometry, millGeometry, fieldGeometry, towerGeometry, villageItems} from './city/Ghost';
import {Pawns, PAWN_COLORS, landedCount, type PawnDrop} from './city/Pawns';
import {Flag} from './city/Flag';
import {GroundRing, PopInstances, camelGeometry, type Placed} from './city/Props';
import {Hud} from './ui/Hud';
import {Caption} from './ui/Caption';
import {CommentCard, IconGrid, StepCard, VoteCards} from './ui/Cards';
import {Label, MapPin} from './ui/Label';
import {BLUE, ORANGE, out} from './ui/theme';
import type {CamKey} from './world/CameraRig';

// ---------- Polices : on attend qu'elles soient chargées avant chaque rendu

const useFonts = () => {
  const [handle] = useState(() => delayRender('polices'));
  useEffect(() => {
    Promise.all([
      document.fonts.load("72px 'Lilita One'"),
      document.fonts.load("800 30px 'Montserrat'"),
      document.fonts.load("700 30px 'Montserrat'"),
    ]).then(() => continueRender(handle));
  }, [handle]);
};

// ---------- Helpers de timeline

const first = (tl: Timeline, type: string, filter?: (e: Element) => boolean) =>
  tl.elements.find((e) => e.type === type && (!filter || filter(e)));
const all = (tl: Timeline, type: string) => tl.elements.filter((e) => e.type === type);
/** 1 pendant l'élément, puis décroît sur `fade` frames après la fin. */
const presence = (e: Element | undefined, frame: number, fade = 12) =>
  !e || frame < e.start ? 0 : frame <= e.end ? 1 : 1 - clamp01((frame - e.end) / fade);

// ---------- Placement déterministe des pions d'exemple (ligne 7)

function examplePawns(geo: Geography, e: Element, fps: number, seed: number): PawnDrop[] {
  const rng = mulberry32(seed + 77);
  const n = Number(e.nombre ?? 8);
  const span = Math.max(n * 4, e.end - e.start - fps * 0.6);
  // devant la caméra du plan sol_pions : direction (-0.346, -0.938), perpendiculaire (0.938, -0.346)
  const [cx, cz] = [11.3, -9.4];
  const out: PawnDrop[] = [];
  for (let i = 0; i < n; i++) {
    const lat = (i / (n - 1) - 0.5) * 10 + range(rng, -0.6, 0.6);
    const depth = range(rng, -3, 3);
    const x = cx + lat * 0.938 + depth * -0.346;
    const z = cz - lat * 0.346 + depth * -0.938;
    out.push({x, y: geo.height(x, z), z, color: PAWN_COLORS[i % PAWN_COLORS.length], delay: (i / n) * span});
  }
  return out;
}

// ---------- Scène 3D (dans le ThreeCanvas)

const Scene3D: React.FC<{tl: Timeline; geo: Geography; frame: number; seed: number; camPos: [number, number, number]}> = ({
  tl,
  geo,
  frame,
  seed,
  camPos,
}) => {
  const fps = tl.fps;
  const geoms = useMemo(
    () => ({tower: towerGeometry(), house: houseGeometry(), mill: millGeometry(), market: marketGeometry(), field: fieldGeometry(), camel: camelGeometry()}),
    [],
  );
  const city = first(tl, 'ville_fantome');
  const cityItems = useMemo(() => (city ? ghostCityItems(geo, seed, fps) : []), [city, geo, seed, fps]);
  const pions = first(tl, 'pions');
  const pawns = useMemo(() => (pions ? examplePawns(geo, pions, fps, seed) : []), [pions, geo, fps, seed]);
  const flag = first(tl, 'drapeau_blanc');
  const villages = all(tl, 'village_fantome');
  const villageData = useMemo(() => villages.map((v) => ({e: v, data: villageItems(geo, v.lieu as 'A' | 'B', seed)})), [villages, geo, seed]);
  const pins = all(tl, 'epingle');
  const camels = first(tl, 'chameaux');
  const camelItems = useMemo<Placed[]>(() => {
    if (!camels) return [];
    const [bx, bz] = geo.preset.lieux[camels.lieu as string];
    return [0, 1, 2, 3].map((i) => {
      const x = bx + 9 - i * 2.6;
      const z = bz + 10 + i * 1.2;
      return {x, y: geo.height(x, z), z, ry: -0.5, delay: i * 4, s: 1.1};
    });
  }, [camels, geo]);

  const [fx, fz] = geo.preset.lieux.drapeau;
  const low = camPos[1] < 45;
  // patch d'herbe le plus proche de la caméra (plans au sol uniquement)
  const patches: {c: [number, number]; r: number; n: number}[] = [
    {c: [15, 2], r: 24, n: 34000},
    {c: [fx + 2, fz + 7], r: 17, n: 26000},
    {c: [-6, 12], r: 16, n: 20000},
  ];
  const patch = patches.reduce((best, p) =>
    Math.hypot(p.c[0] - camPos[0], p.c[1] - camPos[2]) < Math.hypot(best.c[0] - camPos[0], best.c[1] - camPos[2]) ? p : best,
  );

  return (
    <group>
      {low ? <Grass key={patch.c.join()} geo={geo} center={patch.c} radius={patch.r} count={patch.n} time={frame / fps} seed={seed + patch.n} /> : null}
      {city ? <GhostInstances geometry={geoms.tower} items={cityItems} t={frame - city.start} presence={presence(city, frame, 14)} popFrames={20} /> : null}
      {pions ? <Pawns pawns={pawns} t={frame - pions.start} presence={presence(pions, frame, 8)} /> : null}
      {flag && frame >= flag.start - 2 && frame <= flag.end + 2 ? (
        <Flag position={[fx, geo.height(fx, fz) - 0.2, fz]} frame={frame} rotationY={0.35} />
      ) : null}
      {pins.map((p) => {
        const [x, z] = geo.preset.lieux[p.lieu as string];
        const pr = presence(p, frame, 12);
        if (!pr) return null;
        return <GroundRing key={p.lieu as string} position={[x, geo.height(x, z), z]} radius={13} progress={((frame - p.start) / 12) * pr} />;
      })}
      {villageData.map(({e, data}) => {
        const t = frame - e.start;
        const pr = presence(e, frame, 12);
        if (!pr || t < 0) return null;
        return (
          <group key={e.lieu as string}>
            <GhostInstances geometry={geoms.house} items={data.houses} t={t} presence={pr} />
            <GhostInstances geometry={data.extraKind === 'mill' ? geoms.mill : geoms.market} items={data.extra} t={t} presence={pr} />
            <GhostInstances geometry={geoms.field} items={data.fields} t={t} presence={pr} />
          </group>
        );
      })}
      {camels ? <PopInstances geometry={geoms.camel} items={camelItems} t={frame - camels.start} presence={presence(camels, frame, 10)} /> : null}
    </group>
  );
};

// ---------- Overlays 2D (HUD, sous-titres, cartes)

const Overlay: React.FC<{
  ep: EpisodeSpec;
  tl: Timeline;
  geo: Geography;
  keys: CamKey[];
  frame: number;
  population: number;
  badge: {text: string; t: number} | null;
}> = ({ep, tl, geo, keys, frame, population, badge}) => {
  const {width, height} = useVideoConfig();
  const lines = tl.lines;
  const idx = Math.max(0, lines.findIndex((l, i) => frame >= l.start && (i === lines.length - 1 || frame < lines[i + 1].start)));
  const cur = lines[idx];

  // Titre de section (haut) : pop quand il change
  let titreStart = cur.start;
  for (let i = idx; i >= 0 && lines[i].titreActif === cur.titreActif; i--) titreStart = lines[i].start;

  // Narration (milieu-bas) : visible jusqu'au début de la ligne suivante
  const capLine = cur.sous_titre ? cur : null;

  const grid = first(tl, 'grille_icones');
  const gridOn = grid && frame >= grid.start && frame <= grid.end + 8;
  const steps = all(tl, 'consigne');
  const comment = first(tl, 'commentaire');
  const vote = first(tl, 'cartes_vote');
  const fade = first(tl, 'fondu_blanc');
  const etiquettes = first(tl, 'etiquettes');
  const pins = all(tl, 'epingle');
  const flagBlock = steps.some((s) => frame >= s.start && frame <= s.end + 8) || (comment && frame >= comment.start && frame <= comment.end + 8);
  const capY = gridOn ? 1120 : vote && frame >= vote.start && frame <= vote.end ? 1355 : flagBlock ? 1420 : 1300;

  const anchors: Record<string, [number, number, number]> = {
    montagnes: [-55, geo.height(-55, -80), -80],
    fleuve: [-27, 0.2, -30],
    lac: [16, 0.2, 36],
  };
  const labelOffsets: Record<string, [number, number]> = {montagnes: [150, 110], fleuve: [170, -40], lac: [70, -250]};

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {etiquettes
        ? (etiquettes.items as {texte: string; mot: string; cible: string}[]).map((it) => {
            const a = project(keys, frame, anchors[it.cible], width, height);
            if (!a) return null;
            return (
              <Label
                key={it.cible}
                text={it.texte}
                anchor={a}
                offset={labelOffsets[it.cible]}
                t={frame - itemStart(tl, etiquettes, it)}
                exit={out(frame, etiquettes.end, 6)}
              />
            );
          })
        : null}

      {pins.map((p) => {
        const [x, z] = geo.preset.lieux[p.lieu as string];
        const a = project(keys, frame, [x, geo.height(x, z) + 0.4, z], width, height);
        if (!a || frame < p.start || frame > p.end + 6) return null;
        return <MapPin key={p.lieu as string} letter={p.lieu as string} color={p.lieu === 'A' ? BLUE : ORANGE} at={a} t={frame - p.start} size={frame > p.end ? 0.01 : 92} />;
      })}

      <Hud jour={ep.jour} population={population} nom={ep.nom} badge={badge} />

      {cur.titreActif ? <Caption text={cur.titreActif} t={frame - titreStart} y={505} size={66} /> : null}

      {gridOn ? (
        <div style={{position: 'absolute', top: 640, left: 0, right: 0}}>
          <IconGrid
            items={(grid!.items as {texte: string; icone: string; mot: string}[]).map((it) => ({...it, t: frame - itemStart(tl, grid!, it)}))}
            exit={out(frame, grid!.end, 6)}
          />
        </div>
      ) : null}

      {flagBlock ? (
        <div style={{position: 'absolute', top: 960, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
          {steps.map((s) => (
            <StepCard
              key={String(s.numero)}
              numero={Number(s.numero)}
              titre={String(s.titre)}
              texte={String(s.texte)}
              t={frame - s.start}
              exit={out(frame, s.end, 6)}
            />
          ))}
          {comment ? (
            <div style={{marginTop: 18}}>
              <CommentCard
                pseudo={String(comment.pseudo)}
                texte={String(comment.texte)}
                likesFrom={Number(comment.likes_de)}
                likesTo={Number(comment.likes_a)}
                badge={comment.badge as string | undefined}
                t={frame - comment.start}
                countFrames={Math.round(tl.fps * 1.6)}
                exit={out(frame, comment.end, 6)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {vote && frame >= vote.start && frame <= vote.end + 8 ? (
        <div style={{position: 'absolute', top: 1010, left: 0, right: 0}}>
          <div style={{opacity: out(frame, vote.end, 8)}}>
            <VoteCards a={vote.a as never} b={vote.b as never} t={frame - vote.start} />
          </div>
        </div>
      ) : null}

      {capLine ? (
        <Caption
          key={capLine.id}
          text={capLine.sous_titre!}
          sub={capLine.sous_ligne}
          t={frame - capLine.start}
          y={capY}
          size={capLine.sous_ligne ? 70 : 72}
        />
      ) : null}

      {fade ? (
        <AbsoluteFill style={{background: '#ffffff', opacity: easeInOutCubic(clamp01((frame - fade.start) / Math.max(1, fade.end - fade.start)))}} />
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- SFX : whoosh (changements de plan), pop (apparitions), tick (pions), ding (VS)

type Sfx = {src: string; frame: number; volume: number};

function sfxEvents(tl: Timeline, pawns: PawnDrop[]): Sfx[] {
  const ev: Sfx[] = [];
  const add = (src: string, frame: number, volume: number) => ev.push({src, frame: Math.max(0, Math.round(frame)), volume});
  tl.shots.forEach((s, i) => add('whoosh', i === 0 ? 0 : s.start - 6, i === 0 ? 0.55 : 0.35));
  tl.elements.forEach((e) => {
    const items = (e.items as {mot?: string; at?: number}[] | undefined) ?? null;
    if (items) items.forEach((it) => add('pop', itemStart(tl, e, it), 0.5));
    else if (['consigne', 'commentaire', 'epingle', 'village_fantome', 'chameaux', 'ville_fantome'].includes(e.type)) add('pop', e.start, 0.5);
    if (e.type === 'cartes_vote') {
      add('pop', e.start, 0.5);
      add('pop', e.start + 4, 0.5);
      add('ding', e.start + 9, 0.45);
    }
    if (e.type === 'commentaire') add('ding', e.start + 8 + tl.fps * 1.6, 0.35);
    if (e.type === 'pions') pawns.forEach((p) => add('tick', e.start + p.delay + 12, 0.55));
  });
  return ev;
}

// ---------- Épisode complet

export const Episode: React.FC<{episode: EpisodeSpec}> = ({episode}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tl = useMemo(() => resolveTimeline(episode, fps), [episode, fps]);
  const geo = useMemo(() => getGeography(getUnivers(episode.univers), episode.seed), [episode.univers, episode.seed]);
  const keys = useMemo(() => cameraKeys(tl, geo), [tl, geo]);
  const camPos = cameraPosAt(keys, frame);

  const L = geo.preset.lieux;
  const clearings = useMemo<Clearing[]>(
    () => [
      {x: L.A[0], z: L.A[1], r: 14},
      {x: L.B[0], z: L.B[1], r: 14},
      {x: L.drapeau[0], z: L.drapeau[1], r: 7},
      {x: L.drapeau[0] + 3.5, z: L.drapeau[1] + 12, r: 8},
      {x: L.drapeau[0] + 2, z: L.drapeau[1] + 6, r: 5},
      {x: 11, z: -9, r: 10},
      {x: 18, z: 9, r: 6},
      {x: 24, z: 18, r: 8},
      {x: 16, z: 5, r: 6},
      {x: 10, z: 22, r: 7},
    ],
    [L],
  );

  // Population : vraie valeur + animation d'exemple (pions de la ligne 7), puis retour à la base
  const pions = first(tl, 'pions');
  const pawns = useMemo(() => (pions ? examplePawns(geo, pions, fps, episode.seed) : []), [pions, geo, fps, episode.seed]);
  let population = episode.population;
  let badge: {text: string; t: number} | null = null;
  if (pions && pions.compteur && frame >= pions.start) {
    const landed = landedCount(pawns, frame - pions.start);
    const back = clamp01((frame - pions.end) / 14);
    population = episode.population + landed * (1 - easeInOutCubic(back));
    if (frame <= pions.end + 6 && pions.badge) badge = {text: String(pions.badge), t: frame - pions.start};
  }

  const drame = first(tl, 'drame');
  const dramaAt = (f: number) => (drame ? clamp01((f - drame.start) / 12) * (1 - clamp01((f - drame.end) / 12)) : 0);
  const drama = dramaAt(frame);
  const sfx = useMemo(() => sfxEvents(tl, pawns), [tl, pawns]);

  return (
    <AbsoluteFill style={{background: '#ffffff'}}>
      <World univers={episode.univers} seed={episode.seed} camera={keys} clearings={clearings} drama={drama} cloudDrift={frame * 0.04}>
        <Scene3D tl={tl} geo={geo} frame={frame} seed={episode.seed} camPos={camPos} />
      </World>
      <Overlay ep={episode} tl={tl} geo={geo} keys={keys} frame={frame} population={population} badge={badge} />
      {episode.voix ? <Audio src={staticFile(episode.voix)} /> : null}
      {episode.musique ? (
        // ~ -18 dB sous la voix, baisse pendant les moments de tension
        <Audio src={staticFile(episode.musique)} volume={(f) => 0.13 * (1 - 0.55 * dramaAt(f)) * clamp01(f / 20) * (1 - clamp01((f - (tl.duration - 25)) / 25))} />
      ) : null}
      {sfx.map((s, i) => (
        <Sequence key={i} from={s.frame} durationInFrames={Math.round(fps * 2.7)} layout="none">
          <Audio src={staticFile(`audio/sfx/${s.src}.wav`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const episodeDuration = (ep: EpisodeSpec, fps: number) => resolveTimeline(ep, fps).duration;
