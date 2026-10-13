import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, textStroke} from '../theme';

/**
 * Photo dans un masque circulaire avec halo violet/cyan et anneaux
 * lumineux qui tournent autour.
 */
export const Photo: React.FC<{
	src: string;
	size: number;
	objectPosition?: string;
	zoom?: number;
	rings?: boolean;
}> = ({src, size, objectPosition = '50% 25%', zoom = 1, rings = true}) => {
	const frame = useCurrentFrame();
	const rot = frame * 1.6;
	const pulse = 1 + Math.sin(frame / 8) * 0.03;
	return (
		<div style={{position: 'relative', width: size, height: size}}>
			{/* Halo */}
			<div
				style={{
					position: 'absolute',
					inset: -size * 0.28,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${C.violet}cc 0%, ${C.cyan}55 40%, transparent 68%)`,
					transform: `scale(${pulse})`,
					filter: 'blur(10px)',
				}}
			/>
			{rings && (
				<svg
					width={size * 1.36}
					height={size * 1.36}
					style={{position: 'absolute', left: -size * 0.18, top: -size * 0.18, overflow: 'visible'}}
				>
					<defs>
						<linearGradient id="ringA" x1="0" x2="1">
							<stop offset="0" stopColor={C.cyan} />
							<stop offset="1" stopColor={C.violet} />
						</linearGradient>
					</defs>
					<g transform={`rotate(${rot} ${size * 0.68} ${size * 0.68})`}>
						<circle
							cx={size * 0.68}
							cy={size * 0.68}
							r={size * 0.62}
							fill="none"
							stroke="url(#ringA)"
							strokeWidth={8}
							strokeDasharray={`${size * 1.1} ${size * 0.5}`}
							strokeLinecap="round"
							style={{filter: `drop-shadow(0 0 14px ${C.cyan})`}}
						/>
					</g>
					<g transform={`rotate(${-rot * 1.4} ${size * 0.68} ${size * 0.68})`}>
						<circle
							cx={size * 0.68}
							cy={size * 0.68}
							r={size * 0.67}
							fill="none"
							stroke={C.yellow}
							strokeWidth={5}
							strokeDasharray={`18 26`}
							opacity={0.85}
						/>
					</g>
					<g transform={`rotate(${rot * 2.2} ${size * 0.68} ${size * 0.68})`}>
						<circle cx={size * 0.68} cy={size * 0.68 - size * 0.62} r={12} fill={C.white} style={{filter: `drop-shadow(0 0 16px ${C.cyan})`}} />
						<circle cx={size * 0.68} cy={size * 0.68 + size * 0.62} r={9} fill={C.yellow} style={{filter: `drop-shadow(0 0 16px ${C.yellow})`}} />
					</g>
				</svg>
			)}
			{/* Photo masquée */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: '50%',
					overflow: 'hidden',
					border: `8px solid ${C.white}`,
					boxShadow: `0 0 0 6px ${C.violet}, 0 0 60px ${C.violet}, 0 0 120px ${C.cyan}66`,
					background: C.bg2,
				}}
			>
				<Img
					src={staticFile(src)}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition,
						transform: `scale(${zoom})`,
						transformOrigin: objectPosition,
					}}
				/>
			</div>
		</div>
	);
};

/** Pin de localisation animé avec ondes radar. */
export const LocationPin: React.FC<{size?: number; delay?: number}> = ({size = 120, delay = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const drop = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 180}});
	const y = interpolate(drop, [0, 1], [-260, 0]);
	const bob = Math.sin((frame - delay) / 6) * 6;
	return (
		<div style={{position: 'relative', width: size, height: size * 1.3}}>
			{[0, 1, 2].map((k) => {
				const p = (((frame - delay) / 40 + k / 3) % 1 + 1) % 1;
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: size / 2 - size * 0.6 * (0.3 + p),
							top: size * 1.22 - size * 0.18 * (0.3 + p),
							width: size * 1.2 * (0.3 + p),
							height: size * 0.36 * (0.3 + p),
							borderRadius: '50%',
							border: `4px solid ${C.cyan}`,
							opacity: (1 - p) * drop,
						}}
					/>
				);
			})}
			<svg
				width={size}
				height={size * 1.3}
				viewBox="0 0 100 130"
				style={{position: 'absolute', transform: `translateY(${y + bob}px)`, overflow: 'visible'}}
			>
				<defs>
					<linearGradient id="pinG" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor={C.yellow} />
						<stop offset="1" stopColor="#FF9F0A" />
					</linearGradient>
				</defs>
				<path
					d="M50 125 C 50 125 8 72 8 46 A 42 42 0 1 1 92 46 C 92 72 50 125 50 125 Z"
					fill="url(#pinG)"
					stroke={C.bg}
					strokeWidth={5}
					style={{filter: `drop-shadow(0 0 18px ${C.yellow})`}}
				/>
				<circle cx={50} cy={46} r={17} fill={C.bg} />
			</svg>
		</div>
	);
};

/** Carte en verre dépoli (glassmorphism). */
export const GlassCard: React.FC<{
	width: number;
	height: number;
	accent?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({width, height, accent = C.cyan, children, style}) => (
	<div
		style={{
			width,
			height,
			borderRadius: 48,
			background: `linear-gradient(135deg, ${C.white}26, ${C.white}08 60%, ${accent}1a)`,
			border: `3px solid ${C.white}40`,
			boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 60px ${accent}44, inset 0 2px 0 ${C.white}55`,
			backdropFilter: 'blur(22px)',
			WebkitBackdropFilter: 'blur(22px)',
			position: 'relative',
			overflow: 'hidden',
			...style,
		}}
	>
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: 0,
				height: 6,
				background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
			}}
		/>
		{children}
	</div>
);

/** Texte géant avec entrée « zoom punch » (spring nerveux). */
export const PunchText: React.FC<{
	children: React.ReactNode;
	size: number;
	color?: string;
	delay?: number;
	from?: number;
	shake?: number;
	glowColor?: string;
	style?: React.CSSProperties;
}> = ({children, size, color = C.white, delay = 0, from = 2.6, shake = 0, glowColor, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const f = frame - delay;
	const s = spring({frame: f, fps, config: {damping: 12, stiffness: 260, mass: 0.7}});
	const scale = interpolate(s, [0, 1], [from, 1]);
	const opacity = interpolate(f, [0, 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const sx = shake ? (Math.sin(f * 2.7) + Math.sin(f * 4.1)) * shake : 0;
	const sy = shake ? (Math.cos(f * 3.3) + Math.sin(f * 1.9)) * shake : 0;
	const blur = interpolate(s, [0, 0.6, 1], [14, 2, 0]);
	if (f < 0) return null;
	return (
		<div
			style={{
				fontFamily: FONT,
				fontWeight: 900,
				fontSize: size,
				lineHeight: 1.02,
				color,
				textAlign: 'center',
				textTransform: 'uppercase',
				letterSpacing: -1,
				transform: `translate(${sx}px, ${sy}px) scale(${scale})`,
				opacity,
				filter: `blur(${blur}px)`,
				...textStroke(Math.max(8, size / 14)),
				...(glowColor
					? {textShadow: `0 0 40px ${glowColor}, 0 0 90px ${glowColor}88, 0 12px 0 rgba(0,0,0,0.6)`}
					: {}),
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** Icônes géométriques (aucune illustration dessinée). */
export const ServiceIcon: React.FC<{kind: string; size: number; color: string}> = ({kind, size, color}) => {
	const frame = useCurrentFrame();
	const sw = 7;
	const common = {fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	const spin = frame * 2;
	let body: React.ReactNode = null;
	switch (kind) {
		case 'ia':
			// Puce IA : carré + broches + noyau
			body = (
				<>
					<rect x={30} y={30} width={60} height={60} rx={10} {...common} />
					<rect x={47} y={47} width={26} height={26} rx={4} fill={color} />
					{[40, 60, 80].map((p) => (
						<g key={p}>
							<line x1={p} y1={12} x2={p} y2={30} {...common} />
							<line x1={p} y1={90} x2={p} y2={108} {...common} />
							<line x1={12} y1={p} x2={30} y2={p} {...common} />
							<line x1={90} y1={p} x2={108} y2={p} {...common} />
						</g>
					))}
				</>
			);
			break;
		case 'video':
			body = (
				<>
					<rect x={14} y={28} width={92} height={64} rx={14} {...common} />
					<polygon points="50,44 50,76 78,60" fill={color} />
					<circle cx={60} cy={60} r={48} {...common} strokeDasharray="8 14" transform={`rotate(${spin} 60 60)`} opacity={0.5} />
				</>
			);
			break;
		case 'poster':
			body = (
				<>
					<rect x={26} y={12} width={68} height={96} rx={8} {...common} />
					<polygon points="38,80 54,56 66,70 74,62 84,80" fill={color} />
					<circle cx={72} cy={36} r={9} fill={color} />
				</>
			);
			break;
		case 'marketing':
			body = (
				<>
					<polyline points="14,96 42,64 62,78 104,30" {...common} />
					<polyline points="80,30 104,30 104,54" {...common} />
					<line x1={14} y1={108} x2={106} y2={108} {...common} opacity={0.5} />
				</>
			);
			break;
		case 'web':
			body = (
				<>
					<rect x={10} y={18} width={100} height={72} rx={10} {...common} />
					<line x1={10} y1={36} x2={110} y2={36} {...common} />
					<polyline points="44,52 32,64 44,76" {...common} />
					<polyline points="76,52 88,64 76,76" {...common} />
					<rect x={44} y={96} width={32} height={12} rx={4} fill={color} />
				</>
			);
			break;
		case 'whatsapp':
		default:
			// Bulle + engrenage : automatisation de messages
			body = (
				<>
					<path d="M 20 24 H 100 A 8 8 0 0 1 108 32 V 76 A 8 8 0 0 1 100 84 H 44 L 24 102 V 84 H 20 A 8 8 0 0 1 12 76 V 32 A 8 8 0 0 1 20 24 Z" {...common} />
					<g transform={`rotate(${spin} 60 54)`}>
						<circle cx={60} cy={54} r={13} {...common} />
						{[0, 60, 120, 180, 240, 300].map((a) => (
							<line
								key={a}
								x1={60 + Math.cos((a * Math.PI) / 180) * 18}
								y1={54 + Math.sin((a * Math.PI) / 180) * 18}
								x2={60 + Math.cos((a * Math.PI) / 180) * 25}
								y2={54 + Math.sin((a * Math.PI) / 180) * 25}
								{...common}
							/>
						))}
					</g>
				</>
			);
	}
	return (
		<svg width={size} height={size} viewBox="0 0 120 120" style={{filter: `drop-shadow(0 0 14px ${color})`, overflow: 'visible'}}>
			{body}
		</svg>
	);
};

/** Pictogramme WhatsApp géométrique (bulle + combiné). */
export const WhatsAppGlyph: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<path
			d="M50 8 A42 42 0 1 1 22 82 L 10 92 L 16 74 A42 42 0 0 1 50 8 Z"
			fill="none"
			stroke={C.white}
			strokeWidth={8}
			strokeLinejoin="round"
		/>
		<path
			d="M36 30 C 32 30 29 35 30 40 C 33 54 46 67 60 70 C 65 71 70 68 70 64 L 70 60 L 60 55 L 55 60 C 49 58 42 51 40 45 L 45 40 L 40 30 Z"
			fill={C.white}
		/>
	</svg>
);
