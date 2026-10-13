// Transcribe public/voix.mp3 with Whisper.cpp (model "medium", French) and
// write word-level timestamps to src/data/captions.json.
//
// Needs network access to github.com (whisper.cpp sources) and
// huggingface.co (model weights) on first run.
// Run: npm run transcribe
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
	downloadWhisperModel,
	installWhisperCpp,
	toCaptions,
	transcribe,
} from '@remotion/install-whisper-cpp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const whisperPath = path.join(root, '.whisper');
const whisperCppVersion = '1.5.5';
const model = 'medium';

await installWhisperCpp({to: whisperPath, version: whisperCppVersion});
await downloadWhisperModel({model, folder: whisperPath});

// Whisper.cpp only accepts 16 kHz mono WAV.
const wav = path.join(whisperPath, 'voix-16k.wav');
execSync(
	`ffmpeg -y -loglevel error -i "${path.join(root, 'public', 'voix.mp3')}" -ar 16000 -ac 1 "${wav}"`,
);

const whisperCppOutput = await transcribe({
	inputPath: wav,
	whisperPath,
	whisperCppVersion,
	model,
	language: 'fr',
	tokenLevelTimestamps: true,
	splitOnWord: true,
});

const {captions} = toCaptions({whisperCppOutput});
const out = path.join(root, 'src', 'data', 'captions.json');
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, JSON.stringify(captions, null, 2));
console.log(`${captions.length} words -> ${out}`);
console.log(captions.map((c) => c.text).join(''));
