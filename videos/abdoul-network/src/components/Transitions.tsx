import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';

export type TransitionType = 'zoom' | 'whip' | 'glitch' | 'wipe' | 'none';

const IN = 9; // durée d'entrée (frames) : rapide et nerveuse

/**
 * Enveloppe de scène : transition d'entrée + mouvement continu
 * (zoom lent) pour qu'aucun plan ne reste statique.
 */
export const SceneShell: React.FC<{
	type: TransitionType;
	children: React.ReactNode;
	drift?: number;
}> = ({type, children, drift = 0.06}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const p = interpolate(frame, [0, IN], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const slow = 1 + drift * (frame / Math.max(1, durationInFrames));
	let transform = `scale(${slow})`;
	let filter = 'none';
	let clipPath: string | undefined;

	if (type === 'zoom') {
		transform = `scale(${interpolate(p, [0, 1], [2.4, 1]) * slow})`;
		filter = `blur(${interpolate(p, [0, 1], [18, 0])}px)`;
	} else if (type === 'whip') {
		transform = `translateX(${interpolate(p, [0, 1], [1300, 0])}px) skewX(${interpolate(p, [0, 1], [-18, 0])}deg) scale(${slow})`;
		filter = `blur(${interpolate(p, [0, 0.8, 1], [26, 4, 0])}px)`;
	} else if (type === 'wipe') {
		const k = interpolate(p, [0, 1], [-60, 160]);
		clipPath = `polygon(0% 0%, ${k}% 0%, ${k - 60}% 100%, 0% 100%)`;
		transform = `scale(${interpolate(p, [0, 1], [1.15, 1]) * slow})`;
	} else if (type === 'glitch' && frame < IN) {
		const j = (random(`g${frame}`) - 0.5) * 120;
		transform = `translateX(${j}px) skewX(${(random(`k${frame}`) - 0.5) * 20}deg) scale(${slow})`;
		filter = `hue-rotate(${random(`h${frame}`) * 180}deg) saturate(2)`;
	}

	return (
		<AbsoluteFill style={{transform, filter, clipPath}}>
			{children}
			{type === 'glitch' && frame < IN + 2 && <GlitchBars frame={frame} />}
			{type === 'wipe' && p < 1 && (
				<AbsoluteFill
					style={{
						background: `linear-gradient(105deg, transparent ${interpolate(p, [0, 1], [-40, 120]) - 8}%, ${C.yellow} ${interpolate(p, [0, 1], [-40, 120]) - 2}%, transparent ${interpolate(p, [0, 1], [-40, 120]) + 4}%)`,
						mixBlendMode: 'screen',
					}}
				/>
			)}
		</AbsoluteFill>
	);
};

const GlitchBars: React.FC<{frame: number}> = ({frame}) => (
	<AbsoluteFill style={{}}>
		{new Array(9).fill(0).map((_, i) => {
			const y = random(`y${frame}-${i}`) * 1920;
			const h = 10 + random(`hh${frame}-${i}`) * 70;
			const x = (random(`x${frame}-${i}`) - 0.5) * 300;
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: x,
						top: y,
						width: 1080,
						height: h,
						background: i % 3 === 0 ? '#0057FF' : i % 3 === 1 ? C.white : C.yellow,
						opacity: 0.55,
					}}
				/>
			);
		})}
	</AbsoluteFill>
);

/** Flash blanc (ou coloré) qui s'éteint en quelques frames. */
export const Flash: React.FC<{color?: string; duration?: number; strength?: number}> = ({
	color = C.white,
	duration = 8,
	strength = 1,
}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [0, duration], [strength, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.quad),
	});
	if (o <= 0) return null;
	return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};
