import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Composition';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Walkthrough"
				component={Main}
				durationInFrames={150 * 5} // 25 seconds at 30fps
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
