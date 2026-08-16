/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import styled from 'styled-components';
import YouTube, {
	YouTubeEvent,
	YouTubePlayer,
	YouTubeProps,
} from 'react-youtube';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useVerseBinding } from './use-verse-binding';
import Results from 'components/sura-list/results';
import { ProjectConfig, VideoStatusInfo } from 'types';
import { Button, Popover, Slider } from 'antd';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { PlayPause } from './buttons/play-pause-button';
import { TimelineMarkItemIcon } from './timeline-mark-item';
import { useVerses } from 'data/use-verses';
import { formatDuration } from './utils';
import { usePersistedVideoState } from './use-persisted-video-state';

const VideoWrapper = styled.div`
	@media (min-width: 320px) {
		height: 40px;
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0.04;
	}

	@media (min-width: 961px) {
		flex: 2;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		background-color: #180f2f;
		position: relative;
		opacity: 1;
		overflow: hidden;
	}
`;

const VerseDisplayWrapper = styled.div`
	flex: 5;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
`;

const VerseList = styled.div`
	height: 100%;
	width: 100%;

	.verse-display-root {
		width: 100%;
		height: 100%;
	}

	&& .ant-collapse {
		height: 100%;
	}

	&&&& .ant-collapse-item {
		border-bottom: none;
		-webkit-box-shadow: none;
		-moz-box-shadow: none;
		box-shadow: none;
		height: 100%;
	}

	&& .ant-collapse-content {
		text-align: center;
		height: calc(100% - 57px);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.translation-text {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	@media (min-width: 320px) {
		.arabic-verse-text {
			font-size: 1.5em;
		}

		.translation-text {
			font-size: 0.75em;
		}

		.verse-tafsir-btn {
			display: block;
		}
	}

	@media (min-width: 961px) {
		.arabic-verse-text {
			font-size: 36px;
		}

		.arabic-verse-text-small {
			font-size: 30px;
		}

		.translation-text {
			font-size: 24px;
		}

		.translation-text-small {
			font-size: 18px;
		}
	}
`;

const VerseTooltipWrapper = styled.div`
	max-width: 80vw;

	&&& .ant-collapse-item {
		border-bottom: none;
		-webkit-box-shadow: none;
		-moz-box-shadow: none;
		box-shadow: none;
	}

	&&& .ant-collapse-header {
		display: none;
	}

	&&& .ant-collapse-content {
		text-align: center;
		height: calc(100% - 57px);
		display: flex;
		justify-content: center;
		align-items: center;
		border-top: none;
	}

	.arabic-verse-text {
		font-size: 24px;
	}

	.translation-text {
		font-size: 16px;
	}

	.translation-text > *:not(.translation-text-content) {
		display: none;
	}

	.arabic-verse-text-small {
		font-size: 18px;
	}

	.translation-text-small {
		font-size: 12px;
	}
`;

const VerseMarkItem = styled(Button)`
	background-color: transparent;
	width: 16px;
	height: 16px;
	padding: 0px !important;
	border-radius: 8px;
	opacity: 0;
	transform: scale(0.3) translateY(3px);
	transition: opacity 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
		transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease;
	svg {
		width: 16px;
		height: 16px;
	}

	&:hover {
		transform: scale(1.3) translateY(0) !important;
		filter: drop-shadow(0 0 5px rgba(126, 208, 236, 0.8));
	}

	@media (min-width: 320px) {
		display: none;
	}

	@media (min-width: 961px) {
		display: block;
	}
`;

const BlankMarkItem = styled(VerseMarkItem)`
	border-radius: 50%;
	background: radial-gradient(circle, #7ed0ec 0%, rgba(126, 208, 236, 0.3) 75%);
`;

const ControlsWrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	box-sizing: border-box;
	padding: 10px 20px 14px;
	gap: 6px;

	@media (min-width: 320px) {
		position: absolute;
		top: 60px;
		height: 100px;
		width: calc(100% - 16px);
	}

	@media (min-width: 961px) {
		position: relative;
		top: 0;
		width: auto;
		background: linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0),
			rgba(255, 255, 255, 0.92) 40%
		);
		box-shadow: 0 -6px 18px rgba(20, 17, 43, 0.06);
	}

	[data-theme='dark'] & {
		@media (min-width: 961px) {
			background: linear-gradient(
				to bottom,
				rgba(20, 17, 43, 0),
				rgba(20, 17, 43, 0.92) 40%
			);
			box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.4);
		}
	}

	&:hover ${VerseMarkItem} {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
`;

const ControlRow = styled.div`
	display: flex;
	align-items: center;
	gap: 14px;
`;

const TimelineControl = styled.div`
	flex: 1;
	display: flex;
	align-items: center;

	.play-control-slider {
		width: 100%;
	}

	.ant-slider-rail {
		height: 8px !important;
		border-radius: 4px !important;
		background-color: rgba(0, 0, 0, 0.08) !important;
	}

	.ant-slider-track {
		height: 8px !important;
		border-radius: 4px !important;
		background: linear-gradient(90deg, #54aaeb, #7ed0ec) !important;
	}

	.ant-slider-handle::after {
		width: 16px !important;
		height: 16px !important;
		box-shadow: 0 0 0 2px #54aaeb, 0 2px 6px rgba(20, 17, 43, 0.35) !important;
		background-color: #fff !important;
		inset-inline-start: 0 !important;
		inset-block-start: 0 !important;
	}

	.ant-slider-handle:hover::after,
	.ant-slider-handle:focus::after {
		box-shadow: 0 0 0 4px rgba(84, 170, 235, 0.25), 0 0 0 2px #54aaeb,
			0 2px 6px rgba(20, 17, 43, 0.35) !important;
	}

	.ant-slider-dot {
		width: 3px !important;
		height: 11px !important;
		border-radius: 1.5px !important;
		border: none !important;
		background-color: rgba(84, 170, 235, 0.45) !important;
		top: 50% !important;
		transform: translate(-50%, -50%) !important;
		transition: background-color 0.15s ease, box-shadow 0.15s ease,
			transform 0.15s ease;
	}

	.ant-slider-dot:hover {
		background-color: #54aaeb !important;
		box-shadow: 0 0 6px 1px rgba(84, 170, 235, 0.85) !important;
		transform: translate(-50%, -50%) scaleY(1.4) !important;
	}

	.ant-slider-dot-active {
		background-color: #3d8bcf !important;
	}

	[data-theme='dark'] & {
		.ant-slider-rail {
			background-color: rgba(255, 255, 255, 0.12) !important;
		}

		.ant-slider-dot {
			background-color: rgba(126, 208, 236, 0.45) !important;
		}

		.ant-slider-dot:hover {
			background-color: #a8d8f0 !important;
			box-shadow: 0 0 6px 1px rgba(168, 216, 240, 0.85) !important;
		}

		.ant-slider-dot-active {
			background-color: #a8d8f0 !important;
		}
	}
`;

const TimeInfoRow = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: baseline;
	align-self: flex-end;
	gap: 8px;
	padding: 2px 10px;
	border-radius: 10px;
	background: rgba(0, 0, 0, 0.045);

	@media (min-width: 320px) {
		display: none;
	}

	@media (min-width: 961px) {
		display: flex;
	}

	[data-theme='dark'] & {
		background: rgba(255, 255, 255, 0.07);
	}
`;

const TimeFormatted = styled.span`
	font-size: 13px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.65);
	font-variant-numeric: tabular-nums;
	font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,
		monospace;
	letter-spacing: 0.3px;

	[data-theme='dark'] & {
		color: #d8d0f0;
	}
`;

const TimeRaw = styled.span`
	font-size: 11px;
	color: rgba(0, 0, 0, 0.32);
	font-variant-numeric: tabular-nums;
	font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,
		monospace;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const TimeDivider = styled.span`
	color: rgba(0, 0, 0, 0.18);
	font-size: 11px;
	font-weight: 300;

	[data-theme='dark'] & {
		color: rgba(168, 156, 216, 0.5);
	}
`;

interface Props {
	projectConfig?: ProjectConfig;
	currentTime: number;
	setCurrentTime: (t: number) => void;
	setVideoStatus: (s: Partial<VideoStatusInfo>) => void;
	videoStatus?: VideoStatusInfo;
	playerRef: React.MutableRefObject<YouTubePlayer | null>;
	playPause: (pause?: boolean) => void;
	seekTo: (t: number) => void;
	viewerMode?: boolean;
}

const VideoPage = ({
	projectConfig,
	currentTime,
	setCurrentTime,
	setVideoStatus,
	videoStatus,
	playerRef,
	playPause,
	seekTo,
	viewerMode,
}: Props) => {
	const [videoVisibility, setVideoVisibility] = useState(true);
	const { verses, timeToVerse } = useVerseBinding({
		currentTime,
		bindingConfig: projectConfig?.bindingConfig || [],
	});

	const { data: verseData, isLoading: versesLoading } = useVerses();

	const handleSmartBarItemClick = (verseKey: string) => {
		if (projectConfig?.bindingConfig && verseKey) {
			const bindingElement = projectConfig.bindingConfig.find(
				(item) => item.k === verseKey
			);
			if (bindingElement && typeof bindingElement.t === 'number') {
				seekTo(bindingElement.t);
			}
		}
	};

	const { getTime } = usePersistedVideoState();

	const checkElapsedTime: YouTubeProps['onStateChange'] = (
		e: YouTubeEvent<number>
	) => {
		if (e.target) {
			setVideoStatus({
				duration: e.target.getDuration() as unknown as number,
				playStatus: e.target.getPlayerState() as unknown as PlayerStates,
			});
		}
	};

	const videoId = useMemo(() => {
		if (projectConfig?.videoUrl) {
			return projectConfig?.videoUrl.split('v=')?.[1]?.split('&')?.[0];
		}
	}, [projectConfig?.videoUrl]);

	useEffect(() => {
		if (!videoId) {
			setVideoVisibility(false);
		} else {
			setVideoVisibility(true);
		}
	}, [videoId]);

	useEffect(() => {
		const timerRef = setInterval(() => {
			const currTime = playerRef.current?.getCurrentTime() as unknown as number;
			setCurrentTime(currTime);
		}, 10);

		return () => {
			clearInterval(timerRef);
		};
	}, [playerRef]);

	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				e.preventDefault();
				playPause();
			} else if (e.code === 'ArrowRight') {
				e.preventDefault();
				const tNext = timeToVerse(+1);
				if (tNext > 0) {
					seekTo(tNext);
				}
			} else if (e.code === 'ArrowLeft') {
				e.preventDefault();
				const tNext = timeToVerse(-1);
				if (tNext > 0) {
					seekTo(tNext);
				}
			}
		};
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	}, [playPause, timeToVerse]);

	const opts: YouTubeProps['opts'] = useMemo(() => {
		return {
			playerVars: {
				// https://developers.google.com/youtube/player_parameters
				autoplay: 0,
				controls: 0,
				start: getTime(),
			},
			height: 200,
		};
	}, [videoId]);

	const marks = useMemo(() => {
		if (projectConfig?.bindingConfig && verseData?.ayaByKey) {
			const marksObj: { [key: number]: ReactNode } = {};
			projectConfig?.bindingConfig?.forEach((item) => {
				if (item.k?.includes(':')) {
					marksObj[item.t] = (
						<Popover
							content={
								<VerseTooltipWrapper>
									<Results
										selectedVerses={
											verseData?.ayaByKey[item.k]
												? [verseData?.ayaByKey[item.k]]
												: []
										}
										onClickSmartBarItem={handleSmartBarItemClick}
									/>
								</VerseTooltipWrapper>
							}
						>
							<VerseMarkItem size="small" onClick={() => seekTo(item.t)}>
								<TimelineMarkItemIcon />
							</VerseMarkItem>
						</Popover>
					);
				} else {
					marksObj[item.t] = (
						<BlankMarkItem size="small" onClick={() => seekTo(item.t)} />
					);
				}
			});
			return marksObj;
		}
		return {};
	}, [projectConfig?.bindingConfig, verseData?.ayaByKey]);

	return (
		<>
			<VideoWrapper>
				{videoVisibility && (
					<YouTube
						videoId={videoId}
						iframeClassName="embed embed-youtube"
						onStateChange={checkElapsedTime}
						opts={opts}
						// onPlay={(e) => console.log(e.target.getCurrentTime())}
						onReady={(e) => {
							console.log('onReady: YouTube Player');
							playerRef.current = e.target;
							setVideoStatus({
								duration: e.target.getDuration() as unknown as number,
								playStatus:
									e.target.getPlayerState() as unknown as PlayerStates,
							});
						}}
					/>
				)}
			</VideoWrapper>
			<VerseDisplayWrapper
				onClick={(e: React.MouseEvent) => {
					const target = e.target as HTMLElement;
					const classNamesToLookFor = [
						'arabic-verse-text',
						'translation-text',
						'translation-text-content',
						'ant-collapse',
						'ant-collapse-content',
						'ant-collapse-content-box',
					];
					if (classNamesToLookFor.some((c) => target.classList.contains(c))) {
						playPause();
					} else {
						playPause(true);
					}
				}}
			>
				<VerseList>
					{!versesLoading && (
						<Results
							selectedVerses={verses}
							config={{ textAnimationClass: 'zoom-fade-in' }}
							onClickSmartBarItem={handleSmartBarItemClick}
						/>
					)}
				</VerseList>
			</VerseDisplayWrapper>
			<ControlsWrapper>
				<TimeInfoRow>
					{!viewerMode && (
						<>
							<TimeRaw>
								{(currentTime || 0).toFixed(1)} / {videoStatus?.duration ?? 0}
							</TimeRaw>
							<TimeDivider>|</TimeDivider>
						</>
					)}
					<TimeFormatted>
						{formatDuration(currentTime || 0)} /{' '}
						{formatDuration(videoStatus?.duration || 0)}
					</TimeFormatted>
				</TimeInfoRow>
				<ControlRow>
					<PlayPause
						onClick={() => playPause()}
						state={videoStatus?.playStatus}
					/>
					<TimelineControl>
						<Slider
							className="play-control-slider"
							max={videoStatus?.duration || 1}
							value={currentTime}
							onChange={(t) => seekTo(t)}
							marks={marks}
						/>
					</TimelineControl>
				</ControlRow>
			</ControlsWrapper>
		</>
	);
};

export default VideoPage;
