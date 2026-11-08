import {Config} from '@remotion/cli/config';

// Chromium pré-installé (le téléchargement de Remotion peut être bloqué, cf. 0.7)
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
// WebGL logiciel (pas de GPU dans le conteneur)
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(4);
