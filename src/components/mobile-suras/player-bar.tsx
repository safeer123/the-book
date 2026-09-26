import { useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import YouTube, { YouTubeProps } from 'react-youtube';
import {
	CaretRightFilled,
	CloseOutlined,
	PauseOutlined,
	StepBackwardFilled,
	StepForwardFilled,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChapters } from 'data/use-chapters';
import { getReciterFromTitle } from 'utils/project-utils';
import { PLAYER_HEIGHT } from './styles';
import { useMobilePlayer } from './player-context';
import {
	BASE_PATH,
	chapterOfProject,
	markOpenedFromList,
	verseNumOf,
} from './utils';

const slideUp = keyframes`
	from { transform: translateY(120%); }
	to   { transform: translateY(0); }
`;

const Bar = styled.div`
	position: fixed;
	left: max(8px, env(safe-area-inset-left));
	right: max(8px, env(safe-area-inset-right));
	bottom: calc(8px + env(safe-area-inset-bottom));
	max-width: 640px;
	margin: 0 auto;
	height: ${PLAYER_HEIGHT}px;
	box-sizing: border-box;
	/* Below antd's Drawer z-index so bottom sheets cover it. */
	z-index: 900;
	display: flex;
	align-items: center;
	gap: 2px;
	padding: 0 6px 0 16px;
	border-radius: 18px;
	font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	background: rgba(255, 253, 248, 0.94);
	backdrop-filter: saturate(1.4) blur(14px);
	-webkit-backdrop-filter: saturate(1.4) blur(14px);
	border: 1px solid rgba(14, 2, 121, 0.1);
	box-shadow: 0 10px 30px rgba(7, 1, 65, 0.18);
	animation: ${slideUp} 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);

	[data-theme='dark'] & {
		background: rgba(36, 31, 61, 0.94);
		border-color: rgba(156, 142, 224, 0.28);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
	}
`;

// Audio-only, same as /mqbind: a phone-width bar has no room for a
// legible video, and every pixel goes to the controls and the label.
const HiddenPlayer = styled.div`
	position: absolute;
	left: -9999px;
	width: 1px;
	height: 1px;
	overflow: hidden;
	opacity: 0;
	pointer-events: none;
`;

const Info = styled.button`
	flex: 1;
	min-width: 0;
	border: none;
	background: transparent;
	padding: 6px 0;
	text-align: left;
	color: inherit;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

const Reciter = styled.span`
	font-size: 14px;
	font-weight: 650;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: rgb(7, 1, 65);

	[data-theme='dark'] & {
		color: #f0ebff;
	}
`;

const Where = styled.span`
	font-size: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-variant-numeric: tabular-nums;
	color: rgba(7, 1, 65, 0.55);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const CtrlButton = styled.button<{ $primary?: boolean; $small?: boolean }>`
	flex-shrink: 0;
	/* 44px minimum touch target (Apple HIG / Material); the primary
	   play button is a touch larger so it reads as the main action. */
	width: ${({ $primary, $small }) => {
		if ($primary) return 50;
		return $small ? 40 : 44;
	}}px;
	height: ${({ $primary, $small }) => {
		if ($primary) return 50;
		return $small ? 40 : 44;
	}}px;
	border-radius: 50%;
	border: none;
	padding: 0;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: ${({ $small }) => ($small ? 14 : 18)}px;
	background: transparent;
	color: rgb(14, 2, 121);

	[data-theme='dark'] & {
		color: #c8c0e0;
	}

	${({ $primary }) =>
		$primary &&
		css`
			font-size: 20px;
			background: rgb(14, 2, 121);
			color: #fff;
			box-shadow: 0 4px 12px rgba(14, 2, 121, 0.3);

			[data-theme='dark'] & {
				background: #9c8ee0;
				color: #14112b;
			}
		`}

	&:active {
		transform: scale(0.92);
	}

	&:disabled {
		opacity: 0.3;
	}
`;

const PlayerBar = () => {
	const {
		activeProject,
		currentVerseKey,
		videoId,
		startSeconds,
		isPlaying,
		onReady,
		onStateChange,
		playPause,
		next,
		prev,
		stop,
		hasNext,
		hasPrev,
	} = useMobilePlayer();
	const { data: chapterData } = useChapters();
	const navigate = useNavigate();
	const location = useLocation();

	const chapterId = chapterOfProject(activeProject);
	const chapter = chapterId ? chapterData?.suraByKey?.[chapterId] : undefined;
	const reciter = activeProject ? getReciterFromTitle(activeProject.title) : '';
	const verseNum = verseNumOf(currentVerseKey);

	const opts: YouTubeProps['opts'] = useMemo(
		() => ({
			playerVars: {
				autoplay: 0,
				controls: 0,
				playsinline: 1,
				start: Math.max(0, Math.floor(startSeconds)),
			},
			height: 1,
			width: 1,
		}),
		[startSeconds]
	);

	if (!activeProject) return null;

	const jumpToCurrent = () => {
		if (!chapterId) return;
		const readerPath = `${BASE_PATH}/${chapterId}`;
		if (location.pathname === readerPath) {
			if (currentVerseKey) {
				document
					.getElementById(`ve-${currentVerseKey}`)
					?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}
		const params = new URLSearchParams(location.search);
		if (verseNum) params.set('v', String(verseNum));
		else params.delete('v');
		markOpenedFromList(location.pathname === BASE_PATH);
		navigate(`${readerPath}?${params.toString()}`);
	};

	let whereText = 'Starting…';
	if (chapter && verseNum) {
		whereText = `${chapter.name_simple} · Verse ${verseNum}`;
	} else if (chapter) {
		whereText = chapter.name_simple;
	}

	return (
		<Bar role="region" aria-label="Recitation player">
			{/* Rendered in a fixed spot for as long as a project is active, so
			    the iframe (and playback) survives route changes. */}
			<HiddenPlayer>
				{videoId && (
					<YouTube
						key={videoId}
						videoId={videoId}
						opts={opts}
						onReady={onReady}
						onStateChange={onStateChange}
					/>
				)}
			</HiddenPlayer>
			<Info type="button" onClick={jumpToCurrent} aria-label="Show verse">
				<Reciter>{reciter || activeProject.title}</Reciter>
				<Where>{whereText}</Where>
			</Info>
			<CtrlButton
				type="button"
				aria-label="Previous verse"
				onClick={prev}
				disabled={!hasPrev}
			>
				<StepBackwardFilled />
			</CtrlButton>
			<CtrlButton
				type="button"
				$primary
				aria-label={isPlaying ? 'Pause' : 'Play'}
				onClick={playPause}
			>
				{isPlaying ? <PauseOutlined /> : <CaretRightFilled />}
			</CtrlButton>
			<CtrlButton
				type="button"
				aria-label="Next verse"
				onClick={next}
				disabled={!hasNext}
			>
				<StepForwardFilled />
			</CtrlButton>
			<CtrlButton type="button" $small aria-label="Stop" onClick={stop}>
				<CloseOutlined />
			</CtrlButton>
		</Bar>
	);
};

export default PlayerBar;
