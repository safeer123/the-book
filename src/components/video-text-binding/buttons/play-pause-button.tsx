import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import styled, { keyframes } from 'styled-components';
import { IconBtnLarge } from './icon-btn';

const pulse = keyframes`
	0% {
		box-shadow: 0 0 0 0 rgba(84, 170, 235, 0.45);
	}
	70% {
		box-shadow: 0 0 0 14px rgba(84, 170, 235, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(84, 170, 235, 0);
	}
`;

const PlayPauseRing = styled.div<{ $playing?: boolean }>`
	display: inline-flex;
	border-radius: 50%;
	animation: ${({ $playing }) => ($playing ? pulse : 'none')} 1.8s ease-out
		infinite;
`;

const PlayIcon = (
	<svg
		className="btn-icon"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M18.5 10.5C19.5 11.1 19.5 12.9 18.5 13.5L8.5 19.5C7.5 20.1 6 19.4 6 18.1L6 5.9C6 4.6 7.5 3.9 8.5 4.5L18.5 10.5Z"
			fill="currentColor"
		/>
	</svg>
);

const PauseIcon = (
	<svg
		className="btn-icon"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect x="5" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
		<rect x="14" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
	</svg>
);

export const PlayPause = ({
	state,
	onClick,
}: {
	state?: PlayerStates;
	onClick: () => void;
}) => {
	const isPlaying = state === PlayerStates.PLAYING;
	return (
		<PlayPauseRing $playing={isPlaying}>
			<IconBtnLarge type="text" onClick={onClick}>
				{isPlaying && PauseIcon}
				{!isPlaying && PlayIcon}
			</IconBtnLarge>
		</PlayPauseRing>
	);
};
