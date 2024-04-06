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

const VideoWrapper = styled.div`
	@media (min-width: 320px) {
		height: 40px;
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0.1;
	}

	@media (min-width: 961px) {
		flex: 2;
		display: flex;
		justify-content: center;
		background-color: #180f2f;
		position: relative;
		opacity: 1;
	}
`;

const ProjectTitle = styled.div`
	z-index: 3;
	position: absolute;
	top: 24px;
	left: 24px;
	font-size: 24px;
	color: #fff;

	@media (min-width: 320px) {
		display: none;
		top: 60px;
		left: 8px;
		font-size: 16px;
	}

	@media (min-width: 961px) {
		display: block;
		top: 24px;
		left: 24px;
		font-size: 24px;
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

	@media (min-width: 320px) {
		.arabic-verse-text {
			font-size: 1.5em;
		}

		.translation-text {
			font-size: 0.75em;
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

	&&& .ant-collapse-content {
		text-align: center;
		height: calc(100% - 57px);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.arabic-verse-text {
		font-size: 24px;
	}

	.translation-text {
		font-size: 16px;
	}

	.arabic-verse-text-small {
		font-size: 18px;
	}

	.translation-text-small {
		font-size: 12px;
	}
`;

const ControlsWrapper = styled.div`
	flex: 1;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0px 16px;
	border-top: 1px dashed #54aaeb;

	@media (min-width: 320px) {
		position: absolute;
		top: 80px;
		height: 100px;
		width: calc(100% - 16px);
		border-top: none;
	}

	@media (min-width: 961px) {
		position: relative;
		top: 0px;
		border-top: 1px dashed #54aaeb;
	}
`;

const TimelineControl = styled.div`
	flex: 1;
	display: flex;
	align-items: center;

	.play-control-slider {
		width: 100%;
	}
`;

const PlayStatus = styled.div`
	display: flex;
	justify-content: flex-end;
	font-size: 16px;
	padding: 16px;
	margin-bottom: 18px;

	@media (min-width: 320px) {
		font-size: 0.5em;
		padding: 0.5em;
		margin-bottom: 0.5em;
	}

	@media (min-width: 961px) {
		font-size: 16px;
		padding: 16px;
		margin-bottom: 18px;
	}
`;

const VerseMarkItem = styled(Button)`
	background-color: transparent;
	width: 15px;
	height: 15px;
	padding: 0px !important;
	border-radius: 7px;
	svg {
		width: 15px;
		height: 15px;
	}

	@media (min-width: 320px) {
		display: none;
	}

	@media (min-width: 961px) {
		display: block;
	}
`;

interface Props {
	projectConfig?: ProjectConfig;
	currentTime: number;
	setCurrentTime: (t: number) => void;
	setVideoStatus: (s: Partial<VideoStatusInfo>) => void;
	videoStatus?: VideoStatusInfo;
	playerRef: React.MutableRefObject<YouTubePlayer | null>;
	playPause: () => void;
	seekTo: (t: number) => void;
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
}: Props) => {
	const [videoVisibility, setVideoVisibility] = useState(true);
	const { verses, timeToVerse } = useVerseBinding({
		currentTime,
		bindingConfig: projectConfig?.bindingConfig || [],
	});

	const { data: verseData, isLoading: versesLoading } = useVerses();

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
									/>
								</VerseTooltipWrapper>
							}
						>
							<VerseMarkItem size="small" onClick={() => seekTo(item.t)}>
								<TimelineMarkItemIcon />
							</VerseMarkItem>
						</Popover>
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
				<ProjectTitle>{projectConfig?.title || '--untitled--'}</ProjectTitle>
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
			<VerseDisplayWrapper onClick={playPause}>
				<VerseList>
					{!versesLoading && <Results selectedVerses={verses} />}
				</VerseList>
			</VerseDisplayWrapper>
			<ControlsWrapper>
				<PlayPause onClick={playPause} state={videoStatus?.playStatus} />
				<TimelineControl>
					<Slider
						className="play-control-slider"
						max={videoStatus?.duration || 1}
						value={currentTime}
						onChange={(t) => seekTo(t)}
						marks={marks}
					/>
				</TimelineControl>

				<PlayStatus>
					{(currentTime || 0).toFixed(1)} / {videoStatus?.duration}
				</PlayStatus>
			</ControlsWrapper>
		</>
	);
};

export default VideoPage;
