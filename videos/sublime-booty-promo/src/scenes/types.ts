import type { CueKey } from "../cues";

export type SceneProps = {
  // frame locale (dans la scène) où le mot-repère est prononcé
  cue: (k: CueKey) => number;
  duration: number;
};
