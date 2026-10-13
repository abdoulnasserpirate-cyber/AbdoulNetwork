import {evolvePath, getLength} from '@remotion/paths';
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, themedStroke, useTheme} from '../theme';

/** Construit un chemin lissé (Catmull-Rom -> Bézier) à partir de points. */
const smoothPath = (pts: [number, number][]) => {
	let d = `M ${pts[0][0]} ${pts[0][1]}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] ?? pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] ?? p2;
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
	}
	return d;
};

/**
 * Courbe tracée progressivement (stroke-dashoffset via evolvePath),
 * avec aire dégradée, point lumineux en tête et flèche optionnelle.
 */
export const Curve: React.FC<{
	points: [number, number][];
	width: number;
	height: number;
	delay?: number;
	duration?: number;
	colors: [string, string];
	strokeWidth?: number;
	arrow?: boolean;
	fill?: boolean;
	style?: React.CSSProperties;
}> = ({
	points,
	width,
	height,
	delay = 0,
	duration = 30,
	colors,
	strokeWidth = 14,
	arrow = false,
	fill = true,
	style,
}) => {
	const frame = useCurrentFrame();
	const id = React.useId().replace(/:/g, '');
	const d = smoothPath(points);
	const progress = interpolate(frame - delay, [0, duration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.65, 0, 0.25, 1),
	});
	const {strokeDasharray, strokeDashoffset} = evolvePath(progress, d);
	const len = getLength(d);
	// Position de la tête : on échantillonne la courbe en approximant par les points.
	const idx = progress * (points.length - 1);
	const i0 = Math.floor(idx);
	const i1 = Math.min(points.length - 1, i0 + 1);
	const f = idx - i0;
	const hx = points[i0][0] + (points[i1][0] - points[i0][0]) * f;
	const hy = points[i0][1] + (points[i1][1] - points[i0][1]) * f;
	const angle =
		(Math.atan2(points[i1][1] - points[i0][1], points[i1][0] - points[i0][0]) * 180) /
		Math.PI;
	const areaD = `${d} L ${points[points.length - 1][0]} ${height} L ${points[0][0]} ${height} Z`;
	const last = points[points.length - 1];
	const clipW = interpolate(progress, [0, 1], [points[0][0], last[0]]);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', ...style}}>
			<defs>
				<linearGradient id={`s${id}`} x1="0" x2="1" y1="0" y2="0">
					<stop offset="0%" stopColor={colors[0]} />
					<stop offset="100%" stopColor={colors[1]} />
				</linearGradient>
				<linearGradient id={`a${id}`} x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor={colors[1]} stopOpacity={0.45} />
					<stop offset="100%" stopColor={colors[0]} stopOpacity={0} />
				</linearGradient>
				<clipPath id={`c${id}`}>
					<rect x={-50} y={-200} width={clipW + 50} height={height + 400} />
				</clipPath>
				<filter id={`g${id}`} x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="10" />
				</filter>
			</defs>
			{fill && <path d={areaD} fill={`url(#a${id})`} clipPath={`url(#c${id})`} />}
			<path
				d={d}
				fill="none"
				stroke={`url(#s${id})`}
				strokeWidth={strokeWidth * 2.2}
				strokeLinecap="round"
				strokeDasharray={strokeDasharray}
				strokeDashoffset={strokeDashoffset}
				filter={`url(#g${id})`}
				opacity={0.8}
			/>
			<path
				d={d}
				fill="none"
				stroke={`url(#s${id})`}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={strokeDasharray}
				strokeDashoffset={strokeDashoffset}
			/>
			{progress > 0 && len > 0 && (
				<g transform={`translate(${hx} ${hy})`}>
					{arrow ? (
						<g transform={`rotate(${angle})`}>
							<polygon
								points="-10,-34 52,0 -10,34"
								fill={colors[1]}
								filter={`url(#g${id})`}
							/>
							<polygon points="-10,-30 46,0 -10,30" fill={colors[1]} />
						</g>
					) : (
						<>
							<circle r={strokeWidth * 2} fill={colors[1]} filter={`url(#g${id})`} />
							<circle r={strokeWidth * 0.9} fill={C.white} />
						</>
					)}
				</g>
			)}
		</svg>
	);
};

/** Graphique en barres : les barres montent puis (optionnellement) chutent. */
export const Bars: React.FC<{
	from: number[];
	to?: number[];
	width: number;
	height: number;
	delay?: number;
	changeAt?: number;
	colorUp?: string;
	colorDown?: string;
}> = ({
	from,
	to,
	width,
	height,
	delay = 0,
	changeAt = 25,
	colorUp = C.cyan,
	colorDown = C.red,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const T = useTheme();
	const n = from.length;
	const gap = 26;
	const bw = (width - gap * (n - 1)) / n;
	return (
		<div style={{position: 'relative', width, height}}>
			{/* lignes de repère */}
			{[0.25, 0.5, 0.75, 1].map((p) => (
				<div
					key={p}
					style={{
						position: 'absolute',
						left: -20,
						right: -20,
						bottom: p * height,
						height: 2,
						background: T.muted,
					}}
				/>
			))}
			{from.map((v, i) => {
				const grow = spring({
					frame: frame - delay - i * 3,
					fps,
					config: {damping: 13, stiffness: 160},
				});
				const fall = to
					? spring({
							frame: frame - delay - changeAt - i * 4,
							fps,
							config: {damping: 11, stiffness: 120},
						})
					: 0;
				const val = to ? v + (to[i] - v) * fall : v;
				const h = Math.max(0, val * height * grow);
				const col = to && fall > 0.3 ? colorDown : colorUp;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							bottom: 0,
							left: i * (bw + gap),
							width: bw,
							height: h,
							borderRadius: '14px 14px 4px 4px',
							background: `linear-gradient(to top, ${col}33, ${col})`,
							boxShadow: `0 10px 30px ${col}55`,
						}}
					/>
				);
			})}
		</div>
	);
};

/** Compteur chiffré qui défile (easing nerveux en fin de course). */
export const Counter: React.FC<{
	from?: number;
	to: number;
	delay?: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
	size?: number;
	color?: string;
	style?: React.CSSProperties;
}> = ({
	from = 0,
	to,
	delay = 0,
	duration = 30,
	prefix = '',
	suffix = '',
	size = 160,
	color = C.yellow,
	style,
}) => {
	const frame = useCurrentFrame();
	const T = useTheme();
	const v = interpolate(frame - delay, [0, duration], [from, to], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.exp),
	});
	const shown = Math.round(v).toLocaleString('fr-FR').replace(/ | /g, ' ');
	return (
		<div
			style={{
				fontFamily: FONT,
				fontWeight: 900,
				fontSize: size,
				color,
				lineHeight: 1,
				fontVariantNumeric: 'tabular-nums',
				...themedStroke(T, 9),
				...style,
			}}
		>
			{prefix}
			{shown}
			{suffix}
		</div>
	);
};

/** Cercle de progression. */
export const ProgressRing: React.FC<{
	size: number;
	progress: number;
	color?: string;
	stroke?: number;
	children?: React.ReactNode;
}> = ({size, progress, color = C.cyan, stroke = 18, children}) => {
	const T = useTheme();
	const r = (size - stroke) / 2;
	const circ = 2 * Math.PI * r;
	return (
		<div style={{position: 'relative', width: size, height: size}}>
			<svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
				<circle cx={size / 2} cy={size / 2} r={r} stroke={T.muted} strokeWidth={stroke} fill="none" />
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					stroke={color}
					strokeWidth={stroke}
					fill="none"
					strokeLinecap="round"
					strokeDasharray={circ}
					strokeDashoffset={circ * (1 - Math.max(0, Math.min(1, progress)))}
					style={{filter: `drop-shadow(0 0 12px ${color})`}}
				/>
			</svg>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{children}
			</div>
		</div>
	);
};
