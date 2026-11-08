import type React from 'react';
import '@fontsource/lilita-one/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import {clamp01, easeOutBack} from '../lib/easing';

export const FONT_CAPTION = "'Lilita One', sans-serif";
export const FONT_UI = "'Montserrat', sans-serif";
export const YELLOW = '#FFC83D';
export const INK = '#1b1c20';
export const BLUE = '#2f7cf6';
export const ORANGE = '#f5891f';
export const GREEN = '#2fb565';
export const PINK = '#f0436a';

/** Zones de sécurité TikTok (1080×1920) */
export const SAFE = {top: 120, bottom: 380, right: 140, left: 40};

/** Apparition en pop : échelle 0 -> 1 avec dépassement, sur `dur` frames. */
export const pop = (t: number, dur = 9) => (t < 0 ? 0 : easeOutBack(clamp01(t / dur), 2.2));
/** Disparition rapide (1 -> 0) à partir de la fin. */
export const out = (frame: number, end: number, dur = 6) => 1 - clamp01((frame - end) / dur);

export const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `4px solid ${INK}`,
  borderRadius: 22,
  boxShadow: '0 8px 0 rgba(0,0,0,0.18), 0 14px 30px rgba(0,0,0,0.22)',
  fontFamily: FONT_UI,
  color: INK,
};
