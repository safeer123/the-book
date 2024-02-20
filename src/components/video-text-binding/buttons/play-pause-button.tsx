import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { IconBtnLarge } from './icon-btn';

const PlayIcon = (
	<svg
		className="btn-icon"
		width="160px"
		height="160px"
		viewBox="-9.6 -9.6 43.20 43.20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g id="SVGRepo_bgCarrier" strokeWidth="0">
			<rect
				x="-9.6"
				y="-9.6"
				width="43.20"
				height="43.20"
				rx="21.6"
				fill="#7ed0ec"
				strokeWidth="0"
			></rect>
		</g>
		<g
			id="SVGRepo_tracerCarrier"
			strokeLinecap="round"
			strokeLinejoin="round"
		></g>
		<g id="SVGRepo_iconCarrier">
			{' '}
			<path
				d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
				fill="#3454f4"
			></path>{' '}
		</g>
	</svg>
);

const PauseIcon = (
	<svg
		className="btn-icon"
		width="160px"
		height="160px"
		viewBox="-12.24 -12.24 48.48 48.48"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		stroke="#000000"
		strokeWidth="0.00024000000000000003"
	>
		<g id="SVGRepo_bgCarrier" strokeWidth="0">
			<rect
				x="-12.24"
				y="-12.24"
				width="48.48"
				height="48.48"
				rx="24.24"
				fill="#7ed0ec"
				strokeWidth="0"
			></rect>
		</g>
		<g
			id="SVGRepo_tracerCarrier"
			strokeLinecap="round"
			strokeLinejoin="round"
		></g>
		<g id="SVGRepo_iconCarrier">
			{' '}
			<path
				d="M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2C7.88562 2 8.82843 2 9.41421 2.58579C10 3.17157 10 4.11438 10 6V18C10 19.8856 10 20.8284 9.41421 21.4142C8.82843 22 7.88562 22 6 22C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V6Z"
				fill="#3454f4"
			></path>{' '}
			<path
				d="M14 6C14 4.11438 14 3.17157 14.5858 2.58579C15.1716 2 16.1144 2 18 2C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22C16.1144 22 15.1716 22 14.5858 21.4142C14 20.8284 14 19.8856 14 18V6Z"
				fill="#3454f4"
			></path>{' '}
		</g>
	</svg>
);

export const PlayPause = ({
	state,
	onClick,
}: {
	state?: PlayerStates;
	onClick: () => void;
}) => {
	return (
		<IconBtnLarge type="text" onClick={onClick}>
			{state === PlayerStates.PLAYING && PauseIcon}
			{state !== PlayerStates.PLAYING && PlayIcon}
		</IconBtnLarge>
	);
};
