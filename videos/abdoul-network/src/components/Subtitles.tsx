import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, Theme} from '../theme';
import {CaptionGroup} from '../timeline';

export type SubtitleWindow = {from: number; to: number; top: number; size: number; theme: Theme};

/**
 * Sous-titres karaoké (groupes de 2 à 4 mots, le mot prononcé en jaune).
 * Ils ne s'affichent que dans les fenêtres données : partout ailleurs, un
 * grand titre dit déjà la même chose, on évite donc le texte en double.
 */
export const Subtitles: React.FC<{groups: CaptionGroup[]; windows: SubtitleWindow[]}> = ({groups, windows}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	const win = windows.find((w) => t >= w.from && t < w.to);
	if (!win) return null;
	const T = win.theme;

	const idx = groups.findIndex((g, i) => {
		const next = groups[i + 1];
		const until = next ? Math.min(next.start, g.end + 0.6) : g.end + 0.6;
		return t >= Math.max(g.start - 0.05, win.from) && t < until;
	});
	if (idx < 0) return null;
	const g = groups[idx];
	const local = frame - Math.round(Math.max(g.start, win.from) * fps);
	const pop = spring({frame: local, fps, config: {damping: 14, stiffness: 300, mass: 0.6}});

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: 50,
					right: 50,
					top: win.top,
					height: win.size * 2.6,
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					alignContent: 'center',
					columnGap: 30,
					transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
					opacity: interpolate(pop, [0, 1], [0, 1]),
				}}
			>
				{g.words.map((w, i) => {
					const active = t >= w.start - 0.03 && t < w.end + 0.02;
					const wf = frame - Math.round(w.start * fps);
					const hit = spring({frame: wf, fps, config: {damping: 10, stiffness: 400, mass: 0.5}});
					const scale = active ? interpolate(hit, [0, 1], [1, 1.07]) : 1;
					return (
						<span
							key={i}
							style={{
								fontFamily: FONT,
								fontWeight: 900,
								fontSize: win.size,
								lineHeight: 1.15,
								textTransform: 'uppercase',
								display: 'inline-block',
								transform: `scale(${scale})`,
								color: active ? C.yellow : T.text,
								// Le jaune garde un contour marine pour rester lisible, même sur blanc.
								WebkitTextStroke: active || T.mode === 'blue' ? `10px ${T.mode === 'blue' ? T.stroke : '#0A1A3F'}` : undefined,
								paintOrder: 'stroke fill',
								textShadow: T.shadow,
							}}
						>
							{w.text.replace(/[,;:.]$/, '')}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
