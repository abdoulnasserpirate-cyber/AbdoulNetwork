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
