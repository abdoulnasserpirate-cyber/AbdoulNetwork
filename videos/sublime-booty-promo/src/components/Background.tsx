import React from "react";
import { AbsoluteFill, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "../data";
import { useLayout } from "../theme";

type Variant = "dark" | "gold" | "magenta";

const BASES: Record<Variant, string> = {
  dark: "radial-gradient(ellipse at 50% 40%, #2a0016 0%, #0d0008 55%, #000 100%)",
  magenta: `radial-gradient(ellipse at 50% 45%, ${COLORS.pink} 0%, ${COLORS.magenta} 45%, #5c002d 100%)`,
  gold: "radial-gradient(ellipse at 50% 42%, #FFF3CF 0%, #F2C46D 42%, #B07A22 100%)",
};

// Fond signature : halos magenta qui respirent, rayons rotatifs, cercles dorés,
// paillettes en parallaxe et grain léger.
export const Background: React.FC<{ variant?: Variant; rays?: boolean; seed?: string }> = ({
  variant = "dark",
  rays = true,
  seed = "bg",
}) => {
  const frame = useCurrentFrame();
  const { width, height, u } = useLayout();
  const breathe = 0.5 + 0.5 * Math.sin(frame / 22);
  const isDark = variant === "dark";
  const haloColor = variant === "gold" ? "rgba(255,255,255,0.55)" : "rgba(224,0,111,0.55)";

  return (
    <AbsoluteFill style={{ background: BASES[variant], overflow: "hidden" }}>
      {/* halos */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: (i ? 900 : 1300) * u,
            height: (i ? 900 : 1300) * u,
            left: width * (i ? 0.72 : 0.28) - (i ? 450 : 650) * u + Math.sin(frame / 60 + i * 2) * 60 * u,
            top: height * (i ? 0.7 : 0.35) - (i ? 450 : 650) * u + Math.cos(frame / 70 + i) * 50 * u,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${haloColor} 0%, transparent 65%)`,
            opacity: (isDark ? 0.55 : 0.35) + 0.25 * (i ? 1 - breathe : breathe),
          }}
        />
      ))}
      {/* rayons */}
      {rays ? (
        <div
          style={{
            position: "absolute",
            left: width / 2 - Math.max(width, height),
            top: height / 2 - Math.max(width, height),
            width: Math.max(width, height) * 2,
            height: Math.max(width, height) * 2,
            background: `repeating-conic-gradient(from 0deg, ${
              variant === "dark" ? "rgba(255,61,154,0.10)" : "rgba(255,255,255,0.16)"
            } 0deg 5deg, transparent 5deg 15deg)`,
            rotate: `${frame * 0.25}deg`,
            maskImage: "radial-gradient(circle, black 0%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)",
          }}
        />
      ) : null}
      {/* cercles dorés */}
      {[0.55, 0.78, 1.02].map((r, i) => {
        const size = Math.min(width, height) * r * (1 + 0.03 * Math.sin(frame / 25 + i));
        return (
          <div
            key={r}
            style={{
              position: "absolute",
              left: width / 2 - size / 2,
              top: height / 2 - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `${1.5 * u}px solid ${variant === "gold" ? "rgba(120,70,0,0.35)" : "rgba(242,196,109,0.28)"}`,
            }}
          />
        );
      })}
      <Sparkles seed={seed} count={46} />
      <Grain />
    </AbsoluteFill>
  );
};

// Paillettes dorées en parallaxe (3 profondeurs).
export const Sparkles: React.FC<{ seed?: string; count?: number; speed?: number }> = ({
  seed = "s",
  count = 40,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height, u } = useLayout();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const depth = 1 + Math.floor(random(`${seed}-d-${i}`) * 3);
        const x = random(`${seed}-x-${i}`) * width;
        const y0 = random(`${seed}-y-${i}`) * height;
        const y = (((y0 - frame * depth * 0.9 * speed) % height) + height) % height;
        const size = (2 + depth * 2.2) * u;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (8 + depth * 3) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 30 + i) * 12 * u,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "radial-gradient(circle, #FFF6D8 0%, #F2C46D 45%, transparent 75%)",
              opacity: tw * (0.4 + depth * 0.2),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.08,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        backgroundImage: `url(${staticFile("images/grain.png")})`,
        backgroundSize: "512px 512px",
        backgroundPosition: `${(frame * 137) % 512}px ${(frame * 291) % 512}px`,
      }}
    />
  );
};

// Petit glitch rose (décalage RVB) utilisé sur les coupes franches.
export const glitchShift = (frame: number, start: number, len = 4) =>
  frame >= start && frame < start + len ? interpolate(frame, [start, start + len], [18, 0]) : 0;
