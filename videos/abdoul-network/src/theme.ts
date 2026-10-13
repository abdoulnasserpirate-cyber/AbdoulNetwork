import React from 'react';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Montserrat (Google Fonts) embarquée localement : le rendu ne dépend
// d'aucun accès réseau. Fichier variable -> couvre ExtraBold (800) et Black (900).
const FAMILY = 'Montserrat';
for (const weight of ['800', '900']) {
	loadFont({family: FAMILY, url: staticFile('fonts/montserrat-latin.woff2'), weight, format: 'woff2',
		unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'});
	loadFont({family: FAMILY, url: staticFile('fonts/montserrat-latin-ext.woff2'), weight, format: 'woff2',
		unicodeRange: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+2020, U+20A0-20AB, U+20AD-20C4, U+2C60-2C7F, U+A720-A7FF'});
}

export const FONT = `${FAMILY}, sans-serif`;
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Zones sûres TikTok / Reels
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = HEIGHT - 400;

export const C = {
	bg: '#0A0A14',
	bg2: '#1A0B3D',
	yellow: '#FFD60A',
	violet: '#7B2FF7',
	cyan: '#00E5FF',
	white: '#FFFFFF',
	red: '#FF2E4D',
	green: '#25D366',
	growth: '#3DFF8A',
};

// Ombre forte + contour pour une lisibilité parfaite sur tous les fonds.
export const textStroke = (px = 10, color = '#05050C') => ({
	WebkitTextStroke: `${px}px ${color}`,
	paintOrder: 'stroke fill' as const,
	textShadow: `0 10px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.6)`,
});

export const glow = (color: string, r = 30) =>
	`0 0 ${r}px ${color}, 0 0 ${r * 2}px ${color}66`;

/* ------------------------------------------------------------------ */
/* Thèmes de scène : fonds unis bleu ou blanc                          */
/* ------------------------------------------------------------------ */
export type Theme = {
	mode: 'blue' | 'white';
	bg: string;
	text: string; // texte principal
	accent: string; // mots clés
	accent2: string; // éléments graphiques secondaires
	stroke: string;
	shadow: string;
	card: string;
	cardBorder: string;
	muted: string;
};

export const BLUE: Theme = {
	mode: 'blue',
	bg: '#0057FF',
	text: '#FFFFFF',
	accent: '#FFD60A',
	accent2: '#BFE9FF',
	stroke: '#04205E',
	shadow: '0 10px 0 rgba(4,32,94,0.5)',
	card: 'rgba(255,255,255,0.14)',
	cardBorder: 'rgba(255,255,255,0.5)',
	muted: 'rgba(255,255,255,0.25)',
};

export const WHITE: Theme = {
	mode: 'white',
	bg: '#FFFFFF',
	text: '#0A1A3F',
	accent: '#0057FF',
	accent2: '#00A6E0',
	stroke: '#FFFFFF',
	shadow: '0 8px 24px rgba(0,60,160,0.18)',
	card: '#F2F6FF',
	cardBorder: 'rgba(0,87,255,0.3)',
	muted: 'rgba(10,26,63,0.12)',
};

export const ThemeCtx = React.createContext<Theme>(BLUE);
export const useTheme = () => React.useContext(ThemeCtx);

/** Contour + ombre adaptés au fond : contour marine sur bleu, ombre douce sur blanc. */
export const themedStroke = (T: Theme, px = 10) =>
	T.mode === 'blue'
		? {WebkitTextStroke: `${px}px ${T.stroke}`, paintOrder: 'stroke fill' as const, textShadow: T.shadow}
		: {textShadow: T.shadow};
