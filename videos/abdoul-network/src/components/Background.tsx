import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, HEIGHT, WIDTH} from '../theme';

const PARTICLES = new Array(28).fill(0).map((_, i) => ({
	x: random(`px${i}`) * WIDTH,
	y: random(`py${i}`) * HEIGHT,
	r: 2 + random(`pr${i}`) * 4,
	speed: 0.5 + random(`ps${i}`) * 1.6,
	drift: random(`pd${i}`) * Math.PI * 2,
	color: i % 3 === 0 ? C.yellow : C.white,
}));

/**
 * Fond : une vraie photo plein écran, floutée et assombrie, avec un zoom
 * lent (Ken Burns) et quelques particules lumineuses — jamais statique.
 */
export const Background: React.FC<{image: string; focus?: string}> = ({image, focus = '50% 40%'}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = frame / 30;
	const p = frame / Math.max(1, durationInFrames);
	const scale = 1.18 + p * 0.12;
	const panX = Math.sin(t * 0.35) * 20;

	return (
		<AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
			<Img
				src={staticFile(image)}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: focus,
					transform: `translateX(${panX}px) scale(${scale})`,
					filter: 'blur(16px) brightness(0.5) saturate(0.95)',
				}}
			/>
			{/* Assombrissement : centre lisible, bords plus sombres */}
			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, ${C.bg}d0 0%, ${C.bg}66 30%, ${C.bg}66 62%, ${C.bg}e0 100%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)',
				}}
			/>
			{PARTICLES.map((pt, i) => {
				const y = (((pt.y - frame * pt.speed * 2) % HEIGHT) + HEIGHT) % HEIGHT;
				const x = pt.x + Math.sin(t * 0.8 + pt.drift) * 26;
				const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + pt.drift));
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: pt.r * 2,
							height: pt.r * 2,
							borderRadius: '50%',
							background: pt.color,
							opacity: tw * 0.55,
							boxShadow: `0 0 ${pt.r * 5}px ${pt.color}`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
