import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Bars, Counter, Curve, ProgressRing} from '../components/Charts';
import {GlassCard, LocationPin, Photo, PunchText, ServiceIcon, WhatsAppGlyph} from '../components/Elements';
import {Flash} from '../components/Transitions';
import {NUMBER_LINES, Plan} from '../script';
import {C, FONT, themedStroke, useTheme} from '../theme';
import {toFrames} from '../timeline';

type SceneProps = {plan: Plan; start: number};

/** Convertit un instant absolu (s) en frame locale à la scène. */
const local = (start: number) => (sec: number) => toFrames(sec - start);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 1 -> 0 juste avant `at` : sortie rapide d'un bloc de texte. */
const fadeOut = (frame: number, at: number, len = 6) => interpolate(frame, [at - len, at], [1, 0], clamp);

const Center: React.FC<{top: number; height?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
	top,
	height,
	children,
	style,
}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			right: 0,
			top,
			height,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			...style,
		}}
	>
		{children}
	</div>
);

/** Photo nette dans un cadre arrondi, avec zoom lent. */
const FramedPhoto: React.FC<{
	src: string;
	pos: string;
	width: number;
	height: number;
	from?: number;
	style?: React.CSSProperties;
}> = ({src, pos, width, height, from = 0, style}) => {
	const frame = useCurrentFrame();
	const T = useTheme();
	return (
		<div
			style={{
				width,
				height,
				borderRadius: 40,
				overflow: 'hidden',
				border: `6px solid ${T.mode === 'blue' ? C.white : '#0057FF'}`,
				boxShadow: T.mode === 'blue' ? '0 30px 70px rgba(0,20,80,0.45)' : '0 24px 60px rgba(0,60,160,0.25)',
				...style,
			}}
		>
			<Img
				src={staticFile(src)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: pos,
					transform: `scale(${1.06 + Math.max(0, frame - from) * 0.0022})`,
				}}
			/>
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* 1. ACCROCHE (fond bleu)                                              */
/* ------------------------------------------------------------------ */
export const HookScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const L = local(start);
	const stopOut = fadeOut(frame, L(plan.hook.stopEnd), 4);
	const fallPts: [number, number][] = [
		[0, 120],
		[160, 90],
		[300, 210],
		[420, 170],
		[560, 380],
		[700, 330],
		[860, 560],
		[1000, 640],
	];
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 40, top: 420, opacity: 0.85}}>
				<Curve points={fallPts} width={1000} height={760} delay={2} duration={L(plan.scenes[0].end) - 6} colors={['#FFB4BE', C.red]} strokeWidth={16} fill={false} arrow />
			</div>
			{stopOut > 0 && (
				<Center top={560} height={520} style={{opacity: stopOut, transform: `scale(${2 - stopOut})`}}>
					<PunchText size={250} color={C.yellow} from={4} shake={9} glowColor={C.yellow}>
						STOP !
					</PunchText>
				</Center>
			)}
			<Center top={500} height={600} style={{gap: 10}}>
				{plan.hook.lines.map((l, i) => (
					<PunchText key={i} size={l.size} color={l.color} delay={L(l.at)} shake={i === plan.hook.lines.length - 1 ? 3 : 0} style={{padding: '0 40px'}}>
						{l.text}
					</PunchText>
				))}
			</Center>
			<Flash duration={10} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 2. LE PROBLÈME (fond blanc)                                          */
/* ------------------------------------------------------------------ */
export const ProblemScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	const T = useTheme();
	const L = local(start);
	const labelAt = L(plan.problem.labelAt);
	const labelOut = fadeOut(frame, L(plan.problem.labelOutAt));
	const counterIn = spring({frame: frame - labelAt, fps, config: {damping: 12, stiffness: 200}});
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 110, top: 300}}>
				<Bars from={[0.55, 0.7, 0.82, 0.9, 1]} to={[0.5, 0.38, 0.27, 0.16, 0.08]} width={860} height={420} delay={2} changeAt={14} colorUp={T.accent} colorDown={C.red} />
			</div>
			<div style={{position: 'absolute', left: 90, top: 290}}>
				<Curve
					points={[
						[0, 40],
						[220, 120],
						[440, 200],
						[660, 320],
						[880, 400],
					]}
					width={900}
					height={420}
					delay={14}
					duration={Math.max(20, durationInFrames - 30)}
					colors={[C.red, C.red]}
					strokeWidth={10}
					fill={false}
					arrow
				/>
			</div>
			<Center top={760} height={330} style={{transform: `scale(${interpolate(counterIn, [0, 1], [0.4, 1])})`, opacity: counterIn}}>
				<Counter to={plan.problem.counterTo} prefix="-" delay={labelAt} duration={Math.max(12, L(plan.problem.counterUntil) - labelAt)} size={180} color={C.red} />
				<div style={{opacity: labelOut, fontFamily: FONT, fontWeight: 900, fontSize: 96, color: T.text, marginTop: 10, ...themedStroke(T, 10)}}>
					{plan.problem.label}
				</div>
			</Center>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 3. PRÉSENTATION (fond bleu)                                          */
/* ------------------------------------------------------------------ */
export const IntroScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const L = local(start);
	const enter = spring({frame, fps, config: {damping: 13, stiffness: 140}});
	const pinAt = L(plan.intro.pinAt);
	const roleAt = L(plan.intro.roleAt);
	const montageAt = L(plan.intro.montageAt);
	const levelAt = L(plan.intro.levelAt);
	const idOut = interpolate(frame, [montageAt - 2, montageAt + 6], [1, 0], clamp);
	return (
		<AbsoluteFill>
			{/* Identité : photo + nom + une seule ligne (rôle, puis lieu) */}
			{idOut > 0 && (
				<div style={{opacity: idOut, position: 'absolute', inset: 0, transform: `scale(${1 + (1 - idOut) * 0.15})`}}>
					<Center top={280} height={470}>
						<div style={{transform: `scale(${interpolate(enter, [0, 1], [0.2, 1])}) rotate(${interpolate(enter, [0, 1], [-25, 0])}deg)`}}>
							<Photo src="photo.png" size={400} objectPosition="50% 18%" zoom={1.05 + frame * 0.0008} />
						</div>
					</Center>
					<Center top={790} height={250}>
						<PunchText size={118} delay={L(plan.intro.nameAt)} from={1.8}>
							ABDOUL <span style={{color: C.yellow}}>NETWORK</span>
						</PunchText>
					</Center>
					{frame < pinAt && (
						<Center top={1075} height={140} style={{opacity: fadeOut(frame, pinAt, 5)}}>
							<PunchText size={80} delay={roleAt} from={1.4}>
								Expert IA &amp; Digital
							</PunchText>
						</Center>
					)}
					{frame >= pinAt && (
						<Center top={1070} height={160}>
							<div style={{display: 'flex', alignItems: 'center', gap: 24}}>
								<LocationPin size={92} delay={pinAt} />
								<PunchText size={84} delay={pinAt + 4} color={C.yellow} from={1.3}>
									MARADI, NIGER
								</PunchText>
							</div>
						</Center>
					)}
				</div>
			)}
			{/* « Je t'aide à passer au niveau supérieur » : photos de formation */}
			{frame >= montageAt - 2 && (
				<PhotoMontage
					delay={montageAt}
					images={[
						['formation-3.jpg', '50% 40%'],
						['formation-1.jpg', '58% 45%'],
						['formation-2.jpg', '42% 35%'],
					]}
				/>
			)}
			{frame >= levelAt && (
				<Center top={1070} height={160}>
					<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
						<LevelUp delay={levelAt} />
						<PunchText size={78} delay={levelAt} color={C.yellow} from={1.5}>
							NIVEAU SUPÉRIEUR
						</PunchText>
					</div>
				</Center>
			)}
		</AbsoluteFill>
	);
};

/** Photos de formation en grand cadre : fondu enchaîné + zoom lent. */
const PhotoMontage: React.FC<{delay: number; images: [string, string][]}> = ({delay, images}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const f = frame - delay;
	const span = Math.max(20, (durationInFrames - delay) / images.length);
	const enter = spring({frame: f, fps, config: {damping: 14, stiffness: 150}});
	return (
		<div
			style={{
				position: 'absolute',
				left: 50,
				top: 280,
				width: 980,
				height: 740,
				borderRadius: 44,
				overflow: 'hidden',
				border: `8px solid ${C.white}`,
				boxShadow: `0 0 0 5px ${C.yellow}, 0 30px 80px rgba(0,20,80,0.5)`,
				transform: `translateY(${interpolate(enter, [0, 1], [500, 0])}px) rotate(${interpolate(enter, [0, 1], [8, 0])}deg)`,
			}}
		>
			{images.map(([src, pos], i) => {
				const lf = f - i * span;
				if (lf < 0 && i > 0) return null;
				const o = i === 0 ? 1 : interpolate(lf, [0, 6], [0, 1], clamp);
				return (
					<Img
						key={src}
						src={staticFile(src)}
						style={{
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							objectPosition: pos,
							opacity: o,
							transform: `scale(${1.08 + Math.max(0, lf) * 0.0025})`,
						}}
					/>
				);
			})}
		</div>
	);
};

/** Trois chevrons qui montent en cascade (« niveau supérieur »). */
const LevelUp: React.FC<{delay: number}> = ({delay}) => {
	const frame = useCurrentFrame();
	const f = frame - delay;
	return (
		<svg width={70} height={110} viewBox="0 0 70 110" style={{overflow: 'visible'}}>
			{[0, 1, 2].map((k) => {
				const p = (((f / 18 + k / 3) % 1) + 1) % 1;
				return (
					<polyline
						key={k}
						points="8,40 35,14 62,40"
						transform={`translate(0 ${70 - p * 70})`}
						fill="none"
						stroke={k === 0 ? C.yellow : C.white}
						strokeWidth={11}
						strokeLinecap="round"
						strokeLinejoin="round"
						opacity={Math.sin(p * Math.PI)}
					/>
				);
			})}
		</svg>
	);
};

/* ------------------------------------------------------------------ */
/* 4. SERVICES (fond blanc)                                             */
/* ------------------------------------------------------------------ */
export const ServicesScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const T = useTheme();
	const L = local(start);
	const items = plan.services.map((s) => ({...s, f: Math.max(0, L(s.at))}));
	let active = 0;
	items.forEach((s, i) => {
		if (frame >= s.f) active = i;
	});
	const TILE = 132;
	const GAP = 22;
	const rowW = items.length * TILE + (items.length - 1) * GAP;
	return (
		<AbsoluteFill>
			{/* Rangée d'icônes : les services déjà cités deviennent des tuiles */}
			<div style={{position: 'absolute', top: 290, left: (1080 - rowW) / 2, width: rowW, height: TILE}}>
				{items.map((s, i) => {
					const on = frame >= s.f + 6 && i <= active;
					const pop = spring({frame: frame - s.f - 6, fps, config: {damping: 12, stiffness: 220}});
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: i * (TILE + GAP),
								width: TILE,
								height: TILE,
								borderRadius: 28,
								border: `3px solid ${on ? s.accent : T.muted}`,
								background: on ? `${s.accent}14` : T.card,
								boxShadow: i === active ? `0 10px 30px ${s.accent}55` : 'none',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: `scale(${on ? interpolate(pop, [0, 1], [0.6, 1]) : 0.9})`,
							}}
						>
							{on && <ServiceIcon kind={s.icon} size={84} color={s.accent} />}
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 290 + TILE + 30, left: (1080 - rowW) / 2, width: rowW, height: 10, borderRadius: 5, background: T.muted}}>
				<div
					style={{
						width: `${interpolate(frame, items.map((s) => s.f).concat(items[items.length - 1].f + 20), items.map((_, i) => (i / items.length) * 100).concat(100), clamp)}%`,
						height: '100%',
						borderRadius: 5,
						background: 'linear-gradient(90deg, #0057FF, #00A6E0)',
					}}
				/>
			</div>
			{/* Carte active : une seule à la fois */}
			{items.map((s, i) => {
				if (i !== active && i !== active - 1) return null;
				const inP = spring({frame: frame - s.f, fps, config: {damping: 14, stiffness: 190, mass: 0.8}});
				const next = items[i + 1];
				const outP = next ? interpolate(frame, [next.f, next.f + 8], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)}) : 0;
				if (outP >= 1) return null;
				const x = interpolate(inP, [0, 1], [1100, 0]) + interpolate(outP, [0, 1], [0, -1200]);
				const rot = interpolate(inP, [0, 1], [12, 0]) + interpolate(outP, [0, 1], [0, -10]);
				const floatY = Math.sin((frame - s.f) / 10) * 8;
				const photo = 'photo' in s ? (s as {photo: string; photoPos: string}) : null;
				return (
					<div key={i} style={{position: 'absolute', left: 70, top: 500, transform: `translateX(${x}px) translateY(${floatY}px) rotate(${rot}deg)`}}>
						<GlassCard width={940} height={photo ? 700 : 600} accent={s.accent}>
							{photo ? (
								<div style={{position: 'absolute', top: 28, left: 28, right: 28, height: 440, borderRadius: 30, overflow: 'hidden'}}>
									<Img
										src={staticFile(photo.photo)}
										style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: photo.photoPos, transform: `scale(${1.1 + (frame - s.f) * 0.002})`}}
									/>
								</div>
							) : (
								<div style={{position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
									<ProgressRing size={250} progress={interpolate(frame - s.f, [0, 18], [0, 1], clamp)} color={s.accent} stroke={12}>
										<ServiceIcon kind={s.icon} size={150} color={s.accent} />
									</ProgressRing>
								</div>
							)}
							<div
								style={{
									position: 'absolute',
									left: 40,
									right: 40,
									top: photo ? 470 : 330,
									bottom: 20,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									textAlign: 'center',
									fontFamily: FONT,
									fontWeight: 900,
									fontSize: s.label.length > 18 ? 84 : 96,
									lineHeight: 1.05,
									color: T.text,
									textTransform: 'uppercase',
								}}
							>
								{s.label}
							</div>
						</GlassCard>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 5. RÉSULTATS (fond blanc)                                            */
/* ------------------------------------------------------------------ */
export const ResultsScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const T = useTheme();
	const L = local(start);
	const items = plan.results.items.map((r) => ({...r, f: Math.max(0, L(r.at))}));
	let active = -1;
	items.forEach((r, i) => {
		if (frame >= r.f) active = i;
	});
	const r = active >= 0 ? items[active] : null;
	const firstAt = items[0].f;
	const titleOut = fadeOut(frame, firstAt, 5);
	const pop = r ? spring({frame: frame - r.f, fps, config: {damping: 11, stiffness: 260, mass: 0.6}}) : 0;
	const frameIn = spring({frame: frame - firstAt, fps, config: {damping: 14, stiffness: 160}});
	return (
		<AbsoluteFill>
			{/* « Le résultat ? » seul à l'écran, puis place aux preuves */}
			{titleOut > 0 && (
				<Center top={560} height={500} style={{opacity: titleOut}}>
					<PunchText size={130} delay={L(plan.results.titleAt)} from={1.8}>
						LE <span style={{color: T.accent}}>RÉSULTAT</span> ?
					</PunchText>
				</Center>
			)}
			{r && (
				<>
					{/* Photo de formation + courbe de croissance par-dessus */}
					<div style={{position: 'absolute', left: 60, top: 280, width: 960, height: 600, transform: `scale(${interpolate(frameIn, [0, 1], [0.7, 1])})`, opacity: frameIn}}>
						{items.map((it, i) =>
							i <= active ? (
								<FramedPhoto
									key={i}
									src={it.photo}
									pos={it.photoPos}
									width={960}
									height={600}
									from={it.f}
									style={{position: 'absolute', top: 0, left: 0, opacity: interpolate(frame - it.f, [0, 5], [0, 1], clamp)}}
								/>
							) : null,
						)}
						<div style={{position: 'absolute', inset: 6, borderRadius: 34, background: 'linear-gradient(180deg, transparent 35%, rgba(0,30,90,0.7))'}} />
						<div style={{position: 'absolute', left: 50, top: 170}}>
							<Curve
								points={[
									[0, 380],
									[140, 350],
									[270, 365],
									[400, 270],
									[530, 240],
									[660, 120],
									[820, 10],
								]}
								width={860}
								height={400}
								delay={firstAt}
								duration={Math.max(30, durationInFrames - firstAt - 20)}
								colors={['#3DFF8A', C.yellow]}
								strokeWidth={14}
								fill={false}
								arrow
							/>
						</div>
					</div>
					<Center top={920} height={300} style={{transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})`, opacity: pop}}>
						<Counter key={active} to={r.value} prefix={r.prefix} suffix={r.suffix} delay={r.f} duration={16} size={160} color={T.accent} />
						<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: T.text}}>{r.label}</div>
					</Center>
				</>
			)}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 6. APPEL À L'ACTION (fond bleu)                                      */
/* ------------------------------------------------------------------ */
export const NumberBlock: React.FC<{delay?: number; size?: number}> = ({delay = 0, size = 128}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const T = useTheme();
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			{NUMBER_LINES.map((line, i) => {
				const p = spring({frame: frame - delay - i * 4, fps, config: {damping: 12, stiffness: 240}});
				return (
					<div
						key={i}
						style={{
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: size,
							lineHeight: 1.04,
							color: C.yellow,
							letterSpacing: -2,
							whiteSpace: 'nowrap',
							transform: `scale(${interpolate(p, [0, 1], [0.3, 1])})`,
							opacity: p,
							WebkitTextStroke: `12px ${T.stroke}`,
							paintOrder: 'stroke fill',
							textShadow: T.shadow,
						}}
					>
						{line}
					</div>
				);
			})}
		</div>
	);
};

const DownArrow: React.FC<{phase?: number}> = ({phase = 0}) => {
	const frame = useCurrentFrame();
	const y = Math.abs(Math.sin(frame / 6 + phase)) * 22;
	return (
		<svg width={80} height={110} viewBox="0 0 90 110" style={{transform: `translateY(${y}px)`}}>
			<polyline points="15,25 45,55 75,25" fill="none" stroke={C.yellow} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
			<polyline points="15,55 45,85 75,55" fill="none" stroke={C.white} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
		</svg>
	);
};

export const CtaScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const L = local(start);
	const titleAt = L(plan.cta.titleAt);
	const numberAt = L(plan.cta.numberAt);
	const buttonAt = L(plan.cta.buttonAt);
	const shrink = spring({frame: frame - titleAt, fps, config: {damping: 15, stiffness: 170}});
	const photoSize = interpolate(shrink, [0, 1], [540, 250]);
	const photoTop = interpolate(shrink, [0, 1], [300, 275]);
	const hookOut = fadeOut(frame, titleAt, 5);
	const pulse = 1 + Math.max(0, Math.sin((frame - buttonAt) / 5)) * 0.08;
	const btnIn = spring({frame: frame - buttonAt + 4, fps, config: {damping: 10, stiffness: 220}});
	return (
		<AbsoluteFill>
			<Center top={photoTop} height={photoSize}>
				<Photo src="photo-studio.jpg" size={photoSize} objectPosition="50% 30%" zoom={1.05} />
			</Center>
			{hookOut > 0 && (
				<Center top={930} height={300} style={{opacity: hookOut}}>
					<PunchText size={112} delay={0} from={2}>
						NE RESTE PAS
					</PunchText>
					<PunchText size={112} delay={L(plan.cta.hookAt + 0.55)} color={C.yellow} from={2}>
						EN ARRIÈRE
					</PunchText>
				</Center>
			)}
			{frame >= titleAt && (
				<Center top={555} height={240}>
					<PunchText size={110} delay={titleAt} from={2}>
						ÉCRIS-MOI
					</PunchText>
					<PunchText size={110} delay={numberAt} color={C.yellow} from={2}>
						MAINTENANT
					</PunchText>
				</Center>
			)}
			{frame >= numberAt && (
				<Center top={805} height={275}>
					<NumberBlock delay={numberAt + 2} size={125} />
				</Center>
			)}
			{/* Bouton WhatsApp : pictogramme seul, pas de texte en plus */}
			{frame >= buttonAt - 4 && (
				<Center top={1100} height={190}>
					<div style={{display: 'flex', alignItems: 'center', gap: 40}}>
						<DownArrow />
						<div
							style={{
								width: 170,
								height: 170,
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: `linear-gradient(180deg, #3BE57A, ${C.green} 60%, #1DA851)`,
								transform: `scale(${btnIn * pulse})`,
								boxShadow: `0 0 0 ${8 + (pulse - 1) * 220}px ${C.green}44, 0 14px 0 #127A3A`,
							}}
						>
							<WhatsAppGlyph size={110} />
						</div>
						<DownArrow phase={1.5} />
					</div>
				</Center>
			)}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 7. FIN (fond bleu)                                                   */
/* ------------------------------------------------------------------ */
export const EndScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const T = useTheme();
	const L = local(start);
	const f = frame - L(plan.end.logoAt);
	// Avant le logo, la phrase finale s'affiche seule (sous-titres karaoké).
	if (f < 0) return null;
	const sweep = interpolate(f % 45, [4, 30], [-40, 140], clamp);
	const logoIn = spring({frame: f, fps, config: {damping: 12, stiffness: 200}});
	const logoText: React.CSSProperties = {fontFamily: FONT, fontWeight: 900, fontSize: 150, lineHeight: 0.98, textAlign: 'center'};
	return (
		<AbsoluteFill>
			<Center top={430} height={420}>
				<div style={{position: 'relative', transform: `scale(${interpolate(logoIn, [0, 1], [1.8, 1]) * (1 + f * 0.0006)})`, opacity: logoIn}}>
					<div style={{...logoText, color: C.white, ...themedStroke(T, 12)}}>
						ABDOUL
						<br />
						<span style={{color: C.yellow}}>NETWORK</span>
					</div>
					{/* Balayage lumineux limité aux lettres */}
					<div
						style={{
							...logoText,
							position: 'absolute',
							inset: 0,
							color: 'transparent',
							backgroundImage: `linear-gradient(110deg, transparent ${sweep - 10}%, rgba(255,255,255,0.95) ${sweep}%, transparent ${sweep + 10}%)`,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
						}}
					>
						ABDOUL
						<br />
						NETWORK
					</div>
				</div>
			</Center>
			<div style={{position: 'absolute', left: 140, right: 140, top: 880, height: 6, borderRadius: 3, background: C.white, opacity: 0.6, transform: `scaleX(${logoIn})`}} />
			<Center top={920} height={290}>
				<NumberBlock delay={6} size={130} />
			</Center>
		</AbsoluteFill>
	);
};
