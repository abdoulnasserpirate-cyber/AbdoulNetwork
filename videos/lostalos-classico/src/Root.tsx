import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import {Classico} from './Classico';
import {DURATION, FPS} from './timing';

const fontHandle = delayRender('fonts');
Promise.all([
  document.fonts.load('100px Anton'),
  document.fonts.load('800 100px Montserrat'),
  document.fonts.load('700 100px Montserrat'),
  document.fonts.load('600 100px Montserrat'),
]).then(() => continueRender(fontHandle));

export const Root: React.FC = () => (
  <Composition id="Classico" component={Classico} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1080} />
);
