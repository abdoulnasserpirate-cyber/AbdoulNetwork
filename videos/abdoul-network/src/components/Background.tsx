import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useTheme} from '../theme';

/** Fond uni (bleu ou blanc selon la scène). Le mouvement vient des éléments. */
export const Background: React.FC = () => {
	const T = useTheme();
	return <AbsoluteFill style={{backgroundColor: T.bg}} />;
};
