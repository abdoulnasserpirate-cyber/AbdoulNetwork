import React from 'react';
import {FONT_CAPTION, YELLOW, pop} from './theme';

/** "ET SI ON CRÉAIT UN *PAYS*… / EN PLEIN *DÉSERT* ?" -> lignes de segments (jaune entre *). */
export function parseCaption(s: string) {
  return s.split(' / ').map((line) =>
    line
      .split(/(\*[^*]+\*)/g)
      .filter(Boolean)
      .map((seg) => (seg.startsWith('*') ? {text: seg.slice(1, -1), key: true} : {text: seg, key: false})),
  );
}

const Rich: React.FC<{text: string; size: number}> = ({text, size}) => (
  <>
    {parseCaption(text).map((line, i) => (
      <div key={i} style={{whiteSpace: 'nowrap'}}>
        {line.map((seg, j) => (
          <span key={j} style={{color: seg.key ? YELLOW : '#ffffff'}}>
            {seg.text.toUpperCase()}
          </span>
        ))}
      </div>
    ))}
  </>
);

/**
 * Sous-titre : majuscules, Lilita One, blanc, contour noir épais + ombre, mot-clé jaune #FFC83D,
 * 2 lignes max, apparition en pop. `y` = centre vertical (px).
 */
export const Caption: React.FC<{
  text: string;
  sub?: string;
  t: number;
  y: number;
  size?: number;
  exit?: number;
}> = ({text, sub, t, y, size = 72, exit = 1}) => {
  const k = pop(t, 8) * exit;
  if (k <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: y,
        transform: `translateY(-50%) scale(${k})`,
        transformOrigin: '50% 50%',
        textAlign: 'center',
        fontFamily: FONT_CAPTION,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: 0.5,
        WebkitTextStroke: `${Math.round(size * 0.2)}px #111`,
        paintOrder: 'stroke fill',
        textShadow: '0 7px 0 rgba(0,0,0,0.55), 0 10px 18px rgba(0,0,0,0.35)',
        opacity: Math.min(1, k * 1.5),
      }}
    >
      <Rich text={text} size={size} />
      {sub ? (
        <div style={{fontSize: size * 0.5, marginTop: 10, WebkitTextStroke: `${Math.round(size * 0.13)}px #111`}}>
          <Rich text={sub} size={size * 0.5} />
        </div>
      ) : null}
    </div>
  );
};
