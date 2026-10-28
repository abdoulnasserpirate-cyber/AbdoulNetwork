import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BRAND, COLORS, MODELS, PROMO, WHATSAPP } from "../data";
import { Background } from "../components/Background";
import { LogoPlate, ModelShot, useEnter } from "../components/ui";
import { punch } from "../components/fx";
import { EASE_OUT, clamp, greatVibes, montserrat, useLayout } from "../theme";
import type { SceneProps } from "./types";
import type { CueKey } from "../cues";

const WhatsAppIcon: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const ring = (frame % 30) / 30;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `4px solid #25D366`,
          scale: String(1 + ring * 0.6),
          opacity: 1 - ring,
        }}
      />
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ scale: String(1 + 0.06 * Math.sin(frame / 4)) }}>
        <circle cx="50" cy="50" r="48" fill="#25D366" />
        <path d="M50 20 a28 28 0 0 0 -24 42 l-4 16 l16 -4 a28 28 0 1 0 12 -54 z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
        <path
          d="M39 36 c2 -2 5 -2 6 1 l2 6 c0 2 -1 3 -2 4 c2 5 6 9 11 11 c1 -1 2 -2 4 -2 l6 2 c3 1 3 4 1 6 c-3 4 -8 5 -13 2 c-7 -4 -13 -10 -16 -17 c-2 -5 -1 -10 1 -13 z"
          fill="#fff"
        />
      </svg>
    </div>
  );
};

// 9 — « Écris-nous maintenant sur WhatsApp : 92 48 56 12. Sublime Booty by Chris. Ton corps. Ton royaume. »
export const S9Final: React.FC<SceneProps> = ({ cue, duration }) => {
  const frame = useCurrentFrame();
  const { isH, width, height, safeX } = useLayout();
  const numero = cue("numero");
  const n12 = cue("n12");
  const marque = cue("marque");
  const royaume = cue("royaume");
  const labelS = useEnter(2);
  const btnS = useEnter(n12 + 10);
  const logoS = useEnter(marque - 4);
  const sloganReveal = interpolate(frame, [royaume, royaume + 30], [100, 0], { ...clamp, easing: EASE_OUT });

  const groups: { text: string; at: number }[] = [
    { text: "+227", at: numero - 8 },
    ...(["numero", "n48", "n56", "n12"] as CueKey[]).map((k, i) => ({ text: ["92", "48", "56", "12"][i], at: cue(k) })),
  ];
  const sweep = interpolate((frame - n12) % 75, [0, 30], [-40, 140], clamp);
  const btnPulse = 1 + 0.045 * Math.sin(frame / 5);

  const zoneLeft = isH ? 620 : safeX;
  const zoneW = isH ? width - 620 - safeX : width - 2 * safeX;
  const numSize = isH ? 116 : 140;

  return (
    <AbsoluteFill>
      <Background variant="dark" seed="s9" />
      {isH ? (
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <ModelShot model={MODELS.robeBordeaux} width={600} height={height} duration={duration} zoom={[1.0, 1.08]} travel={[0.3, 0.5]} curveStart={14} fade="right" />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: zoneLeft,
          width: zoneW,
          top: isH ? 50 : 150,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: isH ? 22 : 34,
        }}
      >
        <div style={{ opacity: logoS, scale: String(interpolate(logoS, [0, 1], [0.7, 1])), height: isH ? 205 : 267 }}>
          {frame >= marque - 4 ? <LogoPlate width={isH ? 400 : 520} shineStart={marque} /> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: labelS, translate: `0px ${(1 - labelS) * 30}px` }}>
          <WhatsAppIcon size={isH ? 96 : 110} />
          <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: isH ? 40 : 42, letterSpacing: "0.14em", color: COLORS.gold, textAlign: "left", lineHeight: 1.15 }}>
            COMMANDEZ
            <br />
            SUR WHATSAPP
          </div>
        </div>
        <div
          style={{
            position: "relative",
            fontFamily: montserrat,
            fontWeight: 900,
            fontSize: numSize,
            color: "#fff",
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            padding: "6px 10px",
            display: "flex",
            flexWrap: isH ? "nowrap" : "wrap",
            justifyContent: "center",
            columnGap: numSize * 0.28,
            rowGap: 8,
            width: "100%",
          }}
        >
          {groups.map((g, i) => {
            const o = interpolate(frame, [g.at, g.at + 6], [0, 1], { ...clamp, easing: EASE_OUT });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: o,
                  translate: `0px ${(1 - o) * 50}px`,
                  scale: String(punch(frame, g.at, 0.25)),
                  fontSize: i === 0 && !isH ? numSize * 0.6 : undefined,
                  width: i === 0 && !isH ? "100%" : undefined,
                  color: i === 0 ? COLORS.goldLight : "#fff",
                }}
              >
                {g.text}
              </span>
            );
          })}
          <span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sweep}%`,
              width: "18%",
              background: "linear-gradient(100deg, rgba(255,231,174,0), rgba(255,231,174,0.35), rgba(255,231,174,0))",
              opacity: frame > n12 && sweep > -40 && sweep < 120 ? 1 : 0,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: montserrat,
            fontWeight: 900,
            fontSize: isH ? 50 : 52,
            color: "#fff",
            background: `linear-gradient(180deg, ${COLORS.pink}, ${COLORS.magenta})`,
            padding: isH ? "22px 64px" : "26px 60px",
            borderRadius: 99,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            opacity: btnS,
            scale: String(interpolate(btnS, [0, 1], [0.6, 1]) * btnPulse),
            boxShadow: `0 0 ${40 + 20 * Math.sin(frame / 5)}px rgba(255,61,154,0.8), 0 0 0 4px ${COLORS.gold}`,
          }}
        >
          {WHATSAPP.cta}
        </div>
        <div
          style={{
            fontFamily: montserrat,
            fontWeight: 800,
            fontSize: isH ? 38 : 40,
            letterSpacing: "0.12em",
            color: COLORS.goldLight,
            border: `3px solid ${COLORS.gold}`,
            borderRadius: 99,
            padding: "10px 36px",
            opacity: btnS,
          }}
        >
          {PROMO.dates}
        </div>
        <div
          style={{
            fontFamily: greatVibes,
            fontSize: isH ? 96 : 104,
            color: COLORS.pink,
            lineHeight: 1.1,
            textShadow: `0 0 30px rgba(224,0,111,0.7)`,
            clipPath: `inset(-20% ${sloganReveal}% -20% 0)`,
            whiteSpace: "nowrap",
          }}
        >
          {BRAND.slogan}
        </div>
      </div>
    </AbsoluteFill>
  );
};
