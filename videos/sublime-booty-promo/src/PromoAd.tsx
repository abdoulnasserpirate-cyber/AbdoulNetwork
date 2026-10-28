import React from "react";
import { AbsoluteFill, Html5Audio as Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { AUDIO } from "./data";
import { CUES, CueKey, isSpeaking } from "./cues";
import { flashPunch } from "./transitions/flashPunch";
import { Subtitles } from "./components/Subtitles";
import { S1Hook } from "./scenes/S1Hook";
import { S2Brand } from "./scenes/S2Brand";
import { S3Body } from "./scenes/S3Body";
import { S4Kits } from "./scenes/S4Kits";
import { S5Vedette } from "./scenes/S5Vedette";
import { S6Split } from "./scenes/S6Split";
import { S7Tirage } from "./scenes/S7Tirage";
import { S8Paiement } from "./scenes/S8Paiement";
import { S9Final } from "./scenes/S9Final";
import type { SceneProps } from "./scenes/types";

type SceneDef = {
  start: CueKey;
  Component: React.FC<SceneProps>;
  // transition vers cette scène
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transition?: { presentation: TransitionPresentation<any>; frames: number };
};

const useScenes = (width: number, height: number): SceneDef[] => [
  { start: "regarde", Component: S1Hook },
  { start: "sublime", Component: S2Brand, transition: { presentation: flashPunch(), frames: 10 } },
  { start: "fesses", Component: S3Body, transition: { presentation: fade(), frames: 10 } },
  { start: "kit1", Component: S4Kits, transition: { presentation: slide({ direction: "from-right" }), frames: 14 } },
  { start: "star", Component: S5Vedette, transition: { presentation: flashPunch(), frames: 10 } },
  { start: "pourPoitrine", Component: S6Split, transition: { presentation: wipe({ direction: "from-top" }), frames: 12 } },
  { start: "pasTout", Component: S7Tirage, transition: { presentation: clockWipe({ width, height }), frames: 18 } },
  { start: "paie", Component: S8Paiement, transition: { presentation: slide({ direction: "from-bottom" }), frames: 14 } },
  { start: "ecris", Component: S9Final, transition: { presentation: flashPunch(), frames: 10 } },
];

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) =>
  at < 0 ? null : (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={60} layout="none">
      <Audio src={staticFile(src)} volume={volume} />
    </Sequence>
  );

export const PromoAd: React.FC = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const scenes = useScenes(width, height);
  const cueFrame = (k: CueKey) => Math.round(CUES[k] * fps);

  // Début (frame absolue) de chaque scène : la transition est centrée juste avant le mot-repère.
  const starts = scenes.map((s, i) => (i === 0 ? 0 : cueFrame(s.start) - Math.floor((s.transition?.frames ?? 0) / 2)));
  const durations = scenes.map((s, i) =>
    i < scenes.length - 1 ? starts[i + 1] - starts[i] + (scenes[i + 1].transition?.frames ?? 0) : durationInFrames - starts[i],
  );

  const priceCues: CueKey[] = ["prix1", "prix2", "prix3", "prixAmaria", "prixLolo", "prixVentre", "min", "max", "frais"];
  const popCues: CueKey[] = ["nita", "amana", "wave", "western", "ria", "numero", "n48", "n56", "n12"];

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TransitionSeries>
        {scenes.map((s, i) => {
          const local = (k: CueKey) => cueFrame(k) - starts[i];
          const items = [];
          if (s.transition) {
            items.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={s.transition.presentation}
                timing={linearTiming({ durationInFrames: s.transition.frames })}
              />,
            );
          }
          items.push(
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={durations[i]}>
              <s.Component cue={local} duration={durations[i]} />
            </TransitionSeries.Sequence>,
          );
          return items;
        })}
      </TransitionSeries>

      <Subtitles />

      {/* Voix off (contient déjà sa musique) */}
      <Audio src={staticFile(AUDIO.voice)} volume={1} />
      {/* Musique séparée optionnelle : 0.35, ducking à 0.15 pendant la voix, fondu final 1,5 s */}
      {AUDIO.music ? (
        <Audio
          src={staticFile(AUDIO.music)}
          loop
          volume={(f) => {
            const base = isSpeaking((f / fps) * 1000) ? AUDIO.musicDuckedVolume : AUDIO.musicVolume;
            return base * interpolate(f, [durationInFrames - AUDIO.tailSeconds * fps, durationInFrames], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
          }}
        />
      ) : null}

      {/* Sound design */}
      <Sfx at={0} src="sfx/impact.wav" volume={0.8} />
      {starts.slice(1).map((f, i) => (
        <Sfx key={`w${i}`} at={f - 3} src="sfx/whoosh.wav" volume={0.45} />
      ))}
      {priceCues.map((k) => (
        <Sfx key={k} at={cueFrame(k)} src="sfx/pop.wav" volume={0.7} />
      ))}
      {popCues.map((k) => (
        <Sfx key={k} at={cueFrame(k)} src="sfx/ding.wav" volume={0.25} />
      ))}
      <Sfx at={cueFrame("sublime")} src="sfx/shimmer.wav" volume={0.45} />
      <Sfx at={cueFrame("grande")} src="sfx/impact.wav" volume={0.55} />
      <Sfx at={cueFrame("tirage")} src="sfx/shimmer.wav" volume={0.5} />
      <Sfx at={cueFrame("marque")} src="sfx/shimmer.wav" volume={0.45} />
    </AbsoluteFill>
  );
};
