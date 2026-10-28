import { loadFont } from "@remotion/fonts";
import { Easing, staticFile, useVideoConfig } from "remotion";

// Polices Google (Playfair Display, Montserrat, Great Vibes) embarquées dans
// public/fonts pour un rendu hors-ligne (fichiers variables : toutes graisses).
export const playfair = "Playfair Display";
export const montserrat = "Montserrat";
export const greatVibes = "Great Vibes";

const FONTS = [
  { family: playfair, file: "PlayfairDisplay-latin.woff2", style: "normal", weight: "400 900" },
  { family: playfair, file: "PlayfairDisplay-Italic-latin.woff2", style: "italic", weight: "400 900" },
  { family: montserrat, file: "Montserrat-latin.woff2", style: "normal", weight: "100 900" },
  { family: greatVibes, file: "GreatVibes-latin.woff2", style: "normal", weight: "400" },
];
FONTS.forEach((f) =>
  loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), style: f.style, weight: f.weight, format: "woff2" }),
);

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

export const SPRING_PUNCH = { damping: 12, mass: 0.6, stiffness: 170 };
export const SPRING_SOFT = { damping: 18, mass: 0.9, stiffness: 120 };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Layout commun aux deux formats. `u` = unité proportionnelle au petit côté (1080 px).
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const isH = width > height;
  const u = Math.min(width, height) / 1080;
  return {
    isH,
    width,
    height,
    u,
    // marges de sécurité
    safeX: isH ? 110 : 80,
    safeTop: isH ? 80 : 140,
    // zone bas réservée à l'UI TikTok/Reels en vertical (sous-titres au-dessus)
    safeBottom: isH ? 80 : 320,
  };
};
