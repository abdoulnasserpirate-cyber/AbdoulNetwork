import React from 'react';
import {random} from 'remotion';
import {beatPos, beatPulse, clamp} from './timing';

const TAU = Math.PI * 2;

// Volumetric light beams hanging from the ceiling.
export const Beams: React.FC<{t: number; colors: string[]; count?: number; intensity?: number; spread?: number}> = ({
  t, colors, count = 6, intensity = 1, spread = 28,
}) => (
  <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none'}}>
    {Array.from({length: count}).map((_, i) => {
      const x = ((i + 0.5) / count) * 1080;
      const ang = Math.sin(t * (0.9 + i * 0.13) + i * 1.7) * spread + (i - (count - 1) / 2) * 6;
      const c = colors[i % colors.length];
      const flick = 0.55 + 0.45 * beatPulse(t + i * 0.05, 4);
      return (
        <div key={i} style={{
          position: 'absolute', left: x - 170, top: -60, width: 340, height: 1500,
          transformOrigin: '50% 0%', transform: `rotate(${ang}deg)`,
          background: `linear-gradient(to bottom, ${c} 0%, ${c}88 25%, transparent 80%)`,
          clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
          opacity: 0.32 * intensity * flick, filter: 'blur(10px)',
        }} />
      );
    })}
    {Array.from({length: count}).map((_, i) => (
      <div key={'h' + i} style={{
        position: 'absolute', left: ((i + 0.5) / count) * 1080 - 22, top: -14, width: 44, height: 28,
        borderRadius: '50%', background: '#fff', boxShadow: `0 0 30px 12px ${colors[i % colors.length]}`,
        opacity: 0.85 * intensity,
      }} />
    ))}
  </div>
);

// Sweeping laser fan from a source point.
export const Lasers: React.FC<{t: number; color: string; x?: number; y?: number; count?: number; intensity?: number; speed?: number}> = ({
  t, color, x = 540, y = 1120, count = 9, intensity = 1, speed = 1,
}) => (
  <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none', opacity: intensity}}>
    {Array.from({length: count}).map((_, i) => {
      const base = -90 + (i - (count - 1) / 2) * (110 / count);
      const ang = base + Math.sin(t * 1.6 * speed + i * 0.6) * 22;
      return (
        <div key={i} style={{
          position: 'absolute', left: x, top: y, width: 1700, height: 3,
          transformOrigin: '0 50%', transform: `rotate(${ang}deg)`,
          background: `linear-gradient(to right, #fff, ${color} 20%, ${color}00 95%)`,
          boxShadow: `0 0 10px 2px ${color}`, opacity: 0.75,
        }} />
      );
    })}
    <div style={{position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: '50%',
      background: '#fff', boxShadow: `0 0 50px 25px ${color}`}} />
  </div>
);

// Slow drifting coloured smoke.
export const Haze: React.FC<{t: number; colors: string[]; opacity?: number}> = ({t, colors, opacity = 0.55}) => (
  <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity}}>
    {colors.map((c, i) => {
      const x = 540 + Math.sin(t * 0.35 + i * 2.1) * 380;
      const y = 520 + Math.cos(t * 0.28 + i * 1.3) * 300;
      return <div key={i} style={{position: 'absolute', left: x - 500, top: y - 500, width: 1000, height: 1000,
        borderRadius: '50%', background: `radial-gradient(circle, ${c}aa 0%, ${c}33 35%, transparent 65%)`}} />;
    })}
  </div>
);

// Floating bokeh / dust.
export const Bokeh: React.FC<{t: number; color: string; count?: number; seed?: string}> = ({t, color, count = 26, seed = 'b'}) => (
  <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
    {Array.from({length: count}).map((_, i) => {
      const r = 6 + random(seed + i) * 26;
      const x = (random(seed + 'x' + i) * 1180 + t * (10 + random(seed + 'v' + i) * 30)) % 1180 - 50;
      const y = (random(seed + 'y' + i) * 1180 - t * (20 + random(seed + 'w' + i) * 40) + 2000) % 1180 - 50;
      const a = 0.25 + 0.5 * Math.abs(Math.sin(t * 1.3 + i));
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%',
        background: color, opacity: a, filter: `blur(${r > 20 ? 4 : 1}px)`}} />;
    })}
  </div>
);

// One articulated dancing silhouette.
type Pose = 'up' | 'wave' | 'pump' | 'jump';
const Dancer: React.FC<{t: number; x: number; base: number; s: number; ph: number; pose: Pose; phone?: boolean; fill: string; light: string}> = ({
  t, x, base, s, ph, pose, phone, fill, light,
}) => {
  const b = beatPos(t) + ph;
  const bounce = Math.abs(Math.sin(Math.PI * b));
  const jumpY = pose === 'jump' ? Math.pow(Math.abs(Math.sin(Math.PI * b * 0.5)), 3) * 40 : 0;
  const lean = Math.sin(TAU * b * 0.25) * 8;
  const hipY = base - 100 * s + bounce * 10 * s - jumpY * s;
  const hipX = x;
  const neckX = hipX + lean * s, neckY = hipY - 82 * s;
  const sh = 22 * s;
  const sway = Math.sin(TAU * b * 0.5);
  let aL: number, aR: number, eL: number, eR: number;
  if (pose === 'up' || pose === 'jump') {
    aL = 155 + sway * 15; aR = 155 - sway * 15; eL = 10; eR = 10;
  } else if (pose === 'wave') {
    aL = 165; aR = 40 + Math.abs(sway) * 30; eL = sway * 25; eR = 70;
  } else {
    const p = Math.abs(Math.sin(Math.PI * b));
    aL = 120 + p * 55; aR = 35; eL = 15; eR = 90;
  }
  // Angles are measured from straight down, positive outward.
  const arm = (side: -1 | 1, a: number, e: number) => {
    const sx = neckX + side * sh, sy = neckY + 8 * s;
    const r1 = (a * Math.PI) / 180;
    const ex = sx + side * Math.sin(r1) * 44 * s, ey = sy + Math.cos(r1) * 44 * s;
    const r2 = ((a + e) * Math.PI) / 180;
    const hx = ex + side * Math.sin(r2) * 42 * s, hy = ey + Math.cos(r2) * 42 * s;
    return {d: `M${sx},${sy} L${ex},${ey} L${hx},${hy}`, hx, hy};
  };
  const L = arm(-1, aL, eL), R = arm(1, aR, eR);
  const knee = (side: number) => `M${hipX + side * 10 * s},${hipY} L${hipX + side * (18 + bounce * 6) * s},${hipY + 50 * s} L${hipX + side * 16 * s},${base + 10 * s}`;
  return (
    <g>
      <path d={knee(-1)} stroke={fill} strokeWidth={22 * s} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={knee(1)} stroke={fill} strokeWidth={22 * s} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M${hipX},${hipY} L${neckX},${neckY + 14 * s}`} stroke={fill} strokeWidth={46 * s} strokeLinecap="round" />
      <path d={`M${neckX - sh},${neckY + 8 * s} L${neckX + sh},${neckY + 8 * s}`} stroke={fill} strokeWidth={22 * s} strokeLinecap="round" />
      <path d={L.d} stroke={fill} strokeWidth={14 * s} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={R.d} stroke={fill} strokeWidth={14 * s} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={neckX + lean * 0.3 * s} cy={neckY - 20 * s} r={19 * s} fill={fill} />
      {phone && (
        <g>
          <rect x={L.hx - 7 * s} y={L.hy - 22 * s} width={14 * s} height={22 * s} rx={3 * s} fill="#fff" />
          <circle cx={L.hx} cy={L.hy - 11 * s} r={24 * s} fill={light} opacity={0.35} />
        </g>
      )}
    </g>
  );
};

const POSES: Pose[] = ['up', 'wave', 'pump', 'jump', 'up', 'pump', 'wave', 'up'];

// Two rows of dancing silhouettes along the bottom of the frame.
export const Crowd: React.FC<{t: number; light: string; rows?: number; y?: number; scale?: number; seed?: string; density?: number}> = ({
  t, light, rows = 2, y = 0, scale = 1, seed = 'c', density = 1,
}) => {
  const layers = [];
  for (let r = 0; r < rows; r++) {
    const far = r === 0 && rows > 1;
    const n = Math.round((far ? 14 : 9) * density);
    const s = (far ? 0.95 : 1.55) * scale;
    const base = 1080 + (far ? 40 : 150) * scale + y;
    const items = Array.from({length: n}).map((_, i) => {
      const x = ((i + 0.5 + (random(seed + r + i) - 0.5) * 0.6) / n) * 1180 - 50;
      return (
        <Dancer key={i} t={t} x={x} base={base} s={s * (0.9 + random(seed + 's' + r + i) * 0.2)}
          ph={random(seed + 'p' + r + i) * 2} pose={POSES[(i + r * 3) % POSES.length]}
          phone={random(seed + 'ph' + r + i) > 0.72} fill={far ? '#140b22' : '#030106'} light={light} />
      );
    });
    layers.push(
      <svg key={r} width={1080} height={1080} style={{position: 'absolute', inset: 0,
        filter: far ? `blur(1.5px) drop-shadow(0 0 10px ${light}66)` : `drop-shadow(0 -2px 8px ${light})`}}>
        {items}
      </svg>,
    );
  }
  return <div style={{position: 'absolute', inset: 0}}>{layers}</div>;
};

// Big hero silhouette (single fan / DJ) drawn in a centered svg.
export const Fan: React.FC<{t: number; x: number; s: number; light: string; pose?: Pose; ph?: number}> = ({t, x, s, light, pose = 'up', ph = 0}) => (
  <svg width={1080} height={1080} style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 0 14px ${light})`}}>
    <Dancer t={t} x={x} base={1080 + 60 * s} s={s} ph={ph} pose={pose} fill="#050208" light={light} />
  </svg>
);

// DJ behind the booth.
export const DJ: React.FC<{t: number; light: string; raise: number}> = ({t, light, raise}) => {
  const b = beatPos(t);
  const nod = Math.abs(Math.sin(Math.PI * b)) * 8;
  const cx = 540, top = 610 + nod;
  const ra = 30 + raise * 140 + Math.sin(TAU * b * 0.5) * 8 * raise;
  const r1 = (ra * Math.PI) / 180;
  const ex = cx + 52 + Math.sin(r1) * 70, ey = top + 70 + Math.cos(r1) * 70;
  const hx = ex + Math.sin(r1 + 0.2) * 66, hy = ey + Math.cos(r1 + 0.2) * 66;
  const lx = cx - 60 + Math.sin(TAU * b) * 10;
  return (
    <svg width={1080} height={1080} style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 0 18px ${light})`}}>
      <path d={`M${cx},${top + 60} L${cx},${top + 260}`} stroke="#040107" strokeWidth={110} strokeLinecap="round" />
      <path d={`M${cx - 52},${top + 70} L${cx + 52},${top + 70}`} stroke="#040107" strokeWidth={40} strokeLinecap="round" />
      <circle cx={cx} cy={top + 20} r={38} fill="#040107" />
      <path d={`M${cx - 44},${top + 20} A44,44 0 0 1 ${cx + 44},${top + 20}`} stroke="#040107" strokeWidth={10} fill="none" />
      <rect x={cx - 54} y={top + 6} width={18} height={34} rx={8} fill="#040107" />
      <rect x={cx + 36} y={top + 6} width={18} height={34} rx={8} fill="#040107" />
      <path d={`M${cx + 52},${top + 70} L${ex},${ey} L${hx},${hy}`} stroke="#040107" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M${cx - 52},${top + 70} L${cx - 90},${top + 170} L${lx},${top + 215}`} stroke="#040107" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const Booth: React.FC<{t: number; light: string}> = ({t, light}) => (
  <div style={{position: 'absolute', left: 140, right: 140, top: 820, height: 300, background: 'linear-gradient(#0d0716,#020104)',
    borderTop: `4px solid ${light}`, boxShadow: `0 -10px 40px ${light}`, borderRadius: '18px 18px 0 0', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 30, right: 30, top: 24, display: 'flex', gap: 6, alignItems: 'flex-end', height: 90}}>
      {Array.from({length: 26}).map((_, i) => {
        const h = 12 + 78 * clamp(0.25 + 0.75 * Math.abs(Math.sin(t * (3 + (i % 5)) + i)) * beatPulse(t + i * 0.01, 3));
        return <div key={i} style={{flex: 1, height: h, background: `linear-gradient(to top, ${light}, #fff)`, borderRadius: 3, opacity: 0.9}} />;
      })}
    </div>
    {[220, 580].map((x, i) => (
      <div key={i} style={{position: 'absolute', left: x, top: 140, width: 140, height: 140, borderRadius: '50%',
        border: `3px solid ${light}`, transform: `rotate(${t * 400 + i * 90}deg)`,
        background: 'repeating-conic-gradient(#222 0 10deg, #111 10deg 20deg)'}} />
    ))}
  </div>
);

// Mirror ball with spinning light specks.
export const DiscoBall: React.FC<{t: number; y: number; color: string}> = ({t, y, color}) => (
  <>
    <div style={{position: 'absolute', left: 540 - 2, top: -20, width: 4, height: y - 80 + 20, background: '#555'}} />
    <div style={{position: 'absolute', left: 540 - 95, top: y - 95, width: 190, height: 190, borderRadius: '50%', overflow: 'hidden',
      boxShadow: `0 0 80px 20px ${color}88, inset -30px -30px 60px #000a`,
      background: `repeating-linear-gradient(${90 + ((t * 60) % 30)}deg, #ddd 0 14px, #777 14px 16px), #999`}}>
      <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent 0 14px, #444 14px 16px)'}} />
      <div style={{position: 'absolute', left: 30 + Math.sin(t * 3) * 30, top: 30, width: 70, height: 70, borderRadius: '50%',
        background: 'radial-gradient(circle,#fff,transparent 70%)'}} />
    </div>
    <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
      {Array.from({length: 60}).map((_, i) => {
        const a = random('d' + i) * TAU + t * 0.6;
        const r = 160 + random('dr' + i) * 700;
        const x = 540 + Math.cos(a) * r, yy = y + Math.sin(a) * r * 0.75;
        return <div key={i} style={{position: 'absolute', left: x, top: yy, width: 8, height: 8, borderRadius: '50%',
          background: i % 3 === 0 ? color : '#fff', boxShadow: `0 0 10px ${color}`, opacity: 0.7}} />;
      })}
    </div>
  </>
);

// Champagne bottle silhouette with sparkler fountain.
export const Bottle: React.FC<{t: number; x: number; y: number; s?: number; start: number; color: string; rot?: number}> = ({t, x, y, s = 1, start, color, rot = 0}) => {
  const lt = t - start;
  const sparks = [];
  if (lt > 0) {
    for (let i = 0; i < 70; i++) {
      const life = 0.7 + random('l' + i) * 0.4;
      const birth = random('bt' + i) * life;
      const age = (lt + birth) % life;
      const vx = (random('vx' + i) - 0.5) * 360, vy = -420 - random('vy' + i) * 360;
      const px = vx * age, py = vy * age + 700 * age * age;
      sparks.push(<circle key={i} cx={px} cy={py} r={2.6 * (1 - age / life) + 0.6} fill={i % 4 ? '#fff6c8' : color} opacity={1 - age / life} />);
    }
  }
  return (
    <svg width={1080} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
        <path d="M-14,-150 L14,-150 L16,-95 C55,-70 55,-40 55,0 L55,170 C55,182 46,190 34,190 L-34,190 C-46,190 -55,182 -55,170 L-55,0 C-55,-40 -55,-70 -16,-95 Z"
          fill="#05030a" stroke={color} strokeWidth={3} />
        <rect x={-40} y={20} width={80} height={70} rx={6} fill={color} opacity={0.85} />
        <g transform="translate(0,-165)" style={{filter: `drop-shadow(0 0 6px ${color})`}}>
          {sparks}
          {lt > 0 && <circle cx={0} cy={0} r={10} fill="#fff" />}
        </g>
      </g>
    </svg>
  );
};

// Football jersey drawn in SVG; variant picks the kit.
export const Jersey: React.FC<{variant: 'madrid' | 'barca'; size: number; label: string}> = ({variant, size, label}) => {
  const id = 'j' + variant;
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 200 210">
      <defs>
        <clipPath id={id}>
          <path d="M60,8 Q100,30 140,8 L196,40 L176,92 L156,82 L156,204 L44,204 L44,82 L24,92 L4,40 Z" />
        </clipPath>
        <pattern id={id + 'p'} width="40" height="210" patternUnits="userSpaceOnUse">
          <rect width="20" height="210" fill="#1b3fa6" /><rect x="20" width="20" height="210" fill="#a5123a" />
        </pattern>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="200" height="210" fill={variant === 'madrid' ? '#fbfaf5' : `url(#${id}p)`} />
        {variant === 'madrid' && <rect x="0" y="150" width="200" height="8" fill="#d6a73b" />}
        <path d="M60,8 Q100,30 140,8" stroke={variant === 'madrid' ? '#d6a73b' : '#e8b93a'} strokeWidth="10" fill="none" />
        <text x="100" y="125" textAnchor="middle" fontFamily="Anton" fontSize="64" fill={variant === 'madrid' ? '#d6a73b' : '#ffd34d'}>{label}</text>
      </g>
      <path d="M60,8 Q100,30 140,8 L196,40 L176,92 L156,82 L156,204 L44,204 L44,82 L24,92 L4,40 Z" fill="none" stroke="#0006" strokeWidth="2" />
    </svg>
  );
};

// Falling confetti burst.
export const Confetti: React.FC<{t: number; start: number; colors: string[]; count?: number}> = ({t, start, colors, count = 90}) => {
  const lt = t - start;
  if (lt < 0 || lt > 4) return null;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {Array.from({length: count}).map((_, i) => {
        const vx = (random('cx' + i) - 0.5) * 1400, vy = -900 - random('cy' + i) * 700;
        const x = 540 + vx * lt * 0.8, y = 600 + vy * lt + 1100 * lt * lt;
        const r = lt * (300 + random('cr' + i) * 600);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 24,
          background: colors[i % colors.length], transform: `rotate(${r}deg) rotateX(${r * 1.3}deg)`, opacity: clamp(3.5 - lt)}} />;
      })}
    </div>
  );
};

// Forked lightning bolt between two points.
export const Lightning: React.FC<{t: number; x1: number; y1: number; x2: number; y2: number; color: string; seed: string}> = ({t, x1, y1, x2, y2, color, seed}) => {
  const k = Math.floor(t * 30);
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const f = i / 12;
    const off = i === 0 || i === 12 ? 0 : (random(seed + k + i) - 0.5) * 90;
    pts.push(`${x1 + (x2 - x1) * f + off},${y1 + (y2 - y1) * f + off * 0.3}`);
  }
  return (
    <svg width={1080} height={1080} style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 30px ${color})`}}>
      <polyline points={pts.join(' ')} stroke="#fff" strokeWidth={6} fill="none" strokeLinejoin="round" />
    </svg>
  );
};
