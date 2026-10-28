import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PAGES } from "../cues";
import { COLORS } from "../data";
import { clamp, montserrat, useLayout } from "../theme";

// Sous-titres style TikTok : Montserrat 900, blanc contour noir, mot prononcé en magenta.
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isH, safeBottom } = useLayout();
  const ms = (frame / fps) * 1000;
  const page = PAGES.find((p) => ms >= p.startMs && ms < p.endMs);
  if (!page) return null;
  const pageFrame = (page.startMs / 1000) * fps;
  const size = isH ? 54 : 62;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: isH ? 46 : safeBottom + 20, pointerEvents: "none" }}>
      <div
        style={{
          textAlign: "center",
          wordSpacing: "0.12em",
          maxWidth: isH ? 1500 : 940,
          fontFamily: montserrat,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.12,
          textTransform: "uppercase",
          scale: String(interpolate(frame, [pageFrame, pageFrame + 4], [0.85, 1], clamp)),
        }}
      >
        {page.words.map((w, i) => {
          const active = ms >= w.startMs && ms < w.endMs + 60;
          return (
            <span
              key={i}
              style={{
                color: active ? COLORS.pink : "#fff",
                WebkitTextStroke: `${size * 0.14}px #000`,
                paintOrder: "stroke fill",
                textShadow: "0 4px 12px rgba(0,0,0,0.7)",
              }}
            >
              {w.text}
              {i < page.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
