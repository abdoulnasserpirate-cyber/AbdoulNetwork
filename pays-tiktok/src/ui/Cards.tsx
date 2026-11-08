import React from 'react';
import {interpolate} from 'remotion';
import {Icon} from './Icons';
import {BLUE, FONT_UI, GREEN, INK, ORANGE, PINK, YELLOW, cardStyle, pop} from './theme';
import {clamp01, easeOutCubic} from '../lib/easing';

const STEP_COLORS = [BLUE, ORANGE, GREEN];

/** Carte de consigne numérotée (pastilles 1 bleue, 2 orange, 3 verte). */
export const StepCard: React.FC<{numero: number; titre: string; texte: string; t: number; exit?: number}> = ({
  numero,
  titre,
  texte,
  t,
  exit = 1,
}) => {
  const k = pop(t, 9) * exit;
  if (k <= 0.001) return null;
  return (
    <div
      style={{
        ...cardStyle,
        width: 700,
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        transform: `scale(${k})`,
        transformOrigin: '20% 50%',
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 999,
          background: STEP_COLORS[(numero - 1) % 3],
          border: `3px solid ${INK}`,
          color: '#fff',
          fontSize: 30,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {numero}
      </div>
      <div>
        <div style={{fontSize: 34, fontWeight: 800, lineHeight: 1.1}}>{titre}</div>
        <div style={{fontSize: 23, fontWeight: 700, color: '#6c707a'}}>{texte}</div>
      </div>
    </div>
  );
};

/** Carte commentaire : avatar, pseudo, texte, cœur + likes qui s'animent jusqu'à la vraie valeur. */
export const CommentCard: React.FC<{
  pseudo?: string;
  texte: string;
  likesFrom: number;
  likesTo: number;
  t: number;
  countFrames?: number;
  badge?: string;
  exit?: number;
}> = ({pseudo, texte, likesFrom, likesTo, t, countFrames = 40, badge, exit = 1}) => {
  const k = pop(t, 9) * exit;
  if (k <= 0.001) return null;
  const p = easeOutCubic(clamp01((t - 8) / countFrames));
  const likes = Math.round(interpolate(p, [0, 1], [likesFrom, likesTo]));
  const beat = t > 8 && t < 8 + countFrames ? 1 + Math.sin(t * 0.9) * 0.08 : 1;
  const exemple = !pseudo || pseudo.toLowerCase() === 'exemple';
  return (
    <div style={{position: 'relative', transform: `scale(${k})`, transformOrigin: '50% 50%'}}>
      <div style={{...cardStyle, width: 820, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18}}>
        {exemple ? (
          <Icon name="bulle" size={58} />
        ) : (
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 999,
              background: '#7a4be0',
              color: '#fff',
              fontSize: 30,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {pseudo![0].toUpperCase()}
          </div>
        )}
        <div style={{flex: 1}}>
          {!exemple ? <div style={{fontSize: 21, fontWeight: 700, color: '#80848d'}}>{pseudo}</div> : null}
          <div style={{fontSize: 27, fontWeight: 700, lineHeight: 1.25}}>{texte}</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80}}>
          <div style={{transform: `scale(${beat})`}}>
            <Icon name="coeur" size={44} color={PINK} />
          </div>
          <div style={{fontSize: 22, fontWeight: 800, color: PINK}}>{likes.toLocaleString('fr-FR').replace(/ | /g, ' ')}</div>
        </div>
      </div>
      {badge ? (
        <div
          style={{
            position: 'absolute',
            left: -14,
            top: -22,
            transform: `rotate(-7deg) scale(${pop(t - 4, 8)})`,
            background: YELLOW,
            border: `3px solid ${INK}`,
            borderRadius: 10,
            padding: '3px 12px',
            fontFamily: FONT_UI,
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          {badge}
        </div>
      ) : null}
    </div>
  );
};

/** Grille d'icônes (CONSTRUCTIONS, LOIS, GUERRES, MANIFS), chacune pop sur son mot. */
export const IconGrid: React.FC<{items: {texte: string; icone: string; t: number}[]; exit?: number}> = ({items, exit = 1}) => (
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 230px)', gap: 22, justifyContent: 'center'}}>
    {items.map((it, i) => {
      const k = pop(it.t, 9) * exit;
      return (
        <div
          key={i}
          style={{
            ...cardStyle,
            height: 190,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transform: `scale(${k})`,
            opacity: k > 0.001 ? 1 : 0,
          }}
        >
          <Icon name={it.icone} size={92} />
          <div style={{fontSize: 20, fontWeight: 800, letterSpacing: -0.3}}>{it.texte}</div>
        </div>
      );
    })}
  </div>
);

type VoteSide = {titre: string; texte: string; icone: string};

const VoteCard: React.FC<{letter: string; color: string; side: VoteSide; k: number; grey?: boolean}> = ({letter, color, side, k, grey}) => (
  <div
    style={{
      ...cardStyle,
      width: 400,
      overflow: 'hidden',
      padding: 0,
      transform: `scale(${k})`,
      filter: grey ? 'grayscale(1) brightness(0.85)' : undefined,
    }}
  >
    <div style={{background: color, color: '#fff', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px', borderBottom: `4px solid ${INK}`}}>
      <span style={{fontSize: 40, fontWeight: 800}}>{letter}</span>
      <Icon name={side.icone} size={40} color="#fff" />
    </div>
    <div style={{padding: '14px 18px 18px', textAlign: 'center'}}>
      <div style={{fontSize: 28, fontWeight: 800, lineHeight: 1.1}}>{side.titre}</div>
      <div style={{fontSize: 21, fontWeight: 700, color: '#6c707a', marginTop: 4}}>{side.texte}</div>
    </div>
  </div>
);

/** Cartes de vote A (bleu) / B (orange) avec pastille jaune « VS ». `perdant` grise une carte. */
export const VoteCards: React.FC<{a: VoteSide; b: VoteSide; t: number; perdant?: 'A' | 'B'}> = ({a, b, t, perdant}) => {
  const ka = pop(t, 9);
  const kb = pop(t - 4, 9);
  const kv = pop(t - 9, 8);
  if (ka <= 0.001) return null;
  return (
    <div style={{position: 'relative', display: 'flex', gap: 34, justifyContent: 'center', fontFamily: FONT_UI}}>
      <VoteCard letter="A" color={BLUE} side={a} k={ka} grey={perdant === 'A'} />
      <VoteCard letter="B" color={ORANGE} side={b} k={kb} grey={perdant === 'B'} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 64,
          transform: `translate(-50%, -50%) scale(${kv})`,
          width: 74,
          height: 74,
          borderRadius: 999,
          background: YELLOW,
          border: `4px solid ${INK}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 800,
          color: INK,
        }}
      >
        VS
      </div>
    </div>
  );
};
