import {getAudioDurationInSeconds} from '@remotion/media-utils';
import React from 'react';
import {Composition, staticFile} from 'remotion';
import {AbdoulNetworkVideo, VideoProps} from './Video';
import {FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="AbdoulNetwork"
		component={AbdoulNetworkVideo}
		width={WIDTH}
		height={HEIGHT}
		fps={FPS}
		durationInFrames={FPS * 40}
		defaultProps={{audioDuration: 38.2, hasMusic: false} as VideoProps}
		calculateMetadata={async ({props}) => {
			// Durée = durée exacte de voix.mp3 + 1 s de fin
			const audioDuration = await getAudioDurationInSeconds(staticFile('voix.mp3'));
			const hasMusic = await fetch(staticFile('musique.mp3'), {method: 'HEAD'})
				.then((r) => r.ok)
				.catch(() => false);
			return {
				durationInFrames: Math.ceil((audioDuration + 1) * FPS),
				props: {...props, audioDuration, hasMusic},
			};
		}}
	/>
);
