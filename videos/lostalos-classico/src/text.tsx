import React from 'react';
import {spring} from 'remotion';
import {clamp, FPS} from './timing';

export const DISPLAY = 'Anton, Impact, sans-serif';
export const BODY = 'Montserrat, Arial, sans-serif';

type Common = {
  t: number; at: number; out?: number; top: number; size: number;
  color?: string; font?: string; weight?: number; spacing?: string;
  glow?: string; style?: React.CSSProperties; children: React.ReactNode;
};

const exitOf = (t: number, out?: number) => (out === undefined ? 0 : clamp((t - out) / 0.18));

// Text that slams in from big/blurred to its size with an overshoot and RGB split.
export const Slam: React.FC<Common & {from?: number; inner?: React.CSSProperties}> = ({
  t, at, out, top, size, color = '#fff', font = DISPLAY, weight = 400, spacing = '0.01em', glow, style, children, from = 2.4, inner,
}) => {
  const l = t - at;
  if (l < 0) return null;
  const e = exitOf(t, out);
  if (e >= 1) return null;
  const sp = spring({frame: l * FPS, fps: FPS, config: {damping: 11, stiffness: 210, mass: 0.55}});
  const scale = (from + (1 - from) * sp) * (1 + e * 0.35);
  const blur = (1 - clamp(l / 0.16)) * 14 + e * 14;
  const split = 14 * Math.exp(-l * 9);
  const shadows = [
    `${split}px 0 0 rgba(255,40,110,${0.8 * Math.exp(-l * 6)})`,
    `${-split}px 0 0 rgba(40,220,255,${0.8 * Math.exp(-l * 6)})`,
  ];
  if (glow) shadows.push(`0 0 ${size * 0.18}px ${glow}`, `0 0 ${size * 0.45}px ${glow}`);
  return (
    <div style={{
      position: 'absolute', left: 80, right: 80, top, textAlign: 'center', fontFamily: font, fontWeight: weight,
      fontSize: size, lineHeight: 0.95, color, letterSpacing: spacing, textTransform: 'uppercase',
      transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      opacity: clamp(l / 0.06) * (1 - e), textShadow: shadows.join(','), whiteSpace: 'nowrap', ...style,
    }}>{inner ? <span style={inner}>{children}</span> : children}</div>
  );
};

// Letters rise one after another from below with blur.
export const Letters: React.FC<Common & {stagger?: number}> = ({
  t, at, out, top, size, color = '#fff', font = DISPLAY, weight = 400, spacing = '0.02em', glow, style, children, stagger = 0.035,
}) => {
  if (t < at) return null;
  const e = exitOf(t, out);
  if (e >= 1) return null;
  const chars = String(children).split('');
  return (
    <div style={{
      position: 'absolute', left: 80, right: 80, top, textAlign: 'center', fontFamily: font, fontWeight: weight,
      fontSize: size, lineHeight: 1, color, letterSpacing: spacing, textTransform: 'uppercase', whiteSpace: 'nowrap',
      opacity: 1 - e, transform: `translateY(${-e * 40}px)`, filter: e > 0 ? `blur(${e * 10}px)` : undefined,
      textShadow: glow ? `0 0 ${size * 0.2}px ${glow}, 0 0 ${size * 0.5}px ${glow}` : undefined, ...style,
    }}>
      {chars.map((c, i) => {
        const l = t - at - i * stagger;
        const sp = l <= 0 ? 0 : spring({frame: l * FPS, fps: FPS, config: {damping: 13, stiffness: 190, mass: 0.5}});
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: clamp(l / 0.08),
            transform: `translateY(${(1 - sp) * size * 0.7}px) rotate(${(1 - sp) * 12}deg)`,
            filter: l < 0.15 ? `blur(${(1 - clamp(l / 0.15)) * 8}px)` : undefined}}>{c}</span>
        );
      })}
    </div>
  );
};

// Gold text with a moving specular sweep.
export const goldText = (t: number, speed = 1): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, #8a5a12 0%, #f7d77a 30%, #fff8dc ${40 + ((t * 60 * speed) % 60)}%, #f2c14e 70%, #9a6516 100%)`,
  backgroundSize: '100% 100%',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
  textShadow: 'none', display: 'inline-block', padding: '0 0.04em',
  filter: 'drop-shadow(0 6px 0 #3a2405) drop-shadow(0 0 24px #f2c14e88)',
});
