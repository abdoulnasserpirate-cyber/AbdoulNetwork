import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS } from "../data";
import { clamp, useLayout } from "../theme";

// Explosion de confettis or et rose (physique simple, déterministe).
export const Confetti: React.FC<{ start: number; x?: number; y?: number; count?: number; seed?: string; power?: number }> = ({
  start,
  x = 0.5,
  y = 0.5,
  count = 90,
  seed = "c",
  power = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height, u } = useLayout();
  const t = frame - start;
  if (t < 0 || t > 90) return null;
  const palette = [COLORS.gold, COLORS.goldLight, COLORS.pink, COLORS.magenta, "#fff", COLORS.yellow];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = (14 + random(`${seed}v${i}`) * 26) * u * power;
        const px = width * x + Math.cos(a) * v * t * 0.9;
        const py = height * y + Math.sin(a) * v * t * 0.7 + 0.5 * 1.1 * u * t * t;
        const rot = t * (8 + random(`${seed}r${i}`) * 20);
        const w = (10 + random(`${seed}w${i}`) * 14) * u;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: w,
              height: w * 0.45,
              background: palette[i % palette.length],
              rotate: `${rot}deg`,
              borderRadius: i % 3 === 0 ? "50%" : 2,
              opacity: interpolate(t, [0, 60, 90], [1, 1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Flash plein écran (rose par défaut).
export const Flash: React.FC<{ at: number; len?: number; color?: string; max?: number }> = ({
  at,
  len = 8,
  color = COLORS.pink,
  max = 0.9,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + len], [0, max, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

// Secousse de caméra légère.
export const useShake = (at: number, len = 12, amp = 14) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > len) return "0px 0px";
  const k = 1 - t / len;
  return `${Math.sin(t * 2.7) * amp * k}px ${Math.cos(t * 3.3) * amp * k}px`;
};

// Zoom punch sur un repère : 1 -> 1.08 -> 1
export const punch = (frame: number, at: number, amount = 0.08) =>
  1 + interpolate(frame, [at, at + 3, at + 14], [0, amount, 0], clamp);
