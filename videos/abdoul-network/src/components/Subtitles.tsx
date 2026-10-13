import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {CaptionGroup} from '../timeline';

/**
 * Sous-titres karaoké : groupes de 2 à 4 mots centrés vers y ≈ 1350 px,
 * le mot en cours de prononciation s'illumine en jaune.
 * `hidden` : intervalles (secondes) où les sous-titres s'effacent pour
 * laisser la place à un élément plus grand (numéro de téléphone).
 */
export const Subtitles: React.FC<{groups: CaptionGroup[]; hidden?: [number, number][]}> = ({
	groups,
	hidden = [],
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	if (hidden.some(([a, b]) => t >= a && t < b)) return null;

	const idx = groups.findIndex((g, i) => {
		const next = groups[i + 1];
		const until = next ? Math.min(next.start, g.end + 0.6) : g.end + 0.6;
		return t >= g.start - 0.05 && t < until;
	});
	if (idx < 0) return null;
	const g = groups[idx];
	const local = frame - Math.round(g.start * fps);
	const pop = spring({frame: local, fps, config: {damping: 14, stiffness: 300, mass: 0.6}});

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: 50,
					right: 50,
					top: 1250,
					height: 200,
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					alignContent: 'center',
					columnGap: 22,
					rowGap: 0,
					transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
					opacity: interpolate(pop, [0, 1], [0, 1]),
				}}
			>
				{g.words.map((w, i) => {
					const active = t >= w.start - 0.03 && t < w.end + 0.02;
					const spoken = t >= w.start;
					const wf = frame - Math.round(w.start * fps);
					const hit = spring({frame: wf, fps, config: {damping: 10, stiffness: 400, mass: 0.5}});
					const scale = active ? interpolate(hit, [0, 1], [1, 1.12]) : 1;
					return (
						<span
							key={i}
							style={{
								fontFamily: FONT,
								fontWeight: 900,
								fontSize: 78,
								lineHeight: 1.12,
								textTransform: 'uppercase',
								color: active ? C.yellow : spoken ? C.white : `${C.white}cc`,
								transform: `scale(${scale})`,
								display: 'inline-block',
								WebkitTextStroke: '12px #05050C',
								paintOrder: 'stroke fill',
								textShadow: active
									? `0 0 30px ${C.yellow}cc, 0 8px 0 rgba(0,0,0,0.7)`
									: '0 8px 0 rgba(0,0,0,0.7)',
							}}
						>
							{w.text.replace(/[,;:]$/, '')}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
