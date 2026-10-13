import {C} from './theme';
import {cue} from './timeline';

/**
 * Découpage de la vidéo calé sur la voix off (transcription Whisper medium).
 * Chaque instant est ancré sur un mot prononcé via cue(mot, repli, après) ;
 * le repli (en secondes) n'est utilisé que si le mot est introuvable.
 *
 * Voix off :
 *  0.3  « Stop ! »
 *  1.3  « Ton business perd des clients chaque jour parce que tu n'utilises
 *         pas encore l'intelligence artificielle. »
 *  6.3  « Moi, c'est Abdoul Network, expert en IA et en digital, basé à
 *         Maradi. Je t'aide à passer au niveau supérieur. »
 * 13.5  « Formation en intelligence artificielle, montage vidéo avec l'IA,
 *         affiche professionnelle, marketing digital, création de sites web
 *         et d'applications, et automatisation WhatsApp pour ton business. »
 * 25.2  « Le résultat ? Plus de visibilité. Plus de clients. Plus de ventes
 *         et surtout du temps gagné. »
 * 31.3  « Ne reste pas en arrière pendant que les autres avancent.
 *         Écris-moi maintenant sur WhatsApp. »
 * 36.2  « L'IA au service de ton succès. »
 */

export const NUMBER_LINES = ['+227', '96 66 99 98'];

export type SceneId = 'hook' | 'problem' | 'intro' | 'services' | 'results' | 'cta' | 'end';

export const buildPlan = (audioDuration: number) => {
	const ton = cue('ton', 1.33);
	const perd = cue('perd', 1.89, ton);
	const clients = cue('clients', 2.25, perd);
	const moi = cue('moi', 6.26, 5);
	const formation = cue('formation', 13.48, 11);
	const resultat = cue('resultat', 25.32, 24) - 0.13; // « Le résultat »
	const neReste = cue('ne', 31.33, 30.5);
	const lia = cue('lia', 36.15, 35.5);

	const scenes: {id: SceneId; start: number; end: number; transition: 'zoom' | 'whip' | 'glitch' | 'wipe' | 'none'}[] = [
		{id: 'hook', start: 0, end: clients, transition: 'none'},
		{id: 'problem', start: clients, end: moi, transition: 'glitch'},
		{id: 'intro', start: moi, end: formation, transition: 'zoom'},
		{id: 'services', start: formation, end: resultat, transition: 'whip'},
		{id: 'results', start: resultat, end: neReste, transition: 'wipe'},
		{id: 'cta', start: neReste, end: lia, transition: 'zoom'},
		{id: 'end', start: lia, end: audioDuration + 1, transition: 'glitch'},
	];

	return {
		scenes,
		hook: {
			stopEnd: ton - 0.05,
			lines: [
				{text: 'TON BUSINESS', at: ton, color: C.white, size: 130},
				{text: 'PERD DES CLIENTS', at: perd, color: C.red, size: 118},
			],
		},
		problem: {
			label: 'CLIENTS PERDUS',
			labelAt: clients,
			counterTo: 365, // « chaque jour » : un an de clients perdus
			counterUntil: cue('jour', 2.92, clients) + 0.3,
			keyword: {text: "PAS ENCORE L'IA", at: cue('pas', 4.1, 3.5)},
		},
		intro: {
			nameAt: cue('abdoul', 6.82, moi),
			roleAt: cue('expert', 7.87, moi),
			pinAt: cue('maradi', 10.36, moi),
			levelAt: cue('niveau', 11.95, moi),
		},
		services: [
			{label: 'Formations IA', icon: 'ia', at: formation, accent: C.cyan},
			{label: 'Montage vidéo IA', icon: 'video', at: cue('montage', 15.63, formation), accent: C.violet},
			{label: 'Affiches pro', icon: 'poster', at: cue('affiche', 17.68, formation), accent: C.yellow},
			{label: 'Marketing digital', icon: 'marketing', at: cue('marketing', 19.22, formation), accent: C.cyan},
			{label: 'Sites & applications', icon: 'web', at: cue('creation', 20.28, formation), accent: C.violet},
			{label: 'Automatisation WhatsApp', icon: 'whatsapp', at: cue('automatisation', 22.89, formation), accent: C.green},
		],
		results: {
			titleAt: resultat,
			items: [
				{value: 300, prefix: '+', suffix: '%', label: 'VISIBILITÉ', at: cue('plus', 26.31, resultat)},
				{value: 150, prefix: '+', suffix: '%', label: 'CLIENTS', at: cue('plus', 27.68, 27.2)},
				{value: 200, prefix: '+', suffix: '%', label: 'VENTES', at: cue('plus', 28.84, 28.4)},
				{value: 10, prefix: '+', suffix: 'H', label: 'TEMPS GAGNÉ', at: cue('temps', 30.38, 29.5)},
			],
		},
		cta: {
			hookAt: neReste,
			titleAt: cue('ecrismoi', 34.04, neReste),
			numberAt: cue('maintenant', 34.51, neReste),
			buttonAt: cue('whatsapp', 35.28, neReste),
		},
		end: {
			start: lia,
		},
	};
};

export type Plan = ReturnType<typeof buildPlan>;
