import React from 'react';
import {Icon} from './Icons';
import {FONT_UI, INK, YELLOW, cardStyle, pop} from './theme';

/** Nombre qui défile en roulement : `value` peut être fractionnaire pendant l'animation. */
export const RollingNumber: React.FC<{value: number; size: number}> = ({value, size}) => {
  const v = Math.max(0, value);
  const n = Math.floor(v + 1e-6);
  const f = v - n;
  const fmt = (x: number) => x.toLocaleString('fr-FR').replace(/ | /g, ' ');
  const h = size * 1.15;
  return (
    <div style={{position: 'relative', height: h, overflow: 'hidden', fontSize: size, lineHeight: `${h}px`}}>
      <div style={{transform: `translateY(${-f * h}px)`}}>
        <div>{fmt(n)}</div>
        <div>{fmt(n + 1)}</div>
      </div>
    </div>
  );
};

/** HUD permanent : carte JOUR + carte POPULATION + pastille drapeau / nom du pays. */
export const Hud: React.FC<{
  jour: number;
  population: number;
  nom: string | null;
  badge?: {text: string; t: number} | null;
  top?: number;
}> = ({jour, population, nom, badge, top = 250}) => {
  const label: React.CSSProperties = {fontSize: 17, fontWeight: 800, color: '#7b7f88', letterSpacing: 1};
  const bk = badge ? pop(badge.t, 8) : 0;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONT_UI}}>
      <div style={{display: 'flex', gap: 14}}>
        <div style={{...cardStyle, width: 118, height: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={label}>JOUR</div>
          <div style={{fontSize: 44, fontWeight: 800, lineHeight: 1}}>{jour}</div>
        </div>
        <div style={{...cardStyle, width: 330, height: 96, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', position: 'relative'}}>
          <Icon name="personne" size={46} />
          <div>
            <div style={label}>POPULATION</div>
            <div style={{fontWeight: 800, lineHeight: 1}}>
              <RollingNumber value={population} size={44} />
            </div>
          </div>
          {bk > 0 ? (
            <div
              style={{
                position: 'absolute',
                right: -18,
                top: -20,
                transform: `rotate(8deg) scale(${bk})`,
                background: YELLOW,
                border: `3px solid ${INK}`,
                borderRadius: 10,
                padding: '3px 10px',
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              {badge!.text}
            </div>
          ) : null}
        </div>
      </div>
      <div
        style={{
          ...cardStyle,
          marginTop: 12,
          borderWidth: 3,
          borderRadius: 999,
          padding: '6px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 19,
          fontWeight: 800,
          boxShadow: '0 4px 0 rgba(0,0,0,0.18)',
        }}
      >
        <Icon name="drapeau" size={22} />
        {(nom ?? 'Pays sans nom').toUpperCase()}
      </div>
    </div>
  );
};
