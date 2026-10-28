import React from "react";
import { CalculateMetadataFunction, Composition, Still, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { PromoAd } from "./PromoAd";
import { Cover } from "./Cover";
import { AUDIO } from "./data";

const FPS = 30;

// Durée = durée réelle de voix.mp3 + 1,5 s
const calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> = async () => {
  const seconds = await getAudioDurationInSeconds(staticFile(AUDIO.voice));
  return { durationInFrames: Math.ceil((seconds + AUDIO.tailSeconds) * FPS) };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Promo16x9"
        component={PromoAd}
        durationInFrames={1750}
        fps={FPS}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="Promo9x16"
        component={PromoAd}
        durationInFrames={1750}
        fps={FPS}
        width={1080}
        height={1920}
        calculateMetadata={calculateMetadata}
      />
      <Still id="Cover16x9" component={Cover} width={1920} height={1080} />
      <Still id="Cover9x16" component={Cover} width={1080} height={1920} />
    </>
  );
};
