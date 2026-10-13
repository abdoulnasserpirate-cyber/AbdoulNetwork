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
import {
	GlassCard,
	LocationPin,
	Photo,
	PunchText,
	ServiceIcon,
	WhatsAppGlyph,
} from '../components/Elements';
import {Flash} from '../components/Transitions';
import {NUMBER_LINES, Plan} from '../script';
import {C, FONT, textStroke} from '../theme';
import {toFrames} from '../timeline';

type SceneProps = {plan: Plan; start: number};

/** Convertit un instant absolu (s) en frame locale à la scène. */
const local = (start: number) => (sec: number) => toFrames(sec - start);

const useOut = (frames = 6) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

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

/* ------------------------------------------------------------------ */
/* 1. ACCROCHE                                                          */
/* ------------------------------------------------------------------ */
export const HookScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const L = local(start);
	const stopEnd = L(plan.hook.stopEnd);
	const stopOut = interpolate(frame, [stopEnd - 4, stopEnd], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	// Courbe rouge qui chute en fond
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
			<div style={{position: 'absolute', left: 40, top: 420, opacity: 0.75}}>
				<Curve
					points={fallPts}
					width={1000}
					height={760}
					delay={2}
					duration={L(plan.scenes[0].end) - 6}
					colors={['#FF8A00', C.red]}
					strokeWidth={16}
					arrow
				/>
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
/* 2. LE PROBLÈME                                                       */
/* ------------------------------------------------------------------ */
export const ProblemScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	const L = local(start);
	const labelAt = L(plan.problem.labelAt);
	const kwAt = L(plan.problem.keyword.at);
	const alarm = 0.5 + 0.5 * Math.sin(frame / 3);
	const counterIn = spring({frame: frame - labelAt, fps, config: {damping: 12, stiffness: 200}});
	return (
		<AbsoluteFill>
			{/* Liseré d'alerte */}
			<AbsoluteFill style={{boxShadow: `inset 0 0 160px ${C.red}${Math.round(alarm * 120).toString(16).padStart(2, '0')}`}} />
			<div style={{position: 'absolute', left: 110, top: 300}}>
				<Bars
					from={[0.55, 0.7, 0.82, 0.9, 1]}
					to={[0.5, 0.38, 0.27, 0.16, 0.08]}
					width={860}
					height={420}
					delay={2}
					changeAt={14}
				/>
			</div>
			<div style={{position: 'absolute', left: 90, top: 290, opacity: 0.9}}>
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
			<Center top={720} height={340} style={{transform: `scale(${interpolate(counterIn, [0, 1], [0.4, 1])})`, opacity: counterIn}}>
				<Counter to={plan.problem.counterTo} prefix="-" delay={labelAt} duration={Math.max(12, L(plan.problem.counterUntil) - labelAt)} size={180} color={C.red} />
				<div
					style={{
						fontFamily: FONT,
						fontWeight: 900,
						fontSize: 96,
						color: C.white,
						marginTop: 10,
						...textStroke(10),
					}}
				>
					{plan.problem.label}
				</div>
			</Center>
			{frame >= kwAt && (
				<Center top={1085} height={160}>
					<div
						style={{
							padding: '10px 36px',
							background: C.red,
							borderRadius: 18,
							transform: `rotate(-3deg) scale(${spring({frame: frame - kwAt, fps, config: {damping: 9, stiffness: 300}})})`,
							boxShadow: `0 0 60px ${C.red}`,
						}}
					>
						<span style={{fontFamily: FONT, fontWeight: 900, fontSize: 88, color: C.white, textTransform: 'uppercase'}}>
							{plan.problem.keyword.text}
						</span>
					</div>
				</Center>
			)}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 3. PRÉSENTATION                                                      */
/* ------------------------------------------------------------------ */
export const IntroScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const L = local(start);
	const enter = spring({frame, fps, config: {damping: 13, stiffness: 140}});
	const pinAt = L(plan.intro.pinAt);
	const roleAt = L(plan.intro.roleAt);
	const roleOut = interpolate(frame, [pinAt - 5, pinAt], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const levelAt = L(plan.intro.levelAt);
	const pinOut = interpolate(frame, [levelAt - 5, levelAt], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill>
			<Center top={280} height={470}>
				<div style={{transform: `scale(${interpolate(enter, [0, 1], [0.2, 1])}) rotate(${interpolate(enter, [0, 1], [-25, 0])}deg)`}}>
					<Photo src="photo.png" size={400} objectPosition="50% 18%" zoom={1.05 + frame * 0.0008} />
				</div>
			</Center>
			<Center top={790} height={250}>
				<PunchText size={118} delay={L(plan.intro.nameAt)} color={C.white} from={1.8}>
					ABDOUL <span style={{color: C.yellow}}>NETWORK</span>
				</PunchText>
			</Center>
			{roleOut > 0 && (
				<Center top={1075} height={140} style={{opacity: roleOut}}>
					<PunchText size={80} delay={roleAt} color={C.cyan} from={1.4}>
						Expert IA &amp; Digital
					</PunchText>
				</Center>
			)}
			{frame >= pinAt && pinOut > 0 && (
				<Center top={1070} height={160} style={{opacity: pinOut, transform: `translateY(${(1 - pinOut) * -40}px)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 24}}>
						<LocationPin size={92} delay={pinAt} />
						<PunchText size={84} delay={pinAt + 4} color={C.yellow} from={1.3}>
							MARADI, NIGER
						</PunchText>
					</div>
				</Center>
			)}
			{frame >= levelAt && (
				<Center top={1070} height={160}>
					<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
						<LevelUp delay={levelAt} />
						<PunchText size={76} delay={levelAt} color={C.yellow} from={1.5} glowColor={C.yellow}>
							NIVEAU SUPÉRIEUR
						</PunchText>
					</div>
				</Center>
			)}
		</AbsoluteFill>
	);
};

/** Trois chevrons qui montent en cascade (« niveau supérieur »). */
const LevelUp: React.FC<{delay: number}> = ({delay}) => {
	const frame = useCurrentFrame();
	const f = frame - delay;
	return (
		<svg width={70} height={110} viewBox="0 0 70 110" style={{overflow: 'visible', filter: `drop-shadow(0 0 12px ${C.cyan})`}}>
			{[0, 1, 2].map((k) => {
				const p = ((f / 18 + k / 3) % 1 + 1) % 1;
				return (
					<polyline
						key={k}
						points="8,40 35,14 62,40"
						transform={`translate(0 ${70 - p * 70})`}
						fill="none"
						stroke={k === 0 ? C.yellow : C.cyan}
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
/* 4. SERVICES                                                          */
/* ------------------------------------------------------------------ */
export const ServicesScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
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
			{/* Photo de formation en fond, très atténuée, pour la première carte */}
			<AbsoluteFill
				style={{
					opacity: interpolate(frame, [0, 8, items[1].f - 6, items[1].f], [0, 0.28, 0.28, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<Img
					src={staticFile('formation-2.jpg')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: '40% 50%',
						transform: `scale(${1.1 + frame * 0.002})`,
						filter: 'grayscale(0.4) contrast(1.1)',
					}}
				/>
				<AbsoluteFill style={{background: `linear-gradient(${C.bg}dd, ${C.bg2}aa, ${C.bg}ee)`}} />
			</AbsoluteFill>

			{/* Rangée d'icônes : les services déjà cités deviennent des tuiles */}
			<div style={{position: 'absolute', top: 290, left: (1080 - rowW) / 2, width: rowW, height: TILE}}>
				{items.map((s, i) => {
					const on = frame >= s.f + 6 && i < active + 1;
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
								border: `3px solid ${on ? s.accent : C.white + '30'}`,
								background: on ? `${s.accent}22` : `${C.white}08`,
								boxShadow: i === active ? `0 0 40px ${s.accent}` : 'none',
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
			{/* Barre de progression */}
			<div style={{position: 'absolute', top: 290 + TILE + 30, left: (1080 - rowW) / 2, width: rowW, height: 10, borderRadius: 5, background: `${C.white}18`}}>
				<div
					style={{
						width: `${interpolate(frame, items.map((s) => s.f).concat(items[items.length - 1].f + 20), items.map((_, i) => (i / items.length) * 100).concat(100), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}%`,
						height: '100%',
						borderRadius: 5,
						background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.yellow})`,
						boxShadow: `0 0 20px ${C.cyan}`,
					}}
				/>
			</div>
			{/* Carte active (une seule à la fois : max 5 mots à l'écran) */}
			{items.map((s, i) => {
				if (i !== active && i !== active - 1) return null;
				const inP = spring({frame: frame - s.f, fps, config: {damping: 14, stiffness: 190, mass: 0.8}});
				const next = items[i + 1];
				const outP = next
					? interpolate(frame, [next.f, next.f + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)})
					: 0;
				if (outP >= 1) return null;
				const x = interpolate(inP, [0, 1], [1100, 0]) + interpolate(outP, [0, 1], [0, -1200]);
				const rot = interpolate(inP, [0, 1], [12, 0]) + interpolate(outP, [0, 1], [0, -10]);
				const floatY = Math.sin((frame - s.f) / 10) * 8;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 70,
							top: 520,
							transform: `translateX(${x}px) translateY(${floatY}px) rotate(${rot}deg)`,
						}}
					>
						<GlassCard width={940} height={600} accent={s.accent}>
							<div style={{position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
								<ProgressRing size={250} progress={interpolate(frame - s.f, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} color={s.accent} stroke={12}>
									<ServiceIcon kind={s.icon} size={150} color={s.accent} />
								</ProgressRing>
							</div>
							<div
								style={{
									position: 'absolute',
									left: 40,
									right: 40,
									top: 330,
									bottom: 30,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									textAlign: 'center',
									fontFamily: FONT,
									fontWeight: 900,
									fontSize: s.label.length > 18 ? 84 : 96,
									lineHeight: 1.05,
									color: C.white,
									textTransform: 'uppercase',
									...textStroke(8),
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
/* 5. RÉSULTATS                                                         */
/* ------------------------------------------------------------------ */
export const ResultsScene: React.FC<SceneProps> = ({plan, start}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const L = local(start);
	const items = plan.results.items.map((r) => ({...r, f: Math.max(0, L(r.at))}));
	let active = -1;
	items.forEach((r, i) => {
		if (frame >= r.f) active = i;
	});
	const r = active >= 0 ? items[active] : null;
	const pop = r ? spring({frame: frame - r.f, fps, config: {damping: 11, stiffness: 260, mass: 0.6}}) : 0;
	return (
		<AbsoluteFill>
			<Center top={270} height={150}>
				<PunchText size={112} delay={L(plan.results.titleAt)} color={C.white} from={1.8}>
					LE <span style={{color: C.yellow}}>RÉSULTAT</span> ?
				</PunchText>
			</Center>
			<div style={{position: 'absolute', left: 60, top: 440}}>
				<Curve
					points={[
						[0, 440],
						[150, 410],
						[290, 425],
						[430, 330],
						[570, 290],
						[710, 160],
						[880, 20],
					]}
					width={960}
					height={460}
					delay={4}
					duration={Math.max(30, durationInFrames - 30)}
					colors={[C.growth, C.yellow]}
					strokeWidth={16}
					arrow
				/>
			</div>
			{/* Pastilles de progression : une par résultat */}
			<div style={{position: 'absolute', top: 930, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22}}>
				{items.map((it, i) => (
					<div
						key={i}
						style={{
							width: i === active ? 70 : 22,
							height: 22,
							borderRadius: 11,
							background: i <= active ? C.yellow : `${C.white}30`,
							boxShadow: i === active ? `0 0 20px ${C.yellow}` : 'none',
						}}
					/>
				))}
			</div>
			{r && (
				<Center top={975} height={290} style={{transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})`, opacity: pop}}>
					<Counter key={active} to={r.value} prefix={r.prefix} suffix={r.suffix} delay={r.f} duration={16} size={160} color={C.yellow} />
					<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: C.white, ...textStroke(10)}}>{r.label}</div>
				</Center>
			)}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 6. APPEL À L'ACTION                                                  */
/* ------------------------------------------------------------------ */
export const NumberBlock: React.FC<{delay?: number; size?: number}> = ({delay = 0, size = 128}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
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
							WebkitTextStroke: '12px #05050C',
							paintOrder: 'stroke fill',
							textShadow: `0 0 50px ${C.yellow}aa, 0 10px 0 rgba(0,0,0,0.6)`,
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
		<svg width={80} height={110} viewBox="0 0 90 110" style={{transform: `translateY(${y}px)`, filter: `drop-shadow(0 0 14px ${C.yellow})`}}>
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
	// Phase A : « Ne reste pas en arrière » ; phase B : écris-moi + numéro
	const shrink = spring({frame: frame - titleAt, fps, config: {damping: 15, stiffness: 170}});
	const photoSize = interpolate(shrink, [0, 1], [540, 250]);
	const photoTop = interpolate(shrink, [0, 1], [300, 275]);
	const hookOut = interpolate(frame, [titleAt - 5, titleAt], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pulse = 1 + Math.max(0, Math.sin((frame - buttonAt) / 5)) * 0.06;
	const btnIn = spring({frame: frame - buttonAt + 4, fps, config: {damping: 10, stiffness: 220}});
	return (
		<AbsoluteFill>
			<Center top={photoTop} height={photoSize}>
				<Photo src="photo-studio.jpg" size={photoSize} objectPosition="50% 30%" zoom={1.05} />
			</Center>
			{hookOut > 0 && (
				<Center top={930} height={300} style={{opacity: hookOut}}>
					<PunchText size={112} delay={0} color={C.white} from={2}>
						NE RESTE PAS
					</PunchText>
					<PunchText size={112} delay={L(plan.cta.hookAt + 0.55)} color={C.yellow} from={2} glowColor={C.yellow}>
						EN ARRIÈRE
					</PunchText>
				</Center>
			)}
			{frame >= titleAt && (
				<Center top={555} height={240}>
					<PunchText size={110} delay={titleAt} color={C.white} from={2}>
						ÉCRIS-MOI
					</PunchText>
					<PunchText size={110} delay={numberAt} color={C.yellow} from={2} glowColor={C.yellow}>
						MAINTENANT
					</PunchText>
				</Center>
			)}
			{frame >= numberAt && (
				<Center top={805} height={275}>
					<NumberBlock delay={numberAt + 2} size={125} />
				</Center>
			)}
			{frame >= buttonAt - 4 && (
				<Center top={1095} height={170}>
					<div style={{display: 'flex', alignItems: 'center', gap: 20}}>
						<DownArrow />
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 20,
								padding: '20px 44px',
								borderRadius: 120,
								background: `linear-gradient(180deg, #3BE57A, ${C.green} 60%, #1DA851)`,
								transform: `scale(${btnIn * pulse})`,
								boxShadow: `0 0 0 ${6 + (pulse - 1) * 220}px ${C.green}33, 0 0 70px ${C.green}, 0 14px 0 #127A3A`,
							}}
						>
							<WhatsAppGlyph size={96} />
							<span style={{fontFamily: FONT, fontWeight: 900, fontSize: 76, color: C.white, textShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>WHATSAPP</span>
						</div>
						<DownArrow phase={1.5} />
					</div>
				</Center>
			)}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* 7. FIN                                                               */
/* ------------------------------------------------------------------ */
export const EndScene: React.FC<SceneProps> = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sweep = interpolate(frame % 45, [4, 30], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const logoIn = spring({frame, fps, config: {damping: 12, stiffness: 200}});
	return (
		<AbsoluteFill>
			<Center top={430} height={420}>
				<div style={{position: 'relative', transform: `scale(${interpolate(logoIn, [0, 1], [1.8, 1]) * (1 + frame * 0.0006)})`, opacity: logoIn}}>
					<div
						style={{
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: 150,
							lineHeight: 0.98,
							textAlign: 'center',
							color: C.white,
							...textStroke(12),
							textShadow: `0 0 60px ${C.violet}, 0 0 120px ${C.cyan}88`,
						}}
					>
						ABDOUL
						<br />
						<span style={{color: C.yellow}}>NETWORK</span>
					</div>
					{/* Balayage lumineux */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: `linear-gradient(110deg, transparent ${sweep - 12}%, rgba(255,255,255,0.85) ${sweep}%, transparent ${sweep + 12}%)`,
							mixBlendMode: 'overlay',
						}}
					/>
				</div>
			</Center>
			<div style={{position: 'absolute', left: 140, right: 140, top: 880, height: 6, borderRadius: 3, background: `linear-gradient(90deg, transparent, ${C.cyan}, ${C.violet}, transparent)`, transform: `scaleX(${logoIn})`}} />
			<Center top={920} height={290}>
				<NumberBlock delay={6} size={130} />
			</Center>
			<Flash duration={8} strength={0.8} />
		</AbsoluteFill>
	);
};
