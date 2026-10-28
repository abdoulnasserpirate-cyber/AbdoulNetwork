import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TIRAGE, formatPrice } from "../data";
import { Background } from "../components/Background";
import { Gold, useEnter } from "../components/ui";
import { Confetti, Flash, useShake } from "../components/fx";
import { EASE_OUT, clamp, montserrat, playfair, useLayout } from "../theme";
import type { SceneProps } from "./types";

// Coffret cadeau SVG dont le couvercle s'ouvre.
const GiftBox: React.FC<{ size: number; openAt: number; appear: number }> = ({ size, openAt, appear }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - appear, fps, config: { damping: 12, mass: 0.8 } });
  const o = spring({ frame: frame - openAt, fps, config: { damping: 10, mass: 0.6 } });
  const wobble = frame < openAt ? Math.sin(frame * 0.9) * interpolate(frame, [openAt - 20, openAt], [0, 6], clamp) : 0;
  const light = interpolate(frame, [openAt, openAt + 10], [0, 1], clamp);
  return (
    <div style={{ width: size, height: size, position: "relative", scale: String(a), rotate: `${wobble}deg` }}>
      {/* lumière qui sort du coffret */}
      <div
        style={{
          position: "absolute",
          left: size * 0.1,
          top: -size * 0.75,
          width: size * 0.8,
          height: size * 1.25,
          background: "linear-gradient(0deg, rgba(255,231,174,0.95), rgba(255,231,174,0) 90%)",
          clipPath: "polygon(30% 100%, 70% 100%, 100% 0%, 0% 0%)",
          opacity: light * (0.75 + 0.25 * Math.sin(frame / 4)),
          filter: "blur(6px)",
        }}
      />
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="boxG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COLORS.pink} />
            <stop offset="1" stopColor="#8a0045" />
          </linearGradient>
          <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COLORS.goldLight} />
            <stop offset="1" stopColor={COLORS.goldDark} />
          </linearGradient>
        </defs>
        <rect x="30" y="90" width="140" height="100" rx="8" fill="url(#boxG)" />
        <rect x="88" y="90" width="24" height="100" fill="url(#gold)" />
        <g
          style={{
            transformOrigin: "30px 90px",
            transformBox: "view-box",
            translate: `${interpolate(o, [0, 1], [0, -26])}px ${interpolate(o, [0, 1], [0, -70])}px`,
            rotate: `${interpolate(o, [0, 1], [0, -28])}deg`,
          }}
        >
          <rect x="22" y="68" width="156" height="28" rx="6" fill="url(#boxG)" stroke="#5c002d" strokeWidth="1" />
          <rect x="88" y="68" width="24" height="28" fill="url(#gold)" />
          <path d="M100 68 C 70 30, 50 50, 70 66 Z" fill="url(#gold)" />
          <path d="M100 68 C 130 30, 150 50, 130 66 Z" fill="url(#gold)" />
          <circle cx="100" cy="66" r="8" fill={COLORS.goldDark} />
        </g>
      </svg>
    </div>
  );
};

// 7 — « À la fin de la promo, grand tirage au sort : gagne un kit de 50 000 à 200 000 francs. Tous frais payés. »
export const S7Tirage: React.FC<SceneProps> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { isH, width, safeX } = useLayout();
  const fin = cue("fin");
  const tirage = cue("tirage");
  const gagne = cue("gagne");
  const min = cue("min");
  const max = cue("max");
  const frais = cue("frais");
  const shake = useShake(tirage, 14, 16);
  const pasToutS = useEnter(0);
  const titleS = useEnter(tirage + 2);
  const gagneS = useEnter(gagne);
  const fraisS = spring({ frame: frame - frais, fps: 30, config: { damping: 11, mass: 0.7, stiffness: 190 } });
  const count = (from: number, to: number, at: number) =>
    Math.round(interpolate(frame, [at, at + 16], [from, to], { ...clamp, easing: EASE_OUT }) / 1000) * 1000;

  const textW = isH ? 1060 : width - 2 * safeX;

  return (
    <AbsoluteFill style={{ translate: shake }}>
      <Background seed="s7" />
      {/* « Et ce n'est pas tout… » */}
      {frame < fin + 4 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: playfair,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: isH ? 130 : 110,
              color: "#fff",
              textAlign: "center",
              opacity: pasToutS * interpolate(frame, [fin, fin + 4], [1, 0], clamp),
              scale: String(interpolate(pasToutS, [0, 1], [1.3, 1])),
            }}
          >
            Et ce n’est
            <br />
            <Gold>pas tout…</Gold>
          </div>
        </AbsoluteFill>
      ) : null}

      {frame >= fin ? (
        <div
          style={{
            position: "absolute",
            left: isH ? 170 : width / 2 - 260,
            top: isH ? 330 : 330,
          }}
        >
          <GiftBox size={isH ? 560 : 520} appear={fin} openAt={tirage} />
        </div>
      ) : null}

      {frame >= tirage ? (
        <div
          style={{
            position: "absolute",
            left: isH ? 790 : safeX,
            top: isH ? 150 : 880,
            width: textW,
            textAlign: isH ? "left" : "center",
          }}
        >
          <div
            style={{
              fontFamily: montserrat,
              fontWeight: 900,
              fontSize: isH ? 40 : 40,
              letterSpacing: "0.22em",
              color: COLORS.gold,
              opacity: titleS,
            }}
          >
            {TIRAGE.title}
          </div>
          <div
            style={{
              fontFamily: playfair,
              fontWeight: 900,
              fontSize: isH ? 76 : 66,
              color: "#fff",
              lineHeight: 1.05,
              marginTop: 12,
              opacity: titleS,
              translate: `0px ${(1 - titleS) * 40}px`,
            }}
          >
            À la fin de la promo,
            <br />
            gagnez un kit offert&nbsp;!
          </div>
          {frame >= gagne ? (
            <div style={{ marginTop: isH ? 34 : 28, opacity: gagneS }}>
              <div style={{ fontFamily: montserrat, fontWeight: 800, fontSize: isH ? 40 : 40, color: COLORS.goldLight, letterSpacing: "0.16em" }}>
                KITS À GAGNER
              </div>
              <div
                style={{
                  fontFamily: montserrat,
                  fontWeight: 900,
                  fontSize: isH ? 96 : 84,
                  color: COLORS.yellow,
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: isH ? 52 : 46, color: "#fff" }}>de </span>
                {frame >= min ? formatPrice(count(0, TIRAGE.min, min)) : "…"}
                {frame >= max ? (
                  <>
                    <span style={{ fontSize: isH ? 52 : 46, color: "#fff" }}> à </span>
                    {formatPrice(count(TIRAGE.min, TIRAGE.max, max))}
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          {frame >= frais ? (
            <div
              style={{
                display: "inline-block",
                marginTop: isH ? 30 : 30,
                background: COLORS.yellow,
                color: "#1a000c",
                fontFamily: montserrat,
                fontWeight: 900,
                fontSize: isH ? 58 : 56,
                letterSpacing: "0.1em",
                padding: "16px 46px",
                borderRadius: 99,
                scale: String(interpolate(fraisS, [0, 1], [2.2, 1])),
                opacity: interpolate(fraisS, [0, 0.3], [0, 1], clamp),
                boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 40px rgba(255,225,77,0.6)",
              }}
            >
              {TIRAGE.badge}
            </div>
          ) : null}
        </div>
      ) : null}
      <Confetti start={tirage + 2} x={isH ? 0.23 : 0.5} y={isH ? 0.45 : 0.3} count={120} seed="s7" />
      <Confetti start={max + 4} x={isH ? 0.7 : 0.5} y={0.6} count={70} seed="s7b" power={0.8} />
      <Flash at={tirage} len={8} max={0.75} />
    </AbsoluteFill>
  );
};
