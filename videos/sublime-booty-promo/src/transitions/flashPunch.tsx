import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { COLORS } from "../data";
import { EASE_OUT, clamp } from "../theme";

type Props = Record<string, never>;

// Transition maison : flash magenta + zoom punch (scale 1 -> 1.08).
const FlashPunch: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const entering = presentationDirection === "entering";
  const scale = entering
    ? interpolate(p, [0.5, 1], [1.08, 1], { ...clamp, easing: EASE_OUT })
    : interpolate(p, [0, 0.5], [1, 1.08], clamp);
  const opacity = entering ? (p >= 0.5 ? 1 : 0) : p < 0.5 ? 1 : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity, scale: String(scale) }}>{children}</AbsoluteFill>
      {entering ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, ${COLORS.pink} 0%, ${COLORS.magenta} 60%, #7a003c 100%)`,
            opacity: interpolate(p, [0, 0.5, 1], [0, 0.95, 0], clamp),
            mixBlendMode: "screen",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const flashPunch = (): TransitionPresentation<Props> => ({
  component: FlashPunch,
  props: {},
});
