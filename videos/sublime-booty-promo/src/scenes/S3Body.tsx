import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COLORS, Model, MODELS } from "../data";
import { Background } from "../components/Background";
import { ModelShot, StaggerText, useEnter } from "../components/ui";
import { Flash } from "../components/fx";
import { EASE_OUT, clamp, greatVibes, montserrat, playfair, useLayout } from "../theme";
import type { SceneProps } from "./types";

const WordPlan: React.FC<{
  model: Model;
  top: string;
  bottom: string;
  duration: number;
  side: "left" | "right";
}> = ({ model, top, bottom, duration, side }) => {
  const frame = useCurrentFrame();
  const { isH, width, height, safeX } = useLayout();
  const enter = useEnter(0);
  const dir = side === "left" ? -1 : 1;
  const slide = interpolate(enter, [0, 1], [dir * 260, 0]);
  const modelW = isH ? 700 : width;
  const modelH = isH ? height : 1320;
  return (
    <AbsoluteFill>
      <Background seed={top} rays={false} />
      <div
        style={{
          position: "absolute",
          top: 0,
          [side]: 0,
          translate: `${isH ? slide : 0}px ${isH ? 0 : interpolate(enter, [0, 1], [120, 0])}px`,
          opacity: interpolate(enter, [0, 0.3], [0, 1], clamp),
        }}
      >
        <ModelShot
          model={model}
          width={modelW}
          height={modelH}
          duration={duration}
          zoom={[1.0, 1.1]}
          travel={[0.4, 0.62]}
          curveStart={4}
          fade={isH ? (side === "left" ? "right" : "left") : "bottom"}
        />
      </div>
      <AbsoluteFill
        style={{
          justifyContent: isH ? "center" : "flex-end",
          alignItems: isH ? (side === "left" ? "flex-end" : "flex-start") : "center",
          padding: isH ? `0 ${safeX}px` : `0 ${safeX}px 540px`,
          textAlign: isH ? (side === "left" ? "right" : "left") : "center",
        }}
      >
        <div
          style={{
            width: isH ? 1100 : "100%",
            translate: `${isH ? -slide * 0.6 : 0}px 0px`,
          }}
        >
          <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: isH ? 170 : 132, color: "#fff", lineHeight: 0.95, letterSpacing: "-0.01em" }}>
            <StaggerText text={top} start={0} step={1} />
          </div>
          <div style={{ fontFamily: playfair, fontStyle: "italic", fontWeight: 900, fontSize: isH ? 190 : 140, lineHeight: 1 }}>
            <StaggerText text={bottom} start={3} step={1} gold style={{ paddingRight: "0.1em" }} />
          </div>
          <div
            style={{
              height: 8,
              marginTop: 20,
              width: `${interpolate(frame, [6, 22], [0, 100], { ...clamp, easing: EASE_OUT })}%`,
              background: `linear-gradient(90deg, ${COLORS.magenta}, ${COLORS.gold})`,
              borderRadius: 9,
              marginLeft: isH && side === "left" ? "auto" : !isH ? "auto" : 0,
              marginRight: !isH ? "auto" : 0,
            }}
          />
        </div>
      </AbsoluteFill>
      <Flash at={0} len={5} max={0.5} />
    </AbsoluteFill>
  );
};

// 3 — « Des fesses rondes. Des hanches marquées. Une poitrine ferme. Ton corps en version sublime. »
export const S3Body: React.FC<SceneProps> = ({ cue, duration }) => {
  const frame = useCurrentFrame();
  const { isH, width, height } = useLayout();
  const c1 = Math.max(0, cue("fesses"));
  const c2 = cue("hanches");
  const c3 = cue("poitrine");
  const c4 = cue("corps");
  const s4 = useEnter(c4);
  const panels = [MODELS.robeRougeEpaules, MODELS.robeRougeFleur, MODELS.robeBordeaux];

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={0} durationInFrames={c2} layout="absolute-fill">
        <WordPlan model={MODELS.robeRougeEpaules} top="FESSIERS" bottom="ronds" duration={c2 - c1} side="left" />
      </Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="absolute-fill">
        <WordPlan model={MODELS.robeRougeFleur} top="HANCHES" bottom="marquées" duration={c3 - c2} side="right" />
      </Sequence>
      <Sequence from={c3} durationInFrames={c4 - c3} layout="absolute-fill">
        <WordPlan model={MODELS.robeBordeaux} top="POITRINE" bottom="ferme" duration={c4 - c3} side="left" />
      </Sequence>
      <Sequence from={c4} layout="absolute-fill">
        <AbsoluteFill>
          <Background variant="magenta" seed="s3b" />
          {/* triptyque des trois silhouettes */}
          <AbsoluteFill style={{ flexDirection: "row", justifyContent: "center", gap: isH ? 24 : 12, padding: isH ? "60px 0" : "0" }}>
            {panels.map((m, i) => {
              const e = interpolate(frame - c4 - i * 4, [0, 14], [0, 1], { ...clamp, easing: EASE_OUT });
              return (
                <div key={m.src} style={{ opacity: e, translate: `0px ${(1 - e) * (i % 2 ? -200 : 200)}px` }}>
                  <ModelShot
                    model={m}
                    width={isH ? 520 : (width - 24) / 3}
                    height={isH ? height - 120 : height}
                    duration={duration - c4}
                    zoom={[1.02, 1.12]}
                    curveStart={10}
                    radius={isH ? 30 : 0}
                  />
                </div>
              );
            })}
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)" }} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", translate: `0px ${isH ? -20 : -120}px` }}>
            <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: isH ? 120 : 110, color: "#fff", lineHeight: 1, opacity: s4, scale: String(interpolate(s4, [0, 1], [1.4, 1])) }}>
              TON CORPS
              <br />
              <span style={{ fontSize: isH ? 60 : 56, letterSpacing: "0.2em" }}>EN VERSION</span>
            </div>
            <div
              style={{
                fontFamily: greatVibes,
                fontSize: isH ? 230 : 200,
                color: COLORS.goldLight,
                lineHeight: 1.1,
                textShadow: `0 0 40px ${COLORS.magenta}, 0 6px 20px rgba(0,0,0,0.6)`,
                clipPath: `inset(0 ${interpolate(frame, [c4 + 10, c4 + 34], [100, 0], { ...clamp, easing: EASE_OUT })}% 0 0)`,
              }}
            >
              Sublime
            </div>
          </AbsoluteFill>
          <Flash at={c4} len={6} max={0.6} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
