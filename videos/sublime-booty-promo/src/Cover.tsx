import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, MODELS, PROMO } from "./data";
import { Background } from "./components/Background";
import { Gold, LogoPlate, ModelShot, StarBurst } from "./components/ui";
import { montserrat, playfair, useLayout } from "./theme";

// Miniature : GRANDE PROMO + silhouette + logo + dates.
export const Cover: React.FC = () => {
  const { isH, width, height, safeX } = useLayout();
  return (
    <AbsoluteFill>
      <Background seed="cover" />
      <div style={{ position: "absolute", right: 0, top: 0 }}>
        <ModelShot
          model={MODELS.robeRougeEpaules}
          width={isH ? 760 : width}
          height={isH ? height : 1150}
          duration={1}
          zoom={[1.02, 1.02]}
          curveStart={-100}
          fade={isH ? "left" : "bottom"}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: safeX,
          top: isH ? 90 : 880,
          width: isH ? 1150 : width - 2 * safeX,
          textAlign: isH ? "left" : "center",
          display: "flex",
          flexDirection: "column",
          alignItems: isH ? "flex-start" : "center",
        }}
      >
        <LogoPlate width={isH ? 420 : 420} shineStart={-100} />
        <div style={{ fontFamily: montserrat, fontWeight: 900, fontSize: isH ? 150 : 140, color: "#fff", lineHeight: 1, marginTop: 30 }}>GRANDE</div>
        <div style={{ fontFamily: playfair, fontStyle: "italic", fontWeight: 900, fontSize: isH ? 270 : 240, lineHeight: 0.95 }}>
          <Gold>Promo</Gold>
        </div>
        <div
          style={{
            marginTop: 24,
            background: "#12000a",
            border: `3px solid ${COLORS.gold}`,
            borderRadius: 99,
            padding: "18px 44px",
            fontFamily: montserrat,
            fontWeight: 900,
            fontSize: isH ? 48 : 46,
            letterSpacing: "0.12em",
            color: COLORS.goldLight,
            whiteSpace: "nowrap",
          }}
        >
          {PROMO.dates}
        </div>
      </div>
      <div style={{ position: "absolute", right: isH ? 640 : 50, top: isH ? 70 : 90 }}>
        <StarBurst size={isH ? 250 : 240} line1="OFFRE" line2="CHOC" />
      </div>
    </AbsoluteFill>
  );
};
