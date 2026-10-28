import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, KITS_MINCEUR, KITS_SEINS, Kit, MODELS, formatPrice } from "../data";
import { Background } from "../components/Background";
import { ModelShot, OldPrice, PricePill, Tag } from "../components/ui";
import { EASE_OUT, clamp, montserrat, playfair, useLayout } from "../theme";
import type { SceneProps } from "./types";

const Panel: React.FC<{
  title: string;
  heading: string;
  main: Kit;
  second: Kit;
  start: number;
  price: number;
  active: boolean;
  width: number;
  height: number;
  vertical: boolean;
}> = ({ title, heading, main, second, start, price, active, width, height, vertical }) => {
  const frame = useCurrentFrame();
  const { isH } = useLayout();
  // wipe vertical d'entrée
  const wipe = interpolate(frame, [start, start + 14], [100, 0], { ...clamp, easing: EASE_OUT });
  const focus = interpolate(active ? 1 : 0, [0, 1], [0.55, 1]);
  return (
    <div
      style={{
        width,
        height,
        clipPath: vertical ? `inset(0 0 ${wipe}% 0 round 40px)` : `inset(0 0 ${wipe}% 0 round 40px)`,
        background: "linear-gradient(180deg, #fff 0%, #FFF1F7 100%)",
        borderRadius: 40,
        padding: isH ? "40px 48px" : "34px 44px",
        boxSizing: "border-box",
        boxShadow: active ? `0 0 0 5px ${COLORS.gold}, 0 0 80px rgba(224,0,111,0.6)` : "0 0 0 2px rgba(242,196,109,0.4)",
        opacity: focus,
        scale: String(active ? 1.0 : 0.96),
        display: "flex",
        flexDirection: "column",
        gap: isH ? 16 : 12,
      }}
    >
      <div>
        <Tag size={isH ? 30 : 32}>{title}</Tag>
      </div>
      <div style={{ fontFamily: playfair, fontStyle: "italic", fontWeight: 900, fontSize: isH ? 60 : 58, color: COLORS.magenta, lineHeight: 1 }}>{heading}</div>
      <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: isH ? 60 : 58, color: "#1a000c", lineHeight: 1.05 }}>{main.name}</div>
      {main.composition ? (
        <div style={{ fontFamily: montserrat, fontWeight: 600, fontSize: isH ? 34 : 36, color: "#9b1457" }}>{main.composition}</div>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 6 }}>
        <PricePill value={main.price} start={price} size={isH ? 96 : 88} count variant="magenta" />
        <OldPrice value={main.oldPrice} start={price + 10} size={isH ? 46 : 46} color="#8a7a80" />
      </div>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid rgba(224,0,111,0.2)",
          paddingTop: 16,
          fontFamily: montserrat,
          opacity: interpolate(frame, [start + 16, start + 26], [0, 1], clamp),
        }}
      >
        <span style={{ fontWeight: 800, fontSize: isH ? 34 : 36, color: "#1a000c" }}>{second.name}</span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 12, whiteSpace: "nowrap" }}>
          <span style={{ fontWeight: 700, fontSize: isH ? 26 : 28, color: "#8a7a80", textDecoration: `line-through ${COLORS.pink} 3px` }}>
            {formatPrice(second.oldPrice)}
          </span>
          <span style={{ fontWeight: 900, fontSize: isH ? 42 : 44, color: COLORS.magenta }}>{formatPrice(second.price)}</span>
        </span>
      </div>
    </div>
  );
};

// 6 — « Pour ta poitrine : Kit Gros Lolo Luxe, 25 000. Pour un ventre plat : thé et crème, 20 000. »
export const S6Split: React.FC<SceneProps> = ({ cue, duration }) => {
  const frame = useCurrentFrame();
  const { isH, width, height, safeX } = useLayout();
  const ventre = cue("pourVentre");
  const activeSeins = frame < ventre;
  const gap = isH ? 50 : 40;
  const pw = isH ? (width - 2 * safeX - gap) / 2 : width - 2 * safeX;
  const ph = isH ? 740 : 600;

  return (
    <AbsoluteFill>
      <Background seed="s6" />
      <AbsoluteFill style={{ opacity: 0.22 }}>
        <ModelShot model={MODELS.robeBordeaux} width={width} height={height} duration={duration} showCurves={false} travel={[0.3, 0.5]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)" }} />
      <div
        style={{
          position: "absolute",
          left: safeX,
          top: isH ? 90 : 170,
          display: "flex",
          flexDirection: isH ? "row" : "column",
          gap,
        }}
      >
        <Panel
          title="KITS SEINS"
          heading="Pour ta poitrine"
          main={KITS_SEINS[0]}
          second={KITS_SEINS[1]}
          start={0}
          price={cue("prixLolo")}
          active={activeSeins}
          width={pw}
          height={ph}
          vertical={!isH}
        />
        <Panel
          title="KITS MINCEUR"
          heading="Pour un ventre plat"
          main={KITS_MINCEUR[0]}
          second={KITS_MINCEUR[1]}
          start={8}
          price={cue("prixVentre")}
          active={!activeSeins}
          width={pw}
          height={ph}
          vertical={!isH}
        />
      </div>
    </AbsoluteFill>
  );
};
