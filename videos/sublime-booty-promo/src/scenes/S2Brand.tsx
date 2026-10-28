import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Trail } from "@remotion/motion-blur";
import { COLORS, PROMO } from "../data";
import { Background } from "../components/Background";
import { LogoPlate, StarBurst, StaggerText, useEnter } from "../components/ui";
import { Confetti, Flash, punch } from "../components/fx";
import { EASE_OUT, SPRING_SOFT, clamp, montserrat, playfair, useLayout } from "../theme";
import type { SceneProps } from "./types";

// 2 — « Sublime Booty by Chris lance sa GRANDE PROMO. Du 1er au 8 novembre. »
export const S2Brand: React.FC<SceneProps> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { isH, u } = useLayout();
  const grande = cue("grande");
  const du = cue("du");
  const seul = cue("seulement");
  const logoIn = useEnter(2, SPRING_SOFT);
  const toTop = interpolate(frame, [grande - 8, grande + 4], [0, 1], { ...clamp, easing: EASE_OUT });
  const pillS = useEnter(du);
  const daysS = useEnter(seul);
  const starS = useEnter(grande + 10);

  const logoW = interpolate(toTop, [0, 1], [isH ? 820 : 860, isH ? 380 : 460]);
  const logoY = interpolate(toTop, [0, 1], [0, isH ? -350 : -640]);

  return (
    <AbsoluteFill style={{ scale: String(punch(frame, grande, 0.07)) }}>
      <Background seed="s2" />
      {/* logo */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            translate: `0px ${logoY}px`,
            scale: String(interpolate(logoIn, [0, 1], [0.6, 1])),
            opacity: logoIn,
          }}
        >
          <LogoPlate width={logoW} shineStart={6} />
        </div>
      </AbsoluteFill>

      {/* GRANDE PROMO */}
      {frame >= grande ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0px ${isH ? 30 : -40}px` }}>
          <Trail layers={4} lagInFrames={0.5} trailOpacity={0.5}>
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: isH ? 150 : 150, color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>
                <StaggerText text="GRANDE" start={grande} step={2} from="scale" />
              </div>
              <div style={{ fontFamily: playfair, fontStyle: "italic", fontWeight: 900, fontSize: isH ? 290 : 280, lineHeight: 0.95, marginTop: -10 }}>
                <StaggerText text="Promo" start={grande + 6} step={2} from="scale" gold style={{ padding: "0 0.08em" }} />
              </div>
            </AbsoluteFill>
          </Trail>
        </AbsoluteFill>
      ) : null}

      {/* dates */}
      {frame >= du ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: isH ? "flex-end" : "center" }}>
          <div
            style={{
              marginBottom: isH ? 150 : 0,
              translate: isH ? `0px ${interpolate(pillS, [0, 1], [80, 0])}px` : `0px ${330 + interpolate(pillS, [0, 1], [80, 0])}px`,
              opacity: pillS,
              background: "#12000a",
              border: `3px solid ${COLORS.gold}`,
              borderRadius: 99,
              padding: `${22 * u}px ${54 * u}px`,
              fontFamily: montserrat,
              fontWeight: 900,
              fontSize: isH ? 56 : 54,
              letterSpacing: "0.12em",
              color: COLORS.goldLight,
              whiteSpace: "nowrap",
              boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
            }}
          >
            {PROMO.dates}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 8 JOURS */}
      {frame >= seul ? (
        <div
          style={{
            position: "absolute",
            left: isH ? 150 : 60,
            top: isH ? 600 : 470,
            width: isH ? 250 : 220,
            height: isH ? 250 : 220,
            borderRadius: "50%",
            background: `linear-gradient(160deg, ${COLORS.pink}, ${COLORS.magenta})`,
            border: `6px solid ${COLORS.gold}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: montserrat,
            fontWeight: 900,
            lineHeight: 1,
            scale: String(daysS),
            rotate: `${interpolate(daysS, [0, 1], [-40, -10])}deg`,
            boxShadow: `0 0 50px ${COLORS.magenta}`,
          }}
        >
          <span style={{ fontSize: isH ? 120 : 104 }}>{PROMO.days}</span>
          <span style={{ fontSize: 44, letterSpacing: "0.1em" }}>JOURS</span>
        </div>
      ) : null}

      {frame >= grande + 10 ? (
        <div style={{ position: "absolute", right: isH ? 140 : 50, top: isH ? 560 : 460, scale: String(starS) }}>
          <StarBurst size={isH ? 270 : 230} line1="OFFRE" line2="CHOC" />
        </div>
      ) : null}

      <Confetti start={grande + 4} y={0.5} seed="s2" />
      <Flash at={grande} len={7} max={0.7} />
    </AbsoluteFill>
  );
};
