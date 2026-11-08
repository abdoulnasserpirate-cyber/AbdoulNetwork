import React from 'react';
import {INK} from './theme';

// Icônes SVG dessinées à la main (aucun asset externe, aucun emoji).
export const Icon: React.FC<{name: string; size?: number; color?: string}> = ({name, size = 64, color = INK}) => {
  const s = {width: size, height: size, display: 'block'} as const;
  switch (name) {
    case 'personne':
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <circle cx="12" cy="7.5" r="4.3" fill={color} />
          <path d="M3.5 21c0-4.8 3.8-8 8.5-8s8.5 3.2 8.5 8z" fill={color} />
        </svg>
      );
    case 'drapeau':
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <rect x="4" y="3" width="2" height="18" rx="1" fill={color} />
          <path d="M6 4h12l-3 4 3 4H6z" fill={color} />
        </svg>
      );
    case 'maison':
      return (
        <svg viewBox="0 0 64 64" style={s}>
          <path d="M8 30 32 10l24 20" fill="#e24b3b" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <rect x="15" y="28" width="34" height="26" fill="#fff4e0" stroke={INK} strokeWidth="4" />
          <rect x="27" y="38" width="10" height="16" fill="#8a5a32" stroke={INK} strokeWidth="3" />
        </svg>
      );
    case 'loi':
      return (
        <svg viewBox="0 0 64 64" style={s}>
          <rect x="14" y="8" width="34" height="46" rx="4" fill="#fff" stroke={INK} strokeWidth="4" />
          <path d="M21 20h20M21 28h20M21 36h14" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <circle cx="44" cy="48" r="8" fill="#e24b3b" stroke={INK} strokeWidth="3" />
        </svg>
      );
    case 'epees':
      return (
        <svg viewBox="0 0 64 64" style={s}>
          <path d="M14 10l30 30M50 10 20 40" stroke="#9aa3ad" strokeWidth="6" strokeLinecap="round" />
          <path d="M14 10l30 30M50 10 20 40" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path d="M38 40l10-4M26 40l-10-4" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path d="M45 43l7 7M19 43l-7 7" stroke="#8a5a32" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case 'pancarte':
      return (
        <svg viewBox="0 0 64 64" style={s}>
          <rect x="29" y="30" width="6" height="28" fill="#8a5a32" stroke={INK} strokeWidth="3" />
          <rect x="10" y="8" width="44" height="26" rx="3" fill="#f5b42a" stroke={INK} strokeWidth="4" />
          <text x="32" y="28" textAnchor="middle" fontFamily="Montserrat" fontWeight="800" fontSize="15" fill="#d6332a">
            NON
          </text>
        </svg>
      );
    case 'vagues':
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M2 9c3-3 5 3 8 0s5 3 8 0 3-1 4 0M2 15c3-3 5 3 8 0s5 3 8 0 3-1 4 0" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'chameau':
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M3 13c1-4 3-5 5-3 1-3 3-4 5-1 1-2 3-2 4 1l2-4h2l-1 3-2 4v6h-2v-4H9v4H7v-4H5v-2z" fill={color} />
        </svg>
      );
    case 'bulle':
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M3 5h18v11H9l-5 4v-4H3z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="8" cy="10.5" r="1.3" fill={INK} />
          <circle cx="12" cy="10.5" r="1.3" fill={INK} />
          <circle cx="16" cy="10.5" r="1.3" fill={INK} />
        </svg>
      );
    case 'coeur':
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M12 21s-8-5-9.5-10C1.5 7 4 4 7.2 4c2 0 3.4 1.1 4.8 3 1.4-1.9 2.8-3 4.8-3C20 4 22.5 7 21.5 11 20 16 12 21 12 21z" fill={color} />
        </svg>
      );
    default:
      return null;
  }
};

/** Épingle de carte (A bleu / B orange). */
export const Pin: React.FC<{letter: string; color: string; size?: number}> = ({letter, color, size = 90}) => (
  <svg viewBox="0 0 40 52" style={{width: size, height: size * 1.3, display: 'block', overflow: 'visible'}}>
    <ellipse cx="20" cy="50" rx="7" ry="2.5" fill="rgba(0,0,0,0.3)" />
    <path d="M20 49C20 49 4 31 4 19a16 16 0 0 1 32 0c0 12-16 30-16 30z" fill={color} stroke="#fff" strokeWidth="3" />
    <circle cx="20" cy="19" r="10" fill="#fff" />
    <text x="20" y="24.5" textAnchor="middle" fontFamily="Montserrat" fontWeight="800" fontSize="15" fill={color}>
      {letter}
    </text>
  </svg>
);
