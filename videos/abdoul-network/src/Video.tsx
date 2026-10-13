import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Background} from './components/Background';
import {Subtitles} from './components/Subtitles';
import {SceneShell} from './components/Transitions';
import {CtaScene, EndScene, HookScene, IntroScene, ProblemScene, ResultsScene, ServicesScene} from './scenes/Scenes';
import {buildPlan, SceneId} from './script';
import {C} from './theme';
import {groupWords, isSpeaking, toFrames, WORDS} from './timeline';

export type VideoProps = {audioDuration: number; hasMusic: boolean};

const SCENES: Record<SceneId, React.FC<{plan: ReturnType<typeof buildPlan>; start: number}>> = {
	hook: HookScene,
	problem: ProblemScene,
	intro: IntroScene,
	services: ServicesScene,
	results: ResultsScene,
	cta: CtaScene,
	end: EndScene,
};

const TINT: Record<SceneId, string> = {
	hook: C.red,
	problem: C.red,
	intro: C.violet,
	services: C.cyan,
	results: C.growth,
	cta: C.violet,
	end: C.violet,
};

const Sfx: React.FC<{at: number; src: string; volume: number}> = ({at, src, volume}) => (
	<Sequence from={Math.max(0, toFrames(at))} durationInFrames={45} layout="none">
		<Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
	</Sequence>
);

export const AbdoulNetworkVideo: React.FC<VideoProps> = ({audioDuration, hasMusic}) => {
	const {fps} = useVideoConfig();
	const plan = React.useMemo(() => buildPlan(audioDuration), [audioDuration]);
	const groups = React.useMemo(() => groupWords(WORDS), []);
	const cta = plan.scenes.find((s) => s.id === 'cta')!;
	// Ducking : 15 % en l'absence de voix, 8 % quand elle parle, avec une
	// rampe de ~0,2 s pour éviter les sauts de volume audibles.
	const duck = React.useMemo(() => {
		const n = Math.ceil((audioDuration + 1) * fps) + 1;
		const raw = Array.from({length: n}, (_, f) => (isSpeaking(f / fps) ? 0.08 : 0.15));
		const R = 3;
		return raw.map((_, i) => {
			const w = raw.slice(Math.max(0, i - R), i + R + 1);
			return w.reduce((a, v) => a + v, 0) / w.length;
		});
	}, [audioDuration, fps]);

	return (
		<AbsoluteFill style={{backgroundColor: C.bg}}>
			{plan.scenes.map((s) => {
				const Scene = SCENES[s.id];
				const from = toFrames(s.start);
				const dur = Math.max(1, toFrames(s.end) - from);
				return (
					<Sequence key={s.id} from={from} durationInFrames={dur} name={s.id}>
						<SceneShell type={s.transition}>
							<Background tint={TINT[s.id]} />
							<Scene plan={plan} start={s.start} />
						</SceneShell>
					</Sequence>
				);
			})}

			{/* Sous-titres karaoké */}
			<Subtitles groups={groups} />

			{/* Voix off */}
			<Audio src={staticFile('voix.mp3')} />

			{/* Musique : 15 %, abaissée à 8 % pendant que la voix parle */}
			{hasMusic && (
				<Audio
					src={staticFile('musique.mp3')}
					loop
					volume={(f) => duck[Math.min(duck.length - 1, Math.max(0, Math.round(f)))]}
				/>
			)}

			{/* Sound design discret */}
			<Sfx at={0} src="impact" volume={0.55} />
			{plan.scenes.slice(1).map((s) => (
				<Sfx key={s.id} at={s.start - 0.12} src={s.transition === 'glitch' ? 'glitch' : 'whoosh'} volume={0.22} />
			))}
			{plan.services.map((s, i) => (
				<Sfx key={i} at={s.at} src="click" volume={0.22} />
			))}
			<Sfx at={cta.start - 1} src="riser" volume={0.14} />
			<Sfx at={plan.cta.numberAt} src="impact" volume={0.25} />
			<Sfx at={plan.cta.buttonAt} src="click" volume={0.3} />
			{plan.results.items.map((r, i) => (
				<Sfx key={`r${i}`} at={r.at} src="click" volume={0.2} />
			))}
		</AbsoluteFill>
	);
};
