import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, HEIGHT, WIDTH} from '../theme';

const PARTICLES = new Array(46).fill(0).map((_, i) => ({
	x: random(`px${i}`) * WIDTH,
	y: random(`py${i}`) * HEIGHT,
	r: 2 + random(`pr${i}`) * 5,
	speed: 0.6 + random(`ps${i}`) * 2.2,
	drift: random(`pd${i}`) * Math.PI * 2,
	color: [C.cyan, C.violet, C.yellow, C.white][i % 4],
}));

// Lignes de circuit : segments à angles droits parcourus par une impulsion lumineuse.
const CIRCUITS = [
	'M -20 420 H 180 L 260 500 H 520',
	'M 1100 300 H 900 L 820 380 H 640',
	'M -20 1640 H 240 L 330 1550 H 560 L 620 1610',
	'M 1100 1500 H 860 L 780 1580 H 600',
	'M 120 -20 V 160 L 200 240 V 340',
	'M 960 1940 V 1760 L 880 1680 V 1600',
];

export const Background: React.FC<{tint?: string; intensity?: number}> = ({
	tint = C.violet,
	intensity = 1,
}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const gridShift = (frame * 2.2) % 120;
	const pulse = 0.85 + Math.sin(t * 1.3) * 0.15;

	return (
		<AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
			{/* Dégradé radial principal */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 90% 60% at 50% ${45 + Math.sin(t * 0.5) * 6}%, ${C.bg2} 0%, ${C.bg} 70%)`,
				}}
			/>
			{/* Halo coloré mobile */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle 620px at ${50 + Math.sin(t * 0.7) * 22}% ${38 + Math.cos(t * 0.6) * 10}%, ${tint}55, transparent 70%)`,
					opacity: pulse * intensity,
				}}
			/>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle 520px at ${50 - Math.sin(t * 0.5) * 25}% ${72 + Math.sin(t * 0.8) * 8}%, ${C.cyan}22, transparent 70%)`,
				}}
			/>
			{/* Grille en perspective qui défile */}
			<AbsoluteFill style={{perspective: 900, opacity: 0.32 * intensity}}>
				<div
					style={{
						position: 'absolute',
						left: -WIDTH,
						width: WIDTH * 3,
						top: HEIGHT * 0.58,
						height: HEIGHT,
						transform: 'rotateX(68deg)',
						transformOrigin: 'top center',
						backgroundImage: `linear-gradient(${C.violet}aa 2px, transparent 2px), linear-gradient(90deg, ${C.violet}aa 2px, transparent 2px)`,
						backgroundSize: '120px 120px',
						backgroundPosition: `0 ${gridShift}px`,
						maskImage: 'linear-gradient(to bottom, black, transparent 75%)',
						WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 75%)',
					}}
				/>
			</AbsoluteFill>
			{/* Grille fine statique en haut */}
			<AbsoluteFill
				style={{
					backgroundImage: `linear-gradient(${C.cyan}10 1px, transparent 1px), linear-gradient(90deg, ${C.cyan}10 1px, transparent 1px)`,
					backgroundSize: '60px 60px',
					backgroundPosition: `${(frame * 0.4) % 60}px 0`,
					maskImage: 'radial-gradient(ellipse at 50% 30%, black, transparent 70%)',
					WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black, transparent 70%)',
				}}
			/>
			{/* Circuits */}
			<svg width={WIDTH} height={HEIGHT} style={{position: 'absolute'}}>
				<defs>
					<filter id="cglow">
						<feGaussianBlur stdDeviation="4" />
					</filter>
				</defs>
				{CIRCUITS.map((d, i) => {
					const len = 900;
					const head = ((frame * 9 + i * 260) % (len + 400)) - 200;
					return (
						<g key={i}>
							<path d={d} stroke={`${C.cyan}30`} strokeWidth={3} fill="none" />
							<path
								d={d}
								stroke={i % 2 ? C.cyan : C.violet}
								strokeWidth={5}
								fill="none"
								strokeLinecap="round"
								strokeDasharray={`120 ${len * 2}`}
								strokeDashoffset={-head}
								filter="url(#cglow)"
							/>
							<path
								d={d}
								stroke={C.white}
								strokeWidth={3}
								fill="none"
								strokeLinecap="round"
								strokeDasharray={`60 ${len * 2}`}
								strokeDashoffset={-head - 30}
							/>
						</g>
					);
				})}
			</svg>
			{/* Particules lumineuses */}
			{PARTICLES.map((p, i) => {
				const y = (((p.y - frame * p.speed * 2) % HEIGHT) + HEIGHT) % HEIGHT;
				const x = p.x + Math.sin(t * 0.8 + p.drift) * 30;
				const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 2 + p.drift));
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: p.r * 2,
							height: p.r * 2,
							borderRadius: '50%',
							background: p.color,
							opacity: tw * 0.8 * intensity,
							boxShadow: `0 0 ${p.r * 5}px ${p.color}`,
						}}
					/>
				);
			})}
			{/* Vignette */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)',
					opacity: interpolate(intensity, [0, 1], [0.5, 1]),
				}}
			/>
		</AbsoluteFill>
	);
};
