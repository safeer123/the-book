import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { IconBtnLarge } from './icon-btn';

const PlayIcon = (
	<svg
		width="800px"
		height="800px"
		viewBox="-2.4 -2.4 28.80 28.80"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		stroke="#3454f4"
		className="btn-icon"
	>
		<g id="SVGRepo_bgCarrier" strokeWidth="0">
			<rect
				x="-2.4"
				y="-2.4"
				width="28.80"
				height="28.80"
				rx="14.4"
				fill="#7ed0ec"
				strokeWidth="0"
			/>
		</g>

		<g
			id="SVGRepo_tracerCarrier"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		<g id="SVGRepo_iconCarrier">
			{' '}
			<g id="Media / Play_Circle">
				{' '}
				<g id="Vector">
					{' '}
					<path
						d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z"
						stroke="#3454f4"
						strokeWidth="0.792"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>{' '}
					<path
						d="M10 15V9L15 12L10 15Z"
						stroke="#3454f4"
						strokeWidth="0.792"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>{' '}
				</g>{' '}
			</g>{' '}
		</g>
	</svg>
);

const PauseIcon = (
	<svg
		width="800px"
		height="800px"
		viewBox="-2.4 -2.4 28.80 28.80"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		stroke="#3454f4"
		className="btn-icon"
	>
		<g id="SVGRepo_bgCarrier" strokeWidth="0">
			<rect
				x="-2.4"
				y="-2.4"
				width="28.80"
				height="28.80"
				rx="14.4"
				fill="#7ed0ec"
				strokeWidth="0"
			/>
		</g>

		<g
			id="SVGRepo_tracerCarrier"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		<g id="SVGRepo_iconCarrier">
			{' '}
			<path
				d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
				stroke="#3454f4"
				strokeWidth="0.792"
			/>{' '}
			<path
				d="M14 9L14 15"
				stroke="#3454f4"
				strokeWidth="0.792"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>{' '}
			<path
				d="M10 9L10 15"
				stroke="#3454f4"
				strokeWidth="0.792"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>{' '}
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
