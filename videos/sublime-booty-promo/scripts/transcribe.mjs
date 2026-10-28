// Transcrit public/audio/voix.mp3 mot par mot (Whisper medium, fr) -> src/captions.json
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const root = process.cwd();
const to = path.join(root, "whisper.cpp");
const wav = path.join(root, "scripts", "voix16k.wav");

execSync(`ffmpeg -v error -y -i public/audio/voix.mp3 -ar 16000 -ac 1 ${wav}`);

await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ model: "medium", folder: to });

const whisperCppOutput = await transcribe({
  model: "medium",
  whisperPath: to,
  whisperCppVersion: "1.5.5",
  inputPath: wav,
  language: "fr",
  tokenLevelTimestamps: true,
  splitOnWord: true,
});

const { captions } = toCaptions({ whisperCppOutput });
fs.writeFileSync(
  path.join(root, "src", "captions.json"),
  JSON.stringify(captions, null, 2),
);
console.log(captions.map((c) => `${(c.startMs / 1000).toFixed(2)} ${c.text}`).join("\n"));
