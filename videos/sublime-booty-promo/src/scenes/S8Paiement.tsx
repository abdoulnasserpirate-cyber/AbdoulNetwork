import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, LIVRAISON, PAIEMENT } from "../data";
import { Background } from "../components/Background";
import { Tag, useEnter } from "../components/ui";
import { EASE_OUT, clamp, montserrat, playfair, useLayout } from "../theme";
import type { SceneProps } from "./types";
import type { CueKey } from "../cues";

// Contour simplifié du Niger (longitude, latitude).
const NIGER: [number, number][] = [
  [0.2, 14.9], [1.3, 15.3], [3.6, 15.5], [4.2, 16.9], [4.25, 19.15], [5.8, 19.45], [7.45, 20.85],
  [11.99, 23.52], [13.5, 23.0], [15.0, 23.0], [15.2, 21.5], [15.9, 20.4], [15.5, 18.0], [15.3, 16.9],
  [13.9, 15.7], [13.5, 14.4], [13.6, 13.7], [12.3, 13.1], [10.7, 13.4], [9.0, 12.8], [7.8, 13.3],
  [6.8, 13.1], [5.5, 13.9], [4.1, 13.5], [3.6, 12.5], [3.6, 11.7], [2.4, 11.9], [2.2, 12.4],
  [1.0, 12.8], [0.4, 13.0], [0.9, 13.6],
];
const project = ([lon, lat]: [number, number]) => [(lon / 16.2) * 1000, ((23.7 - lat) / 12.2) * 760];
const NIGER_PATH = NIGER.map((p, i) => `${i ? "L" : "M"} ${project(p).join(" ")}`).join(" ") + " Z";
const CITIES: { name: string; ll: [number, number]; main?: boolean }[] = [
  { name: "Niamey", ll: [2.11, 13.51] },
  { name: "Maradi", ll: [7.1, 13.5], main: true },
  { name: "Zinder", ll: [8.99, 13.8] },
  { name: "Agadez", ll: [7.99, 16.97] },
];

const Truck: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 40" width={size} height={size * 0.625}>
    <rect x="2" y="6" width="38" height="22" rx="3" fill={COLORS.magenta} stroke="#fff" strokeWidth="2" />
    <path d="M40 12 h12 l8 9 v7 h-20 z" fill="#fff" />
    <rect x="44" y="14" width="8" height="6" fill={COLORS.magenta} />
    <circle cx="14" cy="31" r="5" fill="#1a000c" stroke="#fff" strokeWidth="2" />
    <circle cx="50" cy="31" r="5" fill="#1a000c" stroke="#fff" strokeWidth="2" />
  </svg>
);

const NigerMap: React.FC<{ start: number; width: number }> = ({ start, width }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [start, start + 24], [1, 0], { ...clamp, easing: EASE_OUT });
  const route = [CITIES[0], CITIES[1], CITIES[2]].map((c) => project(c.ll));
  const t = interpolate(frame, [start + 10, start + 50], [0, 1], { ...clamp, easing: EASE_OUT });
  const seg = t < 0.5 ? 0 : 1;
  const k = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const pos = [route[seg][0] + (route[seg + 1][0] - route[seg][0]) * k, route[seg][1] + (route[seg + 1][1] - route[seg][1]) * k];
  const scale = width / 1000;
  return (
    <div style={{ position: "relative", width, height: 760 * scale }}>
      <svg viewBox="0 0 1000 760" width={width} height={760 * scale} style={{ overflow: "visible" }}>
        <path d={NIGER_PATH} fill="rgba(224,0,111,0.18)" stroke={COLORS.gold} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={draw} strokeLinejoin="round" />
        <polyline
          points={route.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={COLORS.pink}
          strokeWidth={5}
          strokeDasharray="14 12"
          opacity={interpolate(frame, [start + 8, start + 14], [0, 1], clamp)}
        />
        {CITIES.map((c) => {
          const [x, y] = project(c.ll);
          const o = interpolate(frame, [start + 12, start + 20], [0, 1], clamp);
          return (
            <g key={c.name} opacity={o}>
              <circle cx={x} cy={y} r={c.main ? 16 + 4 * Math.sin(frame / 4) : 10} fill={c.main ? COLORS.pink : COLORS.gold} />
              <text x={x} y={y - 26} fill="#fff" fontFamily={montserrat} fontWeight={800} fontSize={c.main ? 46 : 34} textAnchor="middle">
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: pos[0] * scale - 50, top: pos[1] * scale - 62, opacity: t > 0 ? 1 : 0 }}>
        <Truck size={100} />
      </div>
    </div>
  );
};

// 8 — « Paie par NITA, Amana, Wave, Western Union ou Ria. Livraison discrète, partout au Niger. »
export const S8Paiement: React.FC<SceneProps> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isH, width, safeX } = useLayout();
  const liv = cue("livraison");
  const names: CueKey[] = ["nita", "amana", "wave", "western", "ria"];
  const toTop = interpolate(frame, [liv - 4, liv + 10], [0, 1], { ...clamp, easing: EASE_OUT });
  const titleS = useEnter(0);
  const livS = useEnter(liv + 4);

  const tile = isH ? interpolate(toTop, [0, 1], [270, 170]) : interpolate(toTop, [0, 1], [290, 160]);
  const tileGap = isH ? 30 : 26;

  return (
    <AbsoluteFill>
      <Background seed="s8" />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: isH ? interpolate(toTop, [0, 1], [190, 60]) : interpolate(toTop, [0, 1], [260, 150]),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ opacity: titleS, scale: String(interpolate(toTop, [0, 1], [1, 0.8])) }}>
          <Tag size={isH ? 44 : 46}>PAIEMENT FACILE</Tag>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: tileGap,
            marginTop: isH ? 40 : 40,
            width: isH ? 1700 : width - 2 * safeX + 40,
          }}
        >
          {PAIEMENT.logos.map((l, i) => {
            const s = spring({ frame: frame - 2 - i * 3, fps, config: { damping: 9, mass: 0.7, stiffness: 160 } });
            const spoken = cue(names[i]);
            const hl = interpolate(frame, [spoken, spoken + 3, spoken + 14], [0, 1, 0], clamp);
            return (
              <div
                key={l.name}
                style={{
                  width: tile,
                  height: tile,
                  borderRadius: tile * 0.18,
                  background: l.bg,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  translate: `0px ${interpolate(s, [0, 1], [-900, 0])}px`,
                  scale: String(1 + hl * 0.12),
                  boxShadow: `0 0 0 ${4 + hl * 6}px ${hl > 0.05 ? COLORS.pink : COLORS.gold}, 0 18px 40px rgba(0,0,0,0.5)`,
                }}
              >
                <Img src={staticFile(l.src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: isH ? 34 : 34,
            fontFamily: montserrat,
            fontWeight: 700,
            fontSize: isH ? 34 : 36,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            opacity: interpolate(frame, [20, 30], [0, 1], clamp) * interpolate(toTop, [0, 1], [1, 0.9]),
          }}
        >
          Dépôt : <span style={{ color: COLORS.goldLight, fontWeight: 900 }}>{PAIEMENT.numero}</span>
          {isH ? " — " : <br />}
          Titulaire : {PAIEMENT.titulaire}
        </div>
      </div>

      {frame >= liv ? (
        <div
          style={{
            position: "absolute",
            left: safeX,
            right: safeX,
            top: isH ? 500 : 640,
            display: "flex",
            flexDirection: isH ? "row" : "column",
            alignItems: "center",
            justifyContent: "center",
            gap: isH ? 60 : 10,
            opacity: livS,
            translate: `0px ${(1 - livS) * 60}px`,
          }}
        >
          <NigerMap start={liv + 2} width={isH ? 560 : 440} />
          <div style={{ textAlign: isH ? "left" : "center" }}>
            <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: isH ? 78 : 76, color: "#fff", lineHeight: 1 }}>{LIVRAISON.title}</div>
            <div style={{ fontFamily: playfair, fontStyle: "italic", fontWeight: 700, fontSize: isH ? 46 : 44, color: COLORS.goldLight, marginTop: 10 }}>
              {LIVRAISON.subtitle}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 20, justifyContent: isH ? "flex-start" : "center", flexWrap: "wrap" }}>
              {LIVRAISON.tarifs.map((t) => (
                <span
                  key={t.zone}
                  style={{
                    fontFamily: montserrat,
                    fontWeight: 800,
                    fontSize: isH ? 32 : 34,
                    color: "#fff",
                    background: "rgba(224,0,111,0.85)",
                    padding: "10px 24px",
                    borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.zone} : <span style={{ color: COLORS.yellow }}>{t.prix}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
