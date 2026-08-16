import { useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Button } from 'antd';
import {
	PlayCircleFilled,
	PauseCircleFilled,
	StepBackwardOutlined,
	StepForwardOutlined,
	EyeInvisibleOutlined,
	StopOutlined,
} from '@ant-design/icons';
import { ProjectConfig } from 'types';
import { getReciterFromTitle } from 'utils/project-utils';

const PANEL_TOP = 68;
// Offset to leave room for the global theme toggle button, which sits at
// top:16/right:16.
const PANEL_RIGHT = 72;
const PANEL_PADDING = 12;
const PANEL_WIDTH = 220;
const VIDEO_WIDTH = 160;
const VIDEO_HEIGHT = 90;
const VIDEO_RIGHT = PANEL_RIGHT + (PANEL_WIDTH - VIDEO_WIDTH) / 2;

const pulse = keyframes`
	0% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.45); }
	70% { box-shadow: 0 0 0 10px rgba(22, 119, 255, 0); }
	100% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0); }
`;

const FloatingButton = styled.button<{ $playing: boolean }>`
	position: fixed;
	top: 16px;
	right: ${PANEL_RIGHT}px;
	/* Below antd's Drawer/Modal default z-index (1000) so an open drawer
	   fully covers this instead of visually colliding with its header. */
	z-index: 900;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: none;
	background: #1677ff;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22px;
	line-height: 0;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

	${({ $playing }) =>
		$playing &&
		css`
			animation: ${pulse} 2s infinite;
		`}

	&:hover {
		background: #4096ff;
	}
`;

const Panel = styled.div`
	position: fixed;
	top: ${PANEL_TOP}px;
	right: ${PANEL_RIGHT}px;
	z-index: 899;
	width: ${PANEL_WIDTH}px;
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
	padding: ${PANEL_PADDING}px;
	display: flex;
	flex-direction: column;
	gap: 10px;

	[data-theme='dark'] & {
		background: #241f3d;
		border: 1px solid rgba(156, 142, 224, 0.3);
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55);
	}
`;

const VideoSpacer = styled.div`
	height: ${VIDEO_HEIGHT}px;
`;

const VideoSlot = styled.div<{ $visible: boolean }>`
	position: fixed;
	z-index: 901;
	width: ${VIDEO_WIDTH}px;
	height: ${VIDEO_HEIGHT}px;
	border-radius: 8px;
	overflow: hidden;
	background: #000;

	${({ $visible }) =>
		$visible
			? css`
					top: ${PANEL_TOP + PANEL_PADDING}px;
					right: ${VIDEO_RIGHT}px;
					opacity: 1;
					pointer-events: auto;
			  `
			: css`
					top: -9999px;
					right: -9999px;
					opacity: 0;
					pointer-events: none;
			  `}
`;

const TitleBlock = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
	text-align: center;
	overflow: hidden;
`;

const ReciterName = styled.div`
	font-family: Georgia, 'Times New Roman', serif;
	font-size: 15px;
	font-weight: 600;
	letter-spacing: 0.01em;
	color: rgba(0, 0, 0, 0.85);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	[data-theme='dark'] & {
		color: #f0ebff;
	}
`;

const ChapterLabel = styled.div`
	font-size: 11px;
	color: rgba(0, 0, 0, 0.45);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const ControlsRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
`;

const ActionsRow = styled.div`
	display: flex;
	gap: 8px;

	.ant-btn {
		flex: 1;
	}
`;

interface Props {
	activeProject: ProjectConfig | undefined;
	videoId: string | undefined;
	startSeconds: number;
	panelOpen: boolean;
	setPanelOpen: (open: boolean) => void;
	isPlaying: boolean;
	onReady: YouTubeProps['onReady'];
	onStateChange: YouTubeProps['onStateChange'];
	playPause: () => void;
	next: () => void;
	prev: () => void;
	stop: () => void;
	hasNext: boolean;
	hasPrev: boolean;
}

const FloatingRecitePanel = ({
	activeProject,
	videoId,
	startSeconds,
	panelOpen,
	setPanelOpen,
	isPlaying,
	onReady,
	onStateChange,
	playPause,
	next,
	prev,
	stop,
	hasNext,
	hasPrev,
}: Props) => {
	const reciter = useMemo(
		() => (activeProject ? getReciterFromTitle(activeProject.title) : ''),
		[activeProject]
	);
	const chapterLabel = useMemo(
		() => activeProject?.title.split(' - ')[0] || '',
		[activeProject]
	);

	// `start` only takes effect when the player is (re)created, so a fresh
	// `key` forces a remount whenever the video changes, letting the native
	// cue-at-start-time behave reliably instead of racing a post-ready seekTo.
	const opts: YouTubeProps['opts'] = useMemo(
		() => ({
			playerVars: {
				autoplay: 0,
				controls: 0,
				start: Math.max(0, Math.floor(startSeconds)),
			},
			height: VIDEO_HEIGHT,
			width: VIDEO_WIDTH,
		}),
		[startSeconds]
	);

	if (!activeProject) return null;

	return (
		<>
			<FloatingButton
				type="button"
				$playing={isPlaying}
				onClick={() => setPanelOpen(!panelOpen)}
				title={reciter || activeProject.title}
			>
				{isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
			</FloatingButton>

			<VideoSlot $visible={panelOpen}>
				{videoId && (
					<YouTube
						key={videoId}
						videoId={videoId}
						opts={opts}
						onReady={onReady}
						onStateChange={onStateChange}
					/>
				)}
			</VideoSlot>

			{panelOpen && (
				<Panel>
					<VideoSpacer />
					<TitleBlock title={activeProject.title}>
						<ReciterName>{reciter || activeProject.title}</ReciterName>
						{chapterLabel && <ChapterLabel>{chapterLabel}</ChapterLabel>}
					</TitleBlock>
					<ControlsRow>
						<Button
							shape="circle"
							icon={<StepBackwardOutlined />}
							onClick={prev}
							disabled={!hasPrev}
						/>
						<Button
							shape="circle"
							type="primary"
							icon={isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
							onClick={playPause}
						/>
						<Button
							shape="circle"
							icon={<StepForwardOutlined />}
							onClick={next}
							disabled={!hasNext}
						/>
					</ControlsRow>
					<ActionsRow>
						<Button
							size="small"
							icon={<EyeInvisibleOutlined />}
							onClick={() => setPanelOpen(false)}
						>
							Hide
						</Button>
						<Button size="small" danger icon={<StopOutlined />} onClick={stop}>
							Stop
						</Button>
					</ActionsRow>
				</Panel>
			)}
		</>
	);
};

export default FloatingRecitePanel;
