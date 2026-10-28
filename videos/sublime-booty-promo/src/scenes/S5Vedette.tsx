import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, KIT_VEDETTE, MODELS } from "../data";
import { Background, Sparkles } from "../components/Background";
import { ModelShot, OldPrice, PricePill, StarBurst, StaggerText, Tag, useEnter } from "../components/ui";
import { Confetti, Flash } from "../components/fx";
import { EASE_OUT, SPRING_SOFT, clamp, montserrat, playfair, useLayout } from "../theme";
import type { SceneProps } from "./types";

// 5 — « Et la star : le Kit Spécial Amaria, 100 000 au lieu de 130 000. »
export const S5Vedette: React.FC<SceneProps> = ({ cue, duration }) => {
  const frame = useCurrentFrame();
  const { isH, width, height, safeX } = useLayout();
  const amaria = cue("amaria");
  const prix = cue("prixAmaria");
  const auLieu = cue("auLieu");
  const tagS = useEnter(2, SPRING_SOFT);
  const compo = interpolate(frame, [amaria + 10, amaria + 22], [0, 1], { ...clamp, easing: EASE_OUT });
  // ralenti : zoom lent sur toute la scène
  const slow = interpolate(frame, [0, duration], [1, 1.06]);

  const modelW = isH ? 720 : width;
  const modelH = isH ? height : 760;

  return (
    <AbsoluteFill style={{ scale: String(slow) }}>
      <Background variant="gold" seed="s5" />
      <div style={{ position: "absolute", right: 0, top: 0 }}>
        <ModelShot
          model={MODELS.robeRougeEpaules}
          width={modelW}
          height={modelH}
          duration={duration}
          zoom={[1.0, 1.08]}
          travel={[0.35, 0.55]}
          curveStart={amaria}
          fade={isH ? "left" : "bottom"}
        />
      </div>
      <Sparkles seed="s5b" count={60} speed={0.4} />
      <div
        style={{
          position: "absolute",
          left: safeX,
          top: isH ? 110 : 640,
          width: isH ? 1060 : width - 2 * safeX,
          textAlign: isH ? "left" : "center",
        }}
      >
        <div style={{ opacity: tagS, translate: `0px ${interpolate(tagS, [0, 1], [-30, 0])}px` }}>
          <Tag size={isH ? 40 : 42} bg="#1a000c" color={COLORS.yellow}>
            ★ KIT VEDETTE
          </Tag>
        </div>
        {frame >= amaria ? (
          <div style={{ fontFamily: playfair, fontStyle: "italic", fontWeight: 900, fontSize: isH ? 116 : 100, color: "#1a000c", lineHeight: 1, marginTop: 24 }}>
            <StaggerText text={KIT_VEDETTE.name} start={amaria} by="word" step={4} />
          </div>
        ) : null}
        <div
          style={{
            fontFamily: montserrat,
            fontWeight: 700,
            fontSize: isH ? 40 : 40,
            color: "#5a0a30",
            marginTop: 20,
            lineHeight: 1.3,
            opacity: compo,
            translate: `0px ${(1 - compo) * 30}px`,
          }}
        >
          {KIT_VEDETTE.composition}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isH ? "flex-start" : "center",
            flexWrap: "wrap",
            gap: 34,
            marginTop: isH ? 40 : 34,
          }}
        >
          {frame >= prix - 1 ? <PricePill value={KIT_VEDETTE.price} start={prix} size={isH ? 170 : 124} variant="black" /> : null}
          <OldPrice value={KIT_VEDETTE.oldPrice} start={auLieu} size={isH ? 70 : 64} color="#3a0a20" />
        </div>
      </div>
      <div style={{ position: "absolute", right: isH ? 640 : 40, top: isH ? 700 : 60, scale: String(useEnter(prix + 6)) }}>
        <StarBurst size={isH ? 240 : 220} line1="OFFRE" line2="CHOC" />
      </div>
      <Confetti start={prix + 2} x={isH ? 0.3 : 0.5} y={isH ? 0.65 : 0.72} seed="s5" power={0.8} />
      <Flash at={0} len={6} color="#FFF3CF" max={0.8} />
    </AbsoluteFill>
  );
};
