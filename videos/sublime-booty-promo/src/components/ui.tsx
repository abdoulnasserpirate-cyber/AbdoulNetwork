import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, GOLD_GRADIENT, formatPrice, Model } from "../data";
import { EASE_OUT, SPRING_PUNCH, SPRING_SOFT, clamp, montserrat, playfair } from "../theme";

export const GOLD_STYLE: React.CSSProperties = {
  backgroundImage: GOLD_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// Texte doré (dégradé #FFE7AE -> #E9B85C).
export const Gold: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <span
    style={{
      backgroundImage: GOLD_GRADIENT,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.55))",
      ...style,
    }}
  >
    {children}
  </span>
);

// Entrée « spring » réutilisable.
export const useEnter = (start: number, config = SPRING_PUNCH) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - start, fps, config });
};

// Mot par mot / lettre par lettre en spring décalé.
export const StaggerText: React.FC<{
  text: string;
  start: number;
  step?: number;
  by?: "letter" | "word";
  style?: React.CSSProperties;
  itemStyle?: (i: number) => React.CSSProperties;
  from?: "bottom" | "scale";
  gold?: boolean; // le dégradé doit être posé sur chaque lettre (inline-block)
}> = ({ text, start, step = 2, by = "letter", style, itemStyle, from = "bottom", gold = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = by === "letter" ? Array.from(text) : text.split(" ");
  return (
    <span style={{ display: "inline-block", whiteSpace: by === "word" ? "normal" : "pre", ...style }}>
      {items.map((ch, i) => {
        const s = spring({ frame: frame - start - i * step, fps, config: SPRING_PUNCH });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
              translate: from === "bottom" ? `0px ${interpolate(s, [0, 1], [60, 0])}%` : undefined,
              scale: from === "scale" ? String(interpolate(s, [0, 1], [2.6, 1])) : undefined,
              ...(gold ? GOLD_STYLE : {}),
              ...(itemStyle ? itemStyle(i) : {}),
            }}
          >
            {ch}
            {by === "word" && i < items.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
};

// Ancien prix barré par un trait rose animé.
export const OldPrice: React.FC<{ value: number; start: number; size: number; color?: string }> = ({
  value,
  start,
  size,
  color = "rgba(255,255,255,0.75)",
}) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [start, start + 6], [0, 1], { ...clamp, easing: EASE_OUT });
  const strike = interpolate(frame, [start + 5, start + 13], [0, 1], { ...clamp, easing: EASE_OUT });
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: montserrat,
        fontWeight: 700,
        fontSize: size,
        color,
        opacity: appear,
        whiteSpace: "nowrap",
      }}
    >
      {formatPrice(value)}
      <span
        style={{
          position: "absolute",
          left: "-6%",
          top: "52%",
          height: Math.max(4, size * 0.11),
          width: `${112 * strike}%`,
          background: COLORS.pink,
          borderRadius: 99,
          rotate: "-8deg",
          boxShadow: `0 0 12px ${COLORS.pink}`,
        }}
      />
    </span>
  );
};

// Pastille de prix dorée qui « slam » (scale 2.4 -> 1) avec brillance.
export const PricePill: React.FC<{
  value: number;
  start: number;
  size: number;
  count?: boolean; // compteur jusqu'à la valeur finale
  variant?: "gold" | "magenta" | "black";
}> = ({ value, start, size, count = false, variant = "gold" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 11, mass: 0.7, stiffness: 190 } });
  const shown = count
    ? Math.round(
        interpolate(frame, [start, start + 18], [0, value], { ...clamp, easing: EASE_OUT }) / 500,
      ) * 500
    : value;
  const shine = interpolate(frame, [start + 8, start + 26], [-60, 160], clamp);
  const bg =
    variant === "gold" ? GOLD_GRADIENT : variant === "magenta" ? `linear-gradient(180deg, ${COLORS.pink}, ${COLORS.magenta})` : "#0b0006";
  const fg = variant === "gold" ? "#2a0012" : variant === "magenta" ? "#fff" : COLORS.gold;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        background: bg,
        color: fg,
        fontFamily: montserrat,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        padding: `${size * 0.2}px ${size * 0.42}px`,
        borderRadius: size * 0.36,
        whiteSpace: "nowrap",
        border: variant === "black" ? `${size * 0.05}px solid ${COLORS.gold}` : undefined,
        boxShadow: `0 ${size * 0.15}px ${size * 0.5}px rgba(0,0,0,0.5), 0 0 ${size * 0.6}px rgba(242,196,109,0.45)`,
        opacity: interpolate(s, [0, 0.25], [0, 1], clamp),
        scale: String(interpolate(s, [0, 1], [2.4, 1])),
        letterSpacing: "-0.01em",
      }}
    >
      {formatPrice(shown)}
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${shine}%`,
          width: "35%",
          background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.75), transparent)",
          rotate: "12deg",
        }}
      />
    </span>
  );
};

// Petit badge capsule (style affiche).
export const Tag: React.FC<{
  children: React.ReactNode;
  size: number;
  bg?: string;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size, bg = COLORS.magenta, color = "#fff", style }) => (
  <span
    style={{
      display: "inline-block",
      background: bg,
      color,
      fontFamily: montserrat,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: "0.14em",
      padding: `${size * 0.45}px ${size * 0.95}px`,
      borderRadius: size * 0.6,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

// Étoile « OFFRE CHOC ».
export const StarBurst: React.FC<{ size: number; line1: string; line2: string; rotate?: number }> = ({
  size,
  line1,
  line2,
  rotate = -12,
}) => {
  const frame = useCurrentFrame();
  const pts = new Array(32)
    .fill(0)
    .map((_, i) => {
      const a = (i / 32) * Math.PI * 2;
      const r = i % 2 ? 0.86 : 1;
      return `${50 + 50 * r * Math.cos(a)},${50 + 50 * r * Math.sin(a)}`;
    })
    .join(" ");
  return (
    <div style={{ position: "relative", width: size, height: size, rotate: `${rotate + Math.sin(frame / 10) * 3}deg` }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", rotate: `${frame * 0.6}deg` }}>
        <polygon points={pts} fill={COLORS.yellow} stroke="#1a000c" strokeWidth={1.6} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: montserrat,
          fontWeight: 900,
          color: "#1a000c",
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: size * 0.13, letterSpacing: "0.1em" }}>{line1}</span>
        <span style={{ fontSize: size * 0.2 }}>{line2}</span>
      </div>
    </div>
  );
};

// Logo posé sur plaque noire au contour doré, avec brillance qui le traverse.
export const LogoPlate: React.FC<{ width: number; shineStart?: number }> = ({ width, shineStart = 0 }) => {
  const frame = useCurrentFrame();
  const shine = interpolate(frame, [shineStart, shineStart + 22], [-50, 150], clamp);
  return (
    <div
      style={{
        position: "relative",
        width,
        height: width * (405 / 790),
        borderRadius: width * 0.06,
        background: "#000",
        border: `${Math.max(3, width * 0.008)}px solid ${COLORS.gold}`,
        boxShadow: `0 0 ${width * 0.08}px rgba(242,196,109,0.45), 0 ${width * 0.04}px ${width * 0.1}px rgba(0,0,0,0.6)`,
        overflow: "hidden",
      }}
    >
      <Img src={staticFile("logos/sublime-booty-logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      <div
        style={{
          position: "absolute",
          top: "-20%",
          bottom: "-20%",
          left: `${shine}%`,
          width: "22%",
          background: "linear-gradient(100deg, transparent, rgba(255,240,200,0.8), transparent)",
          rotate: "14deg",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

// Catmull-Rom -> chemin de Bézier
const toPath = (pts: [number, number][]) => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

// Photo de mannequin cadrée (jamais déformée) : Ken Burns, travelling vertical
// tête -> hanches, halo rose et lignes lumineuses qui dessinent la courbe.
export const ModelShot: React.FC<{
  model: Model;
  width: number;
  height: number;
  duration: number;
  zoom?: [number, number];
  travel?: [number, number]; // focusY début -> fin
  curveStart?: number;
  showCurves?: boolean;
  fade?: "right" | "left" | "bottom" | "none";
  reveal?: number; // frame de début du balayage de lumière
  radius?: number;
}> = ({
  model,
  width,
  height,
  duration,
  zoom = [1.04, 1.14],
  travel,
  curveStart = 6,
  showCurves = true,
  fade = "none",
  reveal,
  radius = 0,
}) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, duration], zoom, clamp);
  const fy = travel ? interpolate(frame, [0, duration], travel, { ...clamp, easing: EASE_OUT }) : model.focusY;
  const cover = Math.max(width / model.w, height / model.h) * z;
  const iw = model.w * cover;
  const ih = model.h * cover;
  const left = Math.min(0, Math.max(width - iw, width / 2 - iw / 2));
  const top = Math.min(0, Math.max(height - ih, height / 2 - fy * ih));
  const draw = interpolate(frame, [curveStart, curveStart + 26], [1, 0], { ...clamp, easing: EASE_OUT });
  const glow = 0.6 + 0.4 * Math.sin(frame / 6);

  const masks: Record<string, string | undefined> = {
    right: "linear-gradient(90deg, black 70%, transparent 100%)",
    left: "linear-gradient(270deg, black 70%, transparent 100%)",
    bottom: "linear-gradient(180deg, black 62%, transparent 100%)",
    none: undefined,
  };
  const revealPos = reveal !== undefined ? interpolate(frame, [reveal, reveal + 24], [-30, 130], { ...clamp, easing: EASE_OUT }) : null;
  const revealMask =
    revealPos !== null ? `linear-gradient(105deg, black ${revealPos - 25}%, transparent ${revealPos}%)` : undefined;

  return (
    <div style={{ position: "relative", width, height }}>
      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: radius + 40,
          background: "radial-gradient(ellipse at 50% 55%, rgba(255,61,154,0.5), transparent 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: radius,
          maskImage: revealMask ?? masks[fade],
          WebkitMaskImage: revealMask ?? masks[fade],
        }}
      >
        <div style={{ position: "absolute", left, top, width: iw, height: ih }}>
          <Img src={staticFile(model.src)} style={{ width: "100%", height: "100%", display: "block" }} />
          {showCurves && model.curves.length ? (
            <svg
              viewBox={`0 0 ${model.w} ${model.h}`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFE7AE" stopOpacity="0" />
                  <stop offset="35%" stopColor="#FFE7AE" />
                  <stop offset="70%" stopColor="#FF3D9A" />
                  <stop offset="100%" stopColor="#FF3D9A" stopOpacity="0" />
                </linearGradient>
              </defs>
              {model.curves.map((c, i) => {
                const d = toPath(c.map(([x, y]) => [x * model.w, y * model.h] as [number, number]));
                const sw = model.w * 0.006;
                // halo = traits larges semi-transparents (pas de filtre : rendu rapide)
                return (
                  <g key={i}>
                    {[
                      { w: sw * 6, o: 0.12 * glow, c: "#FF3D9A" },
                      { w: sw * 3, o: 0.3 * glow, c: "#FF3D9A" },
                      { w: sw, o: 1, c: "url(#curveGrad)" },
                    ].map((l, k) => (
                      <path
                        key={k}
                        d={d}
                        fill="none"
                        stroke={l.c}
                        strokeOpacity={l.o}
                        strokeWidth={l.w}
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={draw}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>
          ) : null}
        </div>
        {revealPos !== null ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(105deg, transparent ${revealPos - 8}%, rgba(255,220,240,0.7) ${revealPos - 3}%, transparent ${revealPos + 2}%)`,
              mixBlendMode: "screen",
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

// Titre de section (type « KITS FESSIER »).
export const SectionTitle: React.FC<{ text: string; start: number; size: number }> = ({ text, start, size }) => {
  const s = useEnter(start, SPRING_SOFT);
  return (
    <div style={{ opacity: s, translate: `0px ${interpolate(s, [0, 1], [-30, 0])}px` }}>
      <Tag size={size}>{text}</Tag>
    </div>
  );
};

export const Headline: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({
  children,
  size,
  style,
}) => (
  <div
    style={{
      fontFamily: playfair,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.02,
      color: "#fff",
      textShadow: "0 6px 30px rgba(0,0,0,0.6)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);
