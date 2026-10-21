import React from 'react';
import {AbsoluteFill, Audio, Sequence, random, staticFile, useCurrentFrame} from 'remotion';
import {Beams, Bokeh, Booth, Bottle, Confetti, Crowd, DJ, DiscoBall, Fan, Haze, Jersey, Lasers, Lightning} from './fx';
import {BODY, DISPLAY, Letters, Slam, goldText} from './text';
import {FPS, SCENES, SceneKey, W, beatPos, beatPulse, clamp, hitEnvelope, prog} from './timing';

const GOLD = '#f2c14e';
const PURPLE = '#b23cff';
const PINK = '#ff2a8a';
const CYAN = '#21e3ff';
const BLUE = '#1b3fa6';
const GARNET = '#a5123a';

type SP = {t: number};

const Bg: React.FC<{a: string; b: string}> = ({a, b}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 35%, ${a} 0%, ${b} 70%)`}} />
);

// ---------- 1. Hook ----------
const Hook: React.FC<SP> = ({t}) => {
  const on = t < 0.35 ? (random('fl' + Math.floor(t * 30)) > 0.4 ? 1 : 0.15) : 1;
  return (
    <AbsoluteFill>
      <Bg a="#1a2238" b="#020205" />
      <Beams t={t} colors={['#ffffff', '#cfe0ff', '#fff3d6']} count={5} intensity={on * 1.2} spread={14} />
      <Haze t={t} colors={['#3d5cff', '#ffffff']} opacity={0.3} />
      <Crowd t={t} light="#cfe0ff" seed="hook" />
      <Slam t={t} at={W.samedi} top={150} size={58} font={BODY} weight={800} spacing="0.32em" from={1.6}>Samedi soir</Slam>
      <Slam t={t} at={W.classico1} top={230} size={200} inner={goldText(t)}>Le Classico</Slam>
      <Slam t={t} at={W.commence} top={450} size={96}>commence</Slam>
      <Slam t={t} at={W.avant} top={555} size={150} from={3}>
        <span style={{display: 'inline-block', background: '#fff', color: '#07060c', padding: '0 28px', transform: 'rotate(-4deg)'}}>Avant</span>
      </Slam>
      <Letters t={t} at={W.envoi} top={745} size={50} font={BODY} weight={800} spacing="0.12em" glow="#6f8cff">le coup d'envoi !</Letters>
    </AbsoluteFill>
  );
};

// ---------- 2. Rivalry ----------
const Rivalry: React.FC<SP> = ({t}) => {
  const inL = prog(t, W.real - 0.08, 0.45), inR = prog(t, W.barca - 0.08, 0.45);
  const away = prog(t, SCENES.rivalry[1] - 0.05, 0.4);
  const pulse = beatPulse(t, 5);
  const textOut = SCENES.rivalry[1] - 0.1;
  return (
    <AbsoluteFill>
      {/* Madrid side */}
      <AbsoluteFill style={{clipPath: 'polygon(0 0, 66% 0, 34% 100%, 0 100%)',
        transform: `translateX(${-1080 * (1 - inL) - 900 * away}px) rotate(${-away * 6}deg)`}}>
        <AbsoluteFill style={{background: 'linear-gradient(140deg,#ffffff 0%,#efe6cf 60%,#c9a24a 120%)'}} />
        <Beams t={t} colors={['#f2c14e', '#ffffff']} count={4} intensity={0.9} />
        <Fan t={t} x={250} s={2.3} light={GOLD} pose="up" />
        <div style={{position: 'absolute', left: 80, top: 90, fontFamily: DISPLAY, fontSize: 108, lineHeight: 0.9, color: '#0b0a10',
          transform: `scale(${1 + pulse * 0.03})`, transformOrigin: '0 0'}}>
          REAL<br /><span style={{color: '#c99a2e'}}>MADRID</span>
        </div>
      </AbsoluteFill>
      {/* Barça side */}
      <AbsoluteFill style={{clipPath: 'polygon(66% 0, 100% 0, 100% 100%, 34% 100%)',
        transform: `translateX(${1080 * (1 - inR) + 900 * away}px) rotate(${away * 6}deg)`}}>
        <AbsoluteFill style={{background: `repeating-linear-gradient(90deg, ${BLUE} 0 90px, ${GARNET} 90px 180px)`,
          backgroundPosition: `${t * 60}px 0`}} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 60%, transparent 0%, #0008 80%)'}} />
        <Beams t={t + 3} colors={['#ffd34d', '#6fa0ff']} count={4} intensity={0.9} />
        <Fan t={t} x={830} s={2.3} light="#ffd34d" pose="jump" ph={0.5} />
        <div style={{position: 'absolute', right: 80, bottom: 90, textAlign: 'right', fontFamily: DISPLAY, fontSize: 112, lineHeight: 0.9, color: '#fff',
          textShadow: '0 6px 0 #0006', transform: `scale(${1 + pulse * 0.03})`, transformOrigin: '100% 100%'}}>
          FC<br /><span style={{color: '#ffd34d'}}>BARCELONE</span>
        </div>
      </AbsoluteFill>
      {t > W.vs && t < textOut + 0.2 && (
        <Lightning t={t} x1={713} y1={0} x2={367} y2={1080} color={GOLD} seed="bolt" />
      )}
      <Slam t={t} at={W.vs} out={textOut} top={350} size={280} from={3.5}
        inner={{...goldText(t), filter: 'drop-shadow(0 0 0 #000) drop-shadow(0 8px 0 #000) drop-shadow(0 0 40px #000)'}}>VS</Slam>
      {t > W.rivalite && t < textOut + 0.2 && (
        <div style={{position: 'absolute', left: -60, right: -60, top: 650, height: 120, background: '#07060c',
          transform: `rotate(-8deg) scaleX(${prog(t, W.rivalite, 0.35)})`, boxShadow: `0 0 40px ${GOLD}88`,
          borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`, opacity: 1 - prog(t, textOut, 0.15), overflow: 'hidden'}}>
          {[['Une rivalité légendaire', W.rivalite, W.seuleNuit], ['Une seule nuit pour la vivre !', W.seuleNuit, 99]].map(([txt, a, b]) => {
            const ta = a as number, tb = b as number;
            if (t < ta || t > tb + 0.3) return null;
            const y = (1 - prog(t, ta + 0.05, 0.3)) * 120 - prog(t, tb, 0.25) * 120;
            return <div key={txt as string} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: DISPLAY, fontSize: 76, color: '#fff', transform: `translateY(${y}px)`, textTransform: 'uppercase', letterSpacing: '0.03em'}}>
              {txt}</div>;
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 3. Title ----------
const Title: React.FC<SP> = ({t}) => {
  const ls = 0.9 - 0.68 * prog(t, W.lostalos, 0.9);
  return (
    <AbsoluteFill>
      <Bg a="#3a0a5c" b="#05010a" />
      <Haze t={t} colors={[PURPLE, PINK, GOLD]} />
      <Beams t={t} colors={[PURPLE, GOLD, PINK]} count={7} intensity={1.1} />
      <Lasers t={t} color={PURPLE} intensity={prog(t, 7.7, 0.5)} />
      <Crowd t={t} light={PURPLE} seed="title" />
      <div style={{position: 'absolute', left: 80, right: 80, top: 210, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 50,
        letterSpacing: `${ls}em`, color: '#fff', opacity: prog(t, W.lostalos, 0.4), whiteSpace: 'nowrap',
        textShadow: `0 0 20px ${PURPLE}, 0 0 50px ${PURPLE}`}}>LOSTALOS NIGHT CLUB</div>
      <Letters t={t} at={W.presente} top={290} size={30} font={BODY} weight={700} spacing="0.6em" color={GOLD} stagger={0.03}>présente</Letters>
      <Slam t={t} at={W.soiree} top={360} size={190} glow={PURPLE}>Soirée</Slam>
      <Slam t={t} at={W.classico2} top={545} size={230} from={3} inner={goldText(t, 1.5)}>Classico</Slam>
      <Confetti t={t} start={W.classico2} colors={[GOLD, '#fff', BLUE, GARNET, PURPLE]} />
    </AbsoluteFill>
  );
};

// ---------- 4. Date ----------
const Roll: React.FC<{t: number; at: number; value: string}> = ({t, at, value}) => (
  <span style={{display: 'inline-flex'}}>
    {value.split('').map((d, i) => {
      const p = prog(t, at + i * 0.08, 0.5);
      const spin = (1 - p) * 9;
      const shown = p > 0.95 ? d : String(Math.floor(Math.abs(t * 37 + i * 3)) % 10);
      return <span key={i} style={{...goldText(t), display: 'inline-block', transform: `translateY(${-spin * 8}px)`, ...(p < 0.9 ? {filter: `blur(${(1 - p) * 6}px)`} : {})}}>{shown}</span>;
    })}
  </span>
);

const DateScene: React.FC<SP> = ({t}) => (
  <AbsoluteFill>
    <Bg a="#4a0838" b="#06020a" />
    <Haze t={t} colors={[PINK, '#5b2bff']} opacity={0.5} />
    <DiscoBall t={t} y={150} color={PINK} />
    <Beams t={t} colors={[PINK, '#ffffff', '#7a5cff']} count={6} intensity={0.7} />
    <Crowd t={t} light={PINK} seed="date" density={0.8} />
    <Slam t={t} at={W.samedi2} top={290} size={64} font={BODY} weight={800} spacing="0.35em" from={1.8}>Samedi</Slam>
    {t > W.d24 && (
      <div style={{position: 'absolute', left: 80, right: 80, top: 375, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34,
        transform: `scale(${0.6 + 0.4 * prog(t, W.d24, 0.35)})`, opacity: prog(t, W.d24, 0.15)}}>
        <div style={{fontFamily: DISPLAY, fontSize: 300, lineHeight: 0.9}}><Roll t={t} at={W.d24} value="24" /></div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', opacity: prog(t, W.octobre, 0.3),
          transform: `translateX(${(1 - prog(t, W.octobre, 0.4)) * 80}px)`}}>
          <div style={{fontFamily: DISPLAY, fontSize: 130, lineHeight: 0.95, color: '#fff', textShadow: `0 0 30px ${PINK}`}}>OCTOBRE</div>
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: '0.5em', color: PINK}}>2026</div>
        </div>
      </div>
    )}
    {t > W.aPartir && (
      <div style={{position: 'absolute', left: 80, right: 80, top: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 46, color: '#fff', letterSpacing: '0.08em',
          opacity: prog(t, W.aPartir, 0.2), transform: `translateY(${(1 - prog(t, W.aPartir, 0.35)) * 40}px)`}}>À PARTIR DE</div>
        {t > W.h23 && (
          <div style={{fontFamily: DISPLAY, fontSize: 140, lineHeight: 1, color: '#fff', padding: '0 26px', border: `5px solid ${CYAN}`, borderRadius: 18,
            boxShadow: `0 0 30px ${CYAN}, inset 0 0 30px ${CYAN}`, textShadow: `0 0 20px ${CYAN}`, background: '#05020acc',
            opacity: random('n' + Math.floor(t * 30)) > 0.3 || t > W.h23 + 0.35 ? 1 : 0.3,
            transform: `scale(${0.7 + 0.3 * prog(t, W.h23, 0.3)})`}}>23H</div>
        )}
      </div>
    )}
    <Letters t={t} at={12.0} top={235} size={26} font={BODY} weight={700} spacing="0.25em" color="#ffd0ea" stagger={0.012}>la veille du match · dim. 25 oct.</Letters>
  </AbsoluteFill>
);

// ---------- 5. Vibe montage ----------
const Vibe: React.FC<SP> = ({t}) => {
  const hue = Math.floor(beatPos(t)) % 4;
  const folieCols = [PINK, CYAN, GOLD, PURPLE];
  let body: React.ReactNode;
  if (t < W.foule) {
    const tilt = prog(t, SCENES.vibe[0], 1.2);
    body = (
      <AbsoluteFill style={{transform: `translateY(${80 - tilt * 80}px) scale(${1.1 - tilt * 0.1})`}}>
        <Bg a="#062a3a" b="#010307" />
        <Beams t={t} colors={[CYAN, PINK, '#fff', GOLD]} count={9} intensity={1.4} spread={35} />
        <Lasers t={t} color={CYAN} x={60} y={1100} count={7} speed={1.6} />
        <Lasers t={t + 1} color={PINK} x={1020} y={1100} count={7} speed={1.4} />
        <Crowd t={t} light={CYAN} seed="v1" />
        <Slam t={t} at={W.lumieres} top={330} size={200} glow={CYAN}>Lumières</Slam>
      </AbsoluteFill>
    );
  } else if (t < W.bouteilles) {
    body = (
      <AbsoluteFill>
        <Bg a="#3a0620" b="#050104" />
        <Beams t={t} colors={[PINK, '#fff']} count={6} intensity={1.2} />
        <Haze t={t} colors={[PINK]} opacity={0.4} />
        <Crowd t={t * 1.2} light={PINK} seed="v2" rows={2} scale={1.35} y={-170} density={1.1} />
        <Slam t={t} at={W.foule} top={110} size={280} glow={PINK}>Foule</Slam>
      </AbsoluteFill>
    );
  } else if (t < W.ambiance) {
    body = (
      <AbsoluteFill>
        <Bg a="#3a2606" b="#050302" />
        <Haze t={t} colors={[GOLD, '#ff7a2a']} opacity={0.5} />
        <Bokeh t={t} color={GOLD} seed="v3" />
        <Bottle t={t} x={300} y={800} s={1.25} start={W.bouteilles} color={GOLD} rot={-14} />
        <Bottle t={t} x={540} y={760} s={1.45} start={W.bouteilles + 0.15} color={GOLD} />
        <Bottle t={t} x={780} y={800} s={1.25} start={W.bouteilles + 0.3} color={GOLD} rot={14} />
        <Slam t={t} at={W.bouteilles} top={110} size={170} inner={goldText(t, 2)}>Bouteilles</Slam>
        <Letters t={t} at={W.brillent} top={290} size={60} font={BODY} weight={800} spacing="0.2em" glow={GOLD}>qui brillent</Letters>
      </AbsoluteFill>
    );
  } else if (t < W.jusquau) {
    const c = folieCols[hue];
    const strobe = t > W.folie ? beatPulse(t * 2, 10) * 0.35 : 0;
    body = (
      <AbsoluteFill>
        <Bg a={c + '55'} b="#030104" />
        <Beams t={t * 1.5} colors={[c, '#fff']} count={8} intensity={1.5} spread={40} />
        <Lasers t={t * 1.5} color={c} count={11} speed={2} />
        <Crowd t={t * 1.3} light={c} seed="v4" />
        <Letters t={t} at={W.ambiance} top={250} size={54} font={BODY} weight={800} spacing="0.18em" stagger={0.02}>une ambiance de</Letters>
        <Slam t={t} at={W.folie} top={330} size={340} from={3.2} glow={c}>Folie</Slam>
        <AbsoluteFill style={{background: '#fff', opacity: strobe}} />
      </AbsoluteFill>
    );
  } else {
    body = (
      <AbsoluteFill>
        <Bg a="#0d1a5c" b="#020208" />
        <div style={{position: 'absolute', left: 760, top: 120, width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #fff, #c9d6ff 60%, #8090c0)', boxShadow: '0 0 90px 30px #7f95ff88'}} />
        <Beams t={t} colors={['#5b6cff', PURPLE, '#fff']} count={6} />
        <Bokeh t={t} color="#9fb0ff" seed="v5" />
        <Crowd t={t} light="#7f95ff" seed="v5" />
        <Letters t={t} at={W.jusquau} top={330} size={140} glow="#5b6cff">jusqu'au bout</Letters>
        <Letters t={t} at={W.jusquau + 0.5} top={480} size={140} color={GOLD} glow={GOLD}>de la nuit</Letters>
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill>{body}</AbsoluteFill>;
};

// ---------- 6. DJs ----------
const DJS: [string, number][] = [['DJULON', W.djulon], ['PAPZER', W.papzer], ['VIBES', W.vibes]];
const Djs: React.FC<SP> = ({t}) => {
  const raise = Math.max(...DJS.map(([, a]) => (t > a ? Math.exp(-(t - a) * 2.2) : 0)), 0);
  const active = DJS.filter(([, a]) => t >= a).length - 1;
  const cols = [PURPLE, CYAN, PINK];
  const c = active >= 0 ? cols[active] : PURPLE;
  return (
    <AbsoluteFill>
      <Bg a="#1d0b44" b="#030108" />
      <Haze t={t} colors={[c, '#2b3bff']} opacity={0.5} />
      <Beams t={t} colors={[c, '#fff', '#5b6cff']} count={7} intensity={1.2} />
      <Lasers t={t} color={c} x={540} y={640} count={10} intensity={0.8} />
      <DJ t={t} light={c} raise={raise} />
      <Booth t={t} light={c} />
      <Letters t={t} at={W.platines} top={95} size={44} font={BODY} weight={800} spacing="0.35em" glow={PURPLE} stagger={0.02}>aux platines</Letters>
      {DJS.map(([name, a], i) => {
        if (t < a) return null;
        const p = prog(t, a, 0.45);
        const dir = i % 2 === 0 ? -1 : 1;
        const isActive = i === active;
        const flick = t - a < 0.3 ? (random('f' + i + Math.floor(t * 30)) > 0.35 ? 1 : 0.25) : 1;
        return (
          <div key={name} style={{position: 'absolute', left: 80, right: 80, top: 165 + i * 135, display: 'flex', justifyContent: 'center',
            transform: `translateX(${dir * (1 - p) * 700}px) scale(${isActive ? 1 + beatPulse(t, 6) * 0.04 : 0.86})`,
            opacity: flick * (isActive ? 1 : 0.6)}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 18, padding: '4px 34px', border: `4px solid ${cols[i]}`, borderRadius: 14,
              background: '#05020ad0', boxShadow: `0 0 26px ${cols[i]}, inset 0 0 22px ${cols[i]}88`}}>
              <span style={{fontFamily: BODY, fontWeight: 800, fontSize: 46, color: cols[i]}}>DJ</span>
              <span style={{fontFamily: DISPLAY, fontSize: 110, lineHeight: 1.05, color: '#fff', textShadow: `0 0 18px ${cols[i]}`}}>{name}</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 7. VIP ----------
const Badge: React.FC<{t: number; at: number; label: string; big?: boolean}> = ({t, at, label, big}) => {
  if (t < at) return <div style={{width: big ? 300 : 230}} />;
  const p = prog(t, at, 0.4);
  return (
    <div style={{position: 'relative', width: big ? 300 : 230, transform: `translateY(${(1 - p) * -200}px) scale(${0.5 + 0.5 * p})`, opacity: clamp(p * 3)}}>
      {big && <div style={{position: 'absolute', left: 0, right: 0, top: -64, textAlign: 'center', fontSize: 56, color: GOLD,
        filter: `drop-shadow(0 0 12px ${GOLD})`}}>♛</div>}
      <div style={{fontFamily: DISPLAY, fontSize: big ? 120 : 100, lineHeight: 1.1, textAlign: 'center', color: '#1a1004', borderRadius: 14,
        background: `linear-gradient(100deg,#9a6516,#f7d77a 35%,#fff8dc ${40 + ((t * 70) % 50)}%,#f2c14e 75%,#9a6516)`,
        boxShadow: `0 0 ${big ? 50 + beatPulse(t) * 30 : 24}px ${GOLD}, 0 10px 0 #3a2405`}}>{label}</div>
    </div>
  );
};

const Vip: React.FC<SP> = ({t}) => (
  <AbsoluteFill>
    <Bg a="#4a3208" b="#050302" />
    <Haze t={t} colors={[GOLD, '#ff9a3a']} opacity={0.45} />
    <Beams t={t} colors={[GOLD, '#fff1c2']} count={6} intensity={0.9} />
    <Bokeh t={t} color={GOLD} seed="vip" count={34} />
    <Bottle t={t} x={150} y={850} s={0.95} start={W.tables} color={GOLD} rot={-10} />
    <Bottle t={t} x={930} y={850} s={0.95} start={W.tables + 0.2} color={GOLD} rot={10} />
    <Slam t={t} at={W.tables} top={115} size={130} spacing="0.08em">Tables</Slam>
    <div style={{position: 'absolute', left: 80, right: 80, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 26}}>
      <Badge t={t} at={W.reg} label="REG" />
      <Badge t={t} at={W.vip} label="VIP" />
      <Badge t={t} at={W.vvip} label="VVIP" big />
    </div>
    <Letters t={t} at={W.entree} top={590} size={46} font={BODY} weight={800} spacing="0.3em" stagger={0.03}>entrée</Letters>
    {t > W.prix && (
      <div style={{position: 'absolute', left: 80, right: 80, top: 660, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontSize: 130, lineHeight: 1.05, color: '#fff', padding: '0 40px', borderRadius: 16,
          border: '4px dashed #fff', background: '#0a0603dd', boxShadow: `0 0 40px ${GOLD}`,
          transform: `scale(${2 - prog(t, W.prix, 0.35)}) rotate(${(1 - prog(t, W.prix, 0.4)) * -10}deg)`, opacity: prog(t, W.prix, 0.1)}}>
          3 000 <span style={{color: GOLD}}>FCFA</span>
        </div>
      </div>
    )}
  </AbsoluteFill>
);

// ---------- 8. Dress code ----------
const Dress: React.FC<SP> = ({t}) => {
  const p = prog(t, W.barcelonais - 0.05, 0.5);
  const swing = (o: number) => Math.sin(t * 3 + o) * 6;
  const leftW = 1080 - 540 * p;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: leftW, overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 45%, #ffffff, #e9dfc6 70%, #c9a24a)'}}>
        <Beams t={t} colors={[GOLD, '#fff']} count={4} intensity={0.6} />
        <div style={{position: 'absolute', left: leftW / 2, top: 540, transform: `translate(-50%,-50%) scale(${1 - 0.42 * p})`}}>
          <div style={{transform: `rotate(${swing(0)}deg) scale(${0.6 + 0.4 * prog(t, W.madrilene, 0.4)})`}}>
            <Jersey variant="madrid" size={430} label="RM" />
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, width: leftW, top: 190 + p * 40, textAlign: 'center', fontFamily: DISPLAY,
          fontSize: 120 - 50 * p, color: '#0b0a10', opacity: prog(t, W.madrilene, 0.2)}}>MADRILÈNE ?</div>
        {t > W.maillotReal && (
          <div style={{position: 'absolute', left: 0, width: leftW, bottom: 130, textAlign: 'center', fontFamily: BODY, fontWeight: 800,
            fontSize: 44 - 14 * p, color: '#0b0a10', opacity: prog(t, W.maillotReal, 0.25),
            transform: `translateY(${(1 - prog(t, W.maillotReal, 0.35)) * 40}px)`}}>
            VIENS EN <span style={{background: '#0b0a10', color: GOLD, padding: '0 12px'}}>MAILLOT DU REAL</span>
          </div>
        )}
      </div>
      <div style={{position: 'absolute', left: leftW, top: 0, bottom: 0, width: 540, overflow: 'hidden',
        background: `repeating-linear-gradient(90deg, ${BLUE} 0 60px, ${GARNET} 60px 120px)`, backgroundPosition: `${t * 40}px 0`,
        boxShadow: '-20px 0 40px #0008'}}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent, #0009 80%)'}} />
        <div style={{position: 'absolute', left: 270, top: 540, transform: 'translate(-50%,-50%) scale(0.58)'}}>
          <div style={{transform: `rotate(${swing(1.5)}deg)`}}><Jersey variant="barca" size={430} label="FCB" /></div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: DISPLAY, fontSize: 70, color: '#fff',
          textShadow: '0 4px 0 #0007'}}>BARCELONAIS ?</div>
        {t > W.maillotBarca && (
          <div style={{position: 'absolute', left: 20, right: 20, bottom: 130, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 22, whiteSpace: 'nowrap', color: '#fff',
            opacity: prog(t, W.maillotBarca, 0.25), transform: `translateY(${(1 - prog(t, W.maillotBarca, 0.35)) * 40}px)`}}>
            SORS TON <span style={{background: '#fff', color: GARNET, padding: '0 10px'}}>MAILLOT DU BARÇA</span>
          </div>
        )}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 90, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontSize: 64, padding: '0 28px', color: '#0b0a10', background: GOLD, letterSpacing: '0.04em',
          transform: `rotate(-3deg) scale(${prog(t, W.madrilene, 0.35)})`, boxShadow: '0 8px 0 #0b0a10'}}>DRESS CODE</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 9. Call to action ----------
const WaIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M16 3C9 3 3.4 8.6 3.4 15.5c0 2.4.7 4.7 1.9 6.6L3.3 29l7.1-1.9c1.8 1 3.8 1.5 5.6 1.5 7 0 12.6-5.6 12.6-12.6S23 3 16 3z" fill="#fff" />
    <path d="M12 9.5c-.3-.6-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.7 4.3 6.7 5.9 3.3 1.3 4 1 4.7 1 .7-.1 2.3-.9 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.4-.3-.8-.5s-2.3-1.1-2.6-1.3c-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.3 0-.5 0-.7-.1-.2-.8-2.1-1.2-2.9z" fill="#25d366" />
  </svg>
);

const Cta: React.FC<SP> = ({t}) => {
  const swap = prog(t, W.lostalos2 - 0.1, 0.4);
  const groups: [string, number][] = [['84', W.n1], ['87', W.n2], ['09', W.n3], ['17', W.n4]];
  const signOn = t > W.lostalos2 && (t > W.lostalos2 + 0.45 || random('s' + Math.floor(t * 30)) > 0.35);
  return (
    <AbsoluteFill>
      <Bg a="#2a0a4a" b="#030106" />
      <Haze t={t} colors={[PURPLE, GOLD, '#25d366']} opacity={0.4} />
      <Beams t={t} colors={[PURPLE, GOLD, PINK, CYAN]} count={8} intensity={1.1} />
      <Lasers t={t} color={GOLD} count={9} intensity={0.6 + 0.4 * swap} />
      <Bokeh t={t} color={GOLD} seed="cta" />
      <Crowd t={t} light={PURPLE} seed="cta" />
      <div style={{opacity: 1 - swap, transform: `translateY(${-swap * 120}px) scale(${1 - swap * 0.2})`, position: 'absolute', inset: 0}}>
        <Slam t={t} at={W.reserve} top={110} size={170}>Réserve</Slam>
        <Slam t={t} at={33.38} top={275} size={170} inner={goldText(t)}>ta table</Slam>
        <Letters t={t} at={W.maintenant} top={465} size={44} font={BODY} weight={800} spacing="0.4em" glow={PURPLE} stagger={0.02}>maintenant</Letters>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 120, textAlign: 'center', opacity: swap}}>
        <div style={{fontFamily: DISPLAY, fontSize: 200, lineHeight: 1, color: signOn ? '#fff' : '#ffffff40', letterSpacing: '0.04em',
          textShadow: signOn ? `0 0 20px ${PURPLE}, 0 0 60px ${PURPLE}, 0 0 110px ${PINK}` : 'none'}}>LOSTALOS</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 52, letterSpacing: '0.45em', marginTop: 10, color: GOLD, paddingLeft: '0.45em',
          textShadow: `0 0 20px ${GOLD}`}}>NIGHT CLUB</div>
      </div>
      {t > W.n1 - 0.15 && (
        <div style={{position: 'absolute', left: 80, right: 80, top: 575, display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 36px 14px 20px', borderRadius: 999, background: '#25d366',
            boxShadow: `0 0 ${30 + beatPulse(t) * 30}px #25d366, 0 10px 0 #0c6b33`,
            transform: `scale(${(0.4 + 0.6 * prog(t, W.n1 - 0.15, 0.45)) * (1 + beatPulse(t, 7) * 0.03)})`}}>
            <WaIcon size={84} />
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 60, color: '#04210f', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
              +227{groups.map(([g, a]) => (
                <span key={g} style={{display: 'inline-block', marginLeft: 16, opacity: t > a ? 1 : 0.18,
                  transform: `translateY(${t > a ? (1 - prog(t, a, 0.3)) * -30 : 0}px) scale(${t > a ? 1 + 0.4 * Math.exp(-(t - a) * 8) : 1})`}}>{g}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      <Slam t={t} at={W.attend} top={745} size={120} inner={goldText(t)}>On t'attend !</Slam>
      <Letters t={t} at={W.attend + 0.4} top={890} size={34} font={BODY} weight={800} spacing="0.2em" stagger={0.015}
        style={{textShadow: '0 2px 12px #000'}}>sam. 24 oct. · dès 23h</Letters>
    </AbsoluteFill>
  );
};

const SCENE_VIEWS: Record<SceneKey, React.FC<SP>> = {
  hook: Hook, rivalry: Rivalry, title: Title, date: DateScene, vibe: Vibe, djs: Djs, vip: Vip, dress: Dress, cta: Cta,
};

// Boundaries inside the vibe montage also get a punch-in.
const CUTS = [...Object.values(SCENES).map(([a]) => a), W.foule, W.bouteilles, W.ambiance, W.jusquau];

export const Classico: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const keys = Object.keys(SCENES) as SceneKey[];

  const lastCut = Math.max(...CUTS.filter((c) => c <= t));
  const since = t - lastCut;
  const punch = Math.exp(-since * 9);
  const hit = hitEnvelope(t);
  const shakeX = Math.sin(t * 83) * hit * 16, shakeY = Math.cos(t * 71) * hit * 12;
  const drift = 1 + 0.035 * clamp(since / 3);
  const flash = lastCut > 0 ? Math.exp(-since * 14) * 0.85 : 0;

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{
        transform: `translate(${shakeX}px, ${shakeY}px) scale(${(1 + punch * 0.12) * drift}) rotate(${Math.sin(t * 61) * hit * 0.8}deg)`,
        filter: punch > 0.25 ? `blur(${punch * 6}px) saturate(1.2)` : 'saturate(1.15)',
      }}>
        {keys.map((k) => {
          const [a, b] = SCENES[k];
          // The rivalry panels fly away on top of the title scene, so it is drawn last and lingers.
          const tail = k === 'rivalry' ? 0.45 : 0;
          if (t < a || t >= b + tail) return null;
          const View = SCENE_VIEWS[k];
          return <AbsoluteFill key={k} style={{zIndex: k === 'rivalry' ? 5 : 1}}><View t={t} /></AbsoluteFill>;
        })}
      </AbsoluteFill>
      {/* light flash on every cut */}
      <AbsoluteFill style={{background: 'radial-gradient(circle, #fff 0%, #fff8 40%, transparent 75%)', opacity: flash, mixBlendMode: 'screen'}} />
      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 55%, #000000b0 100%)'}} />
      {/* fade out the very end */}
      <AbsoluteFill style={{background: '#000', opacity: clamp((t - 42.0) / 0.45)}} />

      <Audio src={staticFile('voiceover.mp3')} />
      {[2.6, 7.35, 10.55, 13.45, 14.7, 15.5, 16.85, 17.8, 19.15, 23.45, 27.65, 30.05, 32.45, 38.8].map((s, i) => (
        <Sequence key={'w' + i} from={Math.round(s * FPS)} durationInFrames={20}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
      ))}
      {[W.vs, W.classico2, W.folie, W.prix, W.lostalos2].map((s, i) => (
        <Sequence key={'i' + i} from={Math.round(s * FPS)} durationInFrames={33}><Audio src={staticFile('sfx/impact.wav')} volume={0.5} /></Sequence>
      ))}
      {[6.0].map((s, i) => (
        <Sequence key={'r' + i} from={Math.round(s * FPS)} durationInFrames={48}><Audio src={staticFile('sfx/riser.wav')} volume={0.25} /></Sequence>
      ))}
      {[W.classico2, W.bouteilles, W.vvip, W.attend].map((s, i) => (
        <Sequence key={'s' + i} from={Math.round(s * FPS)} durationInFrames={27}><Audio src={staticFile('sfx/sparkle.wav')} volume={0.3} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
