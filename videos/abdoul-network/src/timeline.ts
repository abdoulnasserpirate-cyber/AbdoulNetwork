import captionsJson from './data/captions.json';
import {FPS} from './theme';

// Format produit par toCaptions() de @remotion/install-whisper-cpp
type Caption = {
	text: string;
	startMs: number;
	endMs: number;
	timestampMs: number | null;
	confidence: number | null;
};

export type Word = {
	text: string; // mot tel que prononcé (avec ponctuation)
	norm: string; // minuscules, sans accents ni ponctuation
	start: number; // secondes
	end: number; // secondes
};

const normalize = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9+]/g, '');

export const WORDS: Word[] = (captionsJson as Caption[])
	.map((c) => ({
		text: c.text.trim(),
		norm: normalize(c.text),
		start: c.startMs / 1000,
		end: c.endMs / 1000,
	}))
	.filter((w) => w.text.length > 0);

export const toFrames = (sec: number) => Math.round(sec * FPS);

/**
 * Instant (en secondes) où le mot correspondant à `pattern` est prononcé,
 * en cherchant à partir de `after`. Si le mot est introuvable (transcription
 * absente ou formulation différente), on retombe sur `fallback`.
 */
export const cue = (
	pattern: RegExp | string,
	fallback: number,
	after = 0,
): number => {
	const re =
		typeof pattern === 'string' ? new RegExp(`^${normalize(pattern)}`) : pattern;
	const w = WORDS.find((x) => x.start >= after - 0.05 && re.test(x.norm));
	return w ? w.start : fallback;
};

/** Fin de la voix : dernier mot transcrit, ou fin du fichier audio. */
export const voiceEnd = (audioDuration: number) =>
	WORDS.length ? Math.min(WORDS[WORDS.length - 1].end, audioDuration) : audioDuration;

/** Vrai si un mot est en cours de prononciation à l'instant `sec`. */
export const isSpeaking = (sec: number) =>
	WORDS.some((w) => sec >= w.start - 0.15 && sec <= w.end + 0.25);

export type CaptionGroup = {words: Word[]; start: number; end: number};

/** Groupes karaoké de 2 à 4 mots, coupés sur la ponctuation et les pauses. */
export const groupWords = (words: Word[]): CaptionGroup[] => {
	const groups: CaptionGroup[] = [];
	let cur: Word[] = [];
	const flush = () => {
		if (!cur.length) return;
		groups.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
		cur = [];
	};
	words.forEach((w, i) => {
		const next = words[i + 1];
		cur.push(w);
		const punct = /[.,!?;:…]$/.test(w.text);
		const pause = next ? next.start - w.end > 0.28 : true;
		const chars = cur.reduce((n, x) => n + x.text.length + 1, 0);
		if (cur.length >= 4 || chars > 22 || ((punct || pause) && cur.length >= 2)) {
			flush();
		} else if ((punct || pause) && cur.length === 1 && groups.length) {
			// Un mot isolé après une pause : on le garde seul plutôt que de
			// l'accoler au groupe suivant, ce qui décalerait l'affichage.
			flush();
		}
	});
	flush();
	return groups;
};
