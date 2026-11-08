import React from 'react';
import {Pin} from './Icons';
import {FONT_UI, INK, YELLOW, cardStyle, pop} from './theme';
import {clamp01} from '../lib/easing';

/** Étiquette (pilule blanche) reliée par une ligne à un point de la scène projeté à l'écran. */
export const Label: React.FC<{
  text: string;
  anchor: {x: number; y: number};
  offset: [number, number];
  t: number;
  exit?: number;
}> = ({text, anchor, offset, t, exit = 1}) => {
  const k = pop(t, 9) * exit;
  if (k <= 0.001) return null;
  const line = clamp01(t / 6) * exit;
  const lx = anchor.x + offset[0];
  const ly = anchor.y + offset[1];
  return (
    <>
      <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}}>
        <line
          x1={anchor.x}
          y1={anchor.y}
          x2={anchor.x + offset[0] * line}
          y2={anchor.y + offset[1] * line}
          stroke="#ffffff"
          strokeWidth={5}
          strokeLinecap="round"
          style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.45))'}}
        />
        <circle cx={anchor.x} cy={anchor.y} r={11 * k} fill={YELLOW} stroke={INK} strokeWidth={4} />
      </svg>
      <div
        style={{
          ...cardStyle,
          position: 'absolute',
          left: lx,
          top: ly,
          transform: `translate(-50%, -50%) scale(${k})`,
          borderRadius: 999,
          borderWidth: 4,
          padding: '8px 22px',
          fontSize: 30,
          fontWeight: 800,
          fontFamily: FONT_UI,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </>
  );
};

/** Épingle A/B posée sur un point projeté, qui tombe et rebondit. */
export const MapPin: React.FC<{letter: string; color: string; at: {x: number; y: number}; t: number; size?: number}> = ({
  letter,
  color,
  at,
  t,
  size = 92,
}) => {
  const k = pop(t, 10);
  if (k <= 0.001) return null;
  const drop = (1 - clamp01(t / 8)) * -120;
  return (
    <div
      style={{
        position: 'absolute',
        left: at.x,
        top: at.y + drop,
        transform: `translate(-50%, -100%) scale(${k})`,
        transformOrigin: '50% 100%',
        filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.35))',
      }}
    >
      <Pin letter={letter} color={color} size={size} />
    </div>
  );
};
