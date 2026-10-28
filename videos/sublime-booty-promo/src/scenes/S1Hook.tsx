import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Trail } from "@remotion/motion-blur";
import { COLORS, MODELS } from "../data";
import { Background, glitchShift } from "../components/Background";
import { ModelShot, StaggerText, useEnter } from "../components/ui";
import { Flash, punch } from "../components/fx";
import { EASE_OUT, clamp, montserrat, playfair, useLayout } from "../theme";
import type { SceneProps } from "./types";

// 1 — « Stop. Regarde-toi. Tu mérites des courbes qui font tourner les têtes. »
export const S1Hook: React.FC<SceneProps> = ({ cue, duration }) => {
  const frame = useCurrentFrame();
  const { isH, width, height, safeX } = useLayout();
  const merites = cue("merites");
  const tetes = cue("tetes");
  const stopOut = 16;
  const g = glitchShift(frame, 0, 5);
  const stopS = useEnter(0);
  const regS = useEnter(stopOut);

  const modelW = isH ? 760 : width;
  const modelH = isH ? height : 1180;

  const big = isH ? 128 : 112;

  return (
    <AbsoluteFill style={{ background: "#000", scale: String(punch(frame, 0, 0.06) * punch(frame, merites, 0.04)) }}>
      {frame > 6 ? <Background seed="s1" /> : null}
      {/* silhouette révélée par un balayage de lumière */}
      <div style={{ position: "absolute", right: 0, top: 0 }}>
        <ModelShot
          model={MODELS.pullBordeaux}
          width={modelW}
          height={modelH}
          duration={duration}
          zoom={[1.12, 1.02]}
          travel={[0.3, 0.42]}
          fade={isH ? "left" : "bottom"}
          reveal={8}
          showCurves={false}
        />
      </div>

      {/* STOP. */}
      {frame < stopOut + 4 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Trail layers={4} lagInFrames={0.6} trailOpacity={0.6}>
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  fontFamily: montserrat,
                  fontWeight: 900,
                  fontSize: isH ? 360 : 300,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  scale: String(interpolate(stopS, [0, 1], [2.2, 1])),
                  opacity: interpolate(frame, [stopOut, stopOut + 4], [1, 0], clamp),
                  textShadow: `${g}px 0 0 ${COLORS.pink}, ${-g}px 0 0 #00E5FF, 0 0 60px rgba(224,0,111,0.8)`,
                }}
              >
                STOP.
              </div>
            </AbsoluteFill>
          </Trail>
        </AbsoluteFill>
      ) : null}

      {/* textes */}
      <AbsoluteFill
        style={{
          justifyContent: isH ? "center" : "flex-end",
          alignItems: isH ? "flex-start" : "center",
          padding: isH ? `0 0 0 ${safeX}px` : `0 ${safeX}px 540px`,
          textAlign: isH ? "left" : "center",
        }}
      >
        <div style={{ width: isH ? 1150 : "100%" }}>
          {frame >= stopOut ? (
            <div
              style={{
                fontFamily: playfair,
                fontStyle: "italic",
                fontWeight: 900,
                fontSize: isH ? 96 : 92,
                color: "#fff",
                opacity: regS,
                translate: `0px ${interpolate(regS, [0, 1], [40, 0])}px`,
                marginBottom: 18,
              }}
            >
              Regarde-toi.
            </div>
          ) : null}
          {frame >= merites ? (
            <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: big, lineHeight: 1.02, color: "#fff" }}>
              <StaggerText text="TU MÉRITES DES" start={merites} by="word" step={3} />
              <br />
              <StaggerText text="COURBES" start={merites + 8} step={2} gold style={{ fontSize: big * 1.12 }} />
            </div>
          ) : null}
          {frame >= merites + 18 ? (
            <div
              style={{
                fontFamily: montserrat,
                fontWeight: 800,
                fontSize: isH ? 58 : 58,
                color: "#fff",
                marginTop: 18,
                opacity: interpolate(frame, [merites + 18, merites + 26], [0, 1], { ...clamp, easing: EASE_OUT }),
              }}
            >
              qui font tourner les{" "}
              <span
                style={{
                  color: COLORS.pink,
                  display: "inline-block",
                  scale: String(punch(frame, tetes, 0.35)),
                  textShadow: `0 0 30px ${COLORS.magenta}`,
                }}
              >
                têtes.
              </span>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      <Flash at={3} len={8} max={1} />
    </AbsoluteFill>
  );
};
