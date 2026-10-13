import {C} from './theme';
import {cue} from './timeline';

/**
 * Découpage de la vidéo calé sur la voix off.
 * Chaque instant est ancré sur un mot de la transcription (cue) ;
 * la valeur numérique est le repli utilisé si le mot n'est pas trouvé
 * (elle correspond aux pauses détectées dans voix.mp3).
 */

export const NUMBER_LINES = ['+227', '96 66 99 98'];

export type SceneId = 'hook' | 'problem' | 'intro' | 'services' | 'results' | 'cta' | 'end';

export const buildPlan = (audioDuration: number) => {
	const t = {
		problem: cue(/^(mais|pourtant|aujourdhui|beaucoup|le probleme|tes|vos)$/, 6.28, 5),
		intro: cue(/^(moi|je|abdoul)$/, 13.42, 11),
		services: cue(/^(formations?|je propose|services?)$/, 19.24, 17),
		results: cue(/^(resultats?|plus|davantage)$/, 28.85, 27),
		cta: cue(/^(ecris|ecrismoi|contacte|appelle|whatsapp)/, 31.35, 29),
		end: audioDuration - 1.2,
	};

	const scenes: {id: SceneId; start: number; end: number; transition: 'zoom' | 'whip' | 'glitch' | 'wipe' | 'none'}[] = [
		{id: 'hook', start: 0, end: t.problem, transition: 'none'},
		{id: 'problem', start: t.problem, end: t.intro, transition: 'glitch'},
		{id: 'intro', start: t.intro, end: t.services, transition: 'zoom'},
		{id: 'services', start: t.services, end: t.results, transition: 'whip'},
		{id: 'results', start: t.results, end: t.cta, transition: 'wipe'},
		{id: 'cta', start: t.cta, end: t.end, transition: 'zoom'},
		{id: 'end', start: t.end, end: audioDuration + 1, transition: 'glitch'},
	];

	return {
		scenes,
		hook: {
			stopEnd: cue(/.*/, 1.35, 0.7),
			lines: [
				{text: 'TON BUSINESS', at: 1.35, color: C.white},
				{text: 'STAGNE ?', at: 3.2, color: C.yellow},
			],
		},
		problem: {
			label: 'CLIENTS PERDUS',
			labelAt: t.problem + 0.4,
			counterTo: 248,
			keyword: {text: 'SANS DIGITAL', at: 9.22},
		},
		intro: {
			nameAt: t.intro + 0.3,
			roleAt: 15.65,
			pinAt: 17.7,
		},
		services: [
			{label: 'Formations IA', icon: 'ia', at: t.services, accent: C.cyan},
			{label: 'Montage vidéo IA', icon: 'video', at: 20.6, accent: C.violet},
			{label: 'Affiches pro', icon: 'poster', at: 22.78, accent: C.yellow},
			{label: 'Marketing digital', icon: 'marketing', at: 24.3, accent: C.cyan},
			{label: 'Sites & applications', icon: 'web', at: 26.33, accent: C.violet},
			{label: 'Automatisation WhatsApp', icon: 'whatsapp', at: 27.7, accent: C.green},
		],
		results: [
			{value: 150, prefix: '+', suffix: '%', label: 'DE CLIENTS', at: t.results},
			{value: 10, prefix: '+', suffix: 'H', label: 'DE TEMPS', at: t.results + 0.8},
			{value: 200, prefix: '+', suffix: '%', label: 'DE VENTES', at: t.results + 1.6},
		],
		cta: {
			titleAt: t.cta,
			numberAt: Math.min(t.cta + 1.6, t.end - 1),
		},
	};
};

export type Plan = ReturnType<typeof buildPlan>;
