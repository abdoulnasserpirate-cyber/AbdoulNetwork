import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, KITS_FESSIER, Kit, MODELS, formatPrice } from "../data";
import { Background } from "../components/Background";
import { ModelShot, OldPrice, PricePill, SectionTitle } from "../components/ui";
import { EASE_IN, EASE_OUT, SPRING_SOFT, clamp, montserrat, useLayout } from "../theme";
import type { SceneProps } from "./types";

// Carte produit qui arrive en 3D (rotateY 25° -> 0) et sort vers la gauche.
const KitCard: React.FC<{ kit: Kit; enter: number; price: number; exit: number | null; width: number }> = ({
  kit,
  enter,
  price,
  exit,
  width,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isH } = useLayout();
  const s = spring({ frame: frame - enter, fps, config: SPRING_SOFT });
  const out = exit === null ? 0 : interpolate(frame, [exit - 2, exit + 8], [0, 1], { ...clamp, easing: EASE_IN });
  if (frame < enter || out >= 1) return null;
  const nameSize = isH ? 78 : 70;
  return (
    <div
      style={{
        position: "absolute",
        width,
        perspective: 1600,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp) * (1 - out),
        translate: `${interpolate(s, [0, 1], [500, 0]) - out * 900}px 0px`,
      }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          rotate: `0 1 0 ${interpolate(s, [0, 1], [25, 0]) - out * 25}deg`,
          background: "#fff",
          borderRadius: 44,
          padding: isH ? "48px 60px 54px" : "44px 50px 50px",
          boxShadow: `0 30px 90px rgba(0,0,0,0.6), 0 0 0 4px ${COLORS.gold}, 0 0 60px rgba(224,0,111,0.45)`,
        }}
      >
        <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: nameSize, color: "#1a000c", lineHeight: 1.05 }}>{kit.name}</div>
        <div style={{ fontFamily: montserrat, fontWeight: 600, fontSize: isH ? 38 : 40, color: "#9b1457", marginTop: 14, lineHeight: 1.25 }}>
          {kit.composition}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 34, gap: 24 }}>
          <OldPrice value={kit.oldPrice} start={price - 12} size={isH ? 52 : 50} color="#8a7a80" />
          <PricePill value={kit.price} start={price} size={isH ? 104 : 96} variant="magenta" />
        </div>
      </div>
    </div>
  );
};

// 4 — « Kit Sexy Lady : 18 000… Kit Curves : 43 000… Kit Booster Ultra Dosé : 70 000… »
export const S4Kits: React.FC<SceneProps> = ({ cue, duration }) => {
  const frame = useCurrentFrame();
  const { isH, width, height, safeX } = useLayout();
  const voiced = ["sexy-lady", "curves", "booster"].map((id) => KITS_FESSIER.find((k) => k.id === id)!);
  const others = KITS_FESSIER.filter((k) => !voiced.includes(k));
  const enters = [Math.max(0, cue("kit1") - 4), cue("kit2") - 4, cue("kit3") - 4];
  const prices = [cue("prix1"), cue("prix2"), cue("prix3")];
  const cardW = isH ? 1060 : width - 2 * safeX;
  const stripStart = prices[0] + 14;

  return (
    <AbsoluteFill>
      <Background seed="s4" />
      {/* silhouette */}
      <div style={{ position: "absolute", left: 0, top: 0, opacity: isH ? 1 : 0.38 }}>
        <ModelShot
          model={MODELS.robeRougeFleur}
          width={isH ? 640 : width}
          height={height}
          duration={duration}
          zoom={[1.02, 1.12]}
          travel={[0.25, 0.55]}
          curveStart={10}
          fade={isH ? "right" : "none"}
        />
      </div>
      {/* contenu */}
      <div
        style={{
          position: "absolute",
          left: isH ? 680 : safeX,
          top: isH ? 56 : 170,
          width: cardW,
        }}
      >
        <SectionTitle text="KITS FESSIER" start={0} size={isH ? 40 : 44} />
        <div style={{ position: "relative", height: isH ? 510 : 640, marginTop: 30 }}>
          {voiced.map((k, i) => (
            <KitCard key={k.id} kit={k} enter={enters[i]} price={prices[i]} exit={i < 2 ? enters[i + 1] : null} width={cardW} />
          ))}
        </div>
        {/* aussi en promo */}
        <div style={{ marginTop: isH ? 16 : 40 }}>
          <div
            style={{
              fontFamily: montserrat,
              fontWeight: 800,
              fontSize: isH ? 30 : 36,
              letterSpacing: "0.18em",
              color: COLORS.gold,
              opacity: interpolate(frame, [stripStart, stripStart + 8], [0, 1], clamp),
              marginBottom: 10,
            }}
          >
            AUSSI EN PROMO
          </div>
          {others.map((k, i) => {
            const e = interpolate(frame, [stripStart + 4 + i * 6, stripStart + 16 + i * 6], [0, 1], { ...clamp, easing: EASE_OUT });
            return (
              <div
                key={k.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 20,
                  padding: isH ? "10px 0" : "14px 0",
                  borderBottom: "2px solid rgba(242,196,109,0.25)",
                  opacity: e,
                  translate: `${(1 - e) * 80}px 0px`,
                  fontFamily: montserrat,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: isH ? 36 : 40, color: "#fff" }}>{k.name}</span>
                <span style={{ display: "flex", alignItems: "baseline", gap: 16, whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 700, fontSize: isH ? 26 : 30, color: "rgba(255,255,255,0.55)", textDecoration: `line-through ${COLORS.pink} 3px` }}>
                    {formatPrice(k.oldPrice)}
                  </span>
                  <span style={{ fontWeight: 900, fontSize: isH ? 44 : 48, color: COLORS.goldLight }}>{formatPrice(k.price)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
