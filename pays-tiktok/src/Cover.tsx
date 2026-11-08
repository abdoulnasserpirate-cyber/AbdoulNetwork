import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {World} from './world/World';
import type {CamKey} from './world/CameraRig';
import {Caption} from './ui/Caption';
import {FONT_CAPTION, FONT_UI, INK, YELLOW, cardStyle} from './ui/theme';
import {Icon} from './ui/Icons';

export type CoverProps = {
  jour: number;
  univers: string;
  seed: number;
  /** événement du jour, 2 lignes (" / " = retour à la ligne, *mot* = jaune) */
  evenement: string;
  /** question du vote en cours, en jaune */
  question: string;
  camera?: CamKey[];
};

// Gabarit identique pour chaque épisode (grille du profil = série).
// Les éléments clés restent dans la zone centrale 3:4 visible dans la grille TikTok.
export const Cover: React.FC<CoverProps> = ({jour, univers, seed, evenement, question, camera}) => {
  const [h] = useState(() => delayRender('polices'));
  useEffect(() => {
    Promise.all([document.fonts.load("72px 'Lilita One'"), document.fonts.load("800 30px 'Montserrat'")]).then(() => continueRender(h));
  }, [h]);
  const cam: CamKey[] = camera ?? [{f: 0, pos: [44, 150, 150], target: [-4, 0, -12], fov: 42}];
  const giant: React.CSSProperties = {
    fontFamily: FONT_CAPTION,
    fontSize: 230,
    lineHeight: 1,
    color: YELLOW,
    WebkitTextStroke: '30px #111',
    paintOrder: 'stroke fill',
    textShadow: '0 12px 0 rgba(0,0,0,0.6)',
    textAlign: 'center',
  };
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <World univers={univers} seed={seed} camera={cam} lowClouds={false} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.6) 100%)'}} />
      <div style={{position: 'absolute', top: 250, left: 0, right: 0, ...giant}}>JOUR {jour}</div>
      <Caption text={evenement} t={100} y={640} size={84} />
      <div style={{position: 'absolute', top: 1330, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <div style={{...cardStyle, borderRadius: 999, padding: '14px 34px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT_UI, fontSize: 44, fontWeight: 800, color: INK}}>
          <Icon name="personne" size={46} />1 ABONNÉ = 1 HABITANT
        </div>
        <div style={{...giant, fontSize: 120, WebkitTextStroke: '22px #111'}}>{question}</div>
      </div>
    </AbsoluteFill>
  );
};
