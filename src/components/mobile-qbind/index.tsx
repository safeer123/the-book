/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import styled, { keyframes } from 'styled-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Slider, Spin } from 'antd';
import {
	MenuOutlined,
	StepBackwardOutlined,
	StepForwardOutlined,
	PlayCircleOutlined,
	PauseCircleOutlined,
	BookOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import YouTube, {
	YouTubeEvent,
	YouTubeProps,
	YouTubePlayer,
} from 'react-youtube';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import sanitizeHtml from 'sanitize-html';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ProjectConfig, TafsirConfig, VideoStatusInfo } from 'types';
import { useProjectStore } from 'components/video-text-binding/use-project-store';
import { useVerseBinding } from 'components/video-text-binding/use-verse-binding';
import { usePersistedVideoState } from 'components/video-text-binding/use-persisted-video-state';
import { formatDuration } from 'components/video-text-binding/utils';
import { TranslationVisibilityProvider } from 'context/translation-visibility-context';
import TranslationSelectionUI from 'components/sura-list/results/translation-selection-ui';
import TafsirByVerse from 'components/sura-list/tafsir-drawer/tafsir-by-verse';
import ProjectsMenu from 'components/video-text-binding/projects-menu';

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Layout ──────────────────────────────────────────────────────────────────

const Page = styled.div`
	height: 100dvh;
	width: 100dvw;
	background: #0d0b1a;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: fixed;
	inset: 0;
	font-family: system-ui, sans-serif;
`;

// Rotate-device overlay (portrait mode)
const RotateOverlay = styled.div`
	position: fixed;
	inset: 0;
	background: #0d0b1a;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20px;
	z-index: 9999;
`;

const RotateIconWrapper = styled.div`
	font-size: 56px;
	animation: rotateHint 2s ease-in-out infinite;

	@keyframes rotateHint {
		0% {
			transform: rotate(0deg);
		}
		30% {
			transform: rotate(-90deg);
		}
		60% {
			transform: rotate(-90deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
`;

const RotateTitle = styled.div`
	color: #e8d9c0;
	font-size: 20px;
	font-weight: 600;
	letter-spacing: 0.02em;
`;

const RotateSubtitle = styled.div`
	color: #7a748a;
	font-size: 14px;
`;

// ─── Header ──────────────────────────────────────────────────────────────────

const TopBar = styled.div`
	height: 46px;
	flex-shrink: 0;
	background: rgba(20, 17, 35, 0.98);
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	display: flex;
	align-items: center;
	padding: 0 12px;
	gap: 8px;
	z-index: 10;
`;

const ProjectButton = styled.button`
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 20px;
	color: #c8c0e0;
	font-size: 13px;
	padding: 4px 12px 4px 10px;
	display: flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 180px;
	flex-shrink: 0;

	&:active {
		background: rgba(255, 255, 255, 0.12);
	}
`;

const VerseKeyBadge = styled.div`
	flex: 1;
	text-align: center;
	color: #7a6fa8;
	font-size: 12px;
	font-variant-numeric: tabular-nums;
	font-family: monospace;
	letter-spacing: 0.04em;
`;

const TopActions = styled.div`
	display: flex;
	gap: 4px;
	flex-shrink: 0;
`;

const TopBtn = styled(Button)`
	&& {
		background: transparent;
		border: none;
		color: #9c8ee0;
		font-size: 18px;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;

		&:hover,
		&:focus {
			background: rgba(156, 142, 224, 0.12);
			color: #b8aaee;
		}
	}
`;

// ─── Verse content area ───────────────────────────────────────────────────────

const ContentRow = styled.div`
	flex: 1;
	display: flex;
	flex-direction: row;
	overflow: hidden;
	min-height: 0;
`;

const ArabicPanel = styled.div`
	flex: 0 0 45%;
	display: flex;
	flex-direction: column;
	min-height: 0;
	padding: 16px 12px 16px 16px;
	border-right: 1px solid rgba(255, 255, 255, 0.05);
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
`;

const ArabicScroll = styled.div`
	flex: 1;
	overflow-y: auto;
	display: flex;
	align-items: center;
	justify-content: center;

	&::-webkit-scrollbar {
		width: 3px;
	}
	&::-webkit-scrollbar-track {
		background: transparent;
	}
	&::-webkit-scrollbar-thumb {
		background: rgba(156, 142, 224, 0.35);
		border-radius: 2px;
	}
`;

const ArabicText = styled.div`
	direction: rtl;
	font-family: 'Amiri Quran', 'Scheherazade New', serif;
	font-size: clamp(1.1em, 3.2vw, 1.6em);
	line-height: 1.9;
	color: #e8d9c0;
	text-align: center;
	animation: ${fadeIn} 0.35s ease;
`;

const TranslationPanel = styled.div`
	flex: 0 0 55%;
	display: flex;
	flex-direction: column;
	padding: 16px 16px 12px 12px;
	min-height: 0;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
`;

const TranslationScroll = styled.div`
	flex: 1;
	overflow-y: auto;
	color: #b0a8c8;
	font-size: clamp(0.8em, 2.4vw, 1em);
	line-height: 1.65;
	animation: ${fadeIn} 0.35s ease;

	/* Custom scrollbar */
	&::-webkit-scrollbar {
		width: 3px;
	}
	&::-webkit-scrollbar-track {
		background: transparent;
	}
	&::-webkit-scrollbar-thumb {
		background: rgba(156, 142, 224, 0.35);
		border-radius: 2px;
	}
`;

const EmptyVerseHint = styled.div`
	color: #3e3858;
	font-size: 13px;
	text-align: center;
	margin: auto;
`;

// ─── Controls ────────────────────────────────────────────────────────────────

const ControlsBar = styled.div`
	height: 58px;
	flex-shrink: 0;
	background: rgba(20, 17, 35, 0.98);
	border-top: 1px solid rgba(255, 255, 255, 0.06);
	display: flex;
	align-items: center;
	padding: 0 12px;
	gap: 8px;
`;

const CtrlBtn = styled(Button)`
	&& {
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		color: #c8c0e0;
		font-size: 18px;
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		flex-shrink: 0;

		&:hover,
		&:focus {
			background: rgba(156, 142, 224, 0.18) !important;
			border-color: rgba(156, 142, 224, 0.4) !important;
			color: #fff !important;
		}
		&:disabled {
			background: transparent !important;
			border-color: rgba(255, 255, 255, 0.05) !important;
			color: #2e2a40 !important;
		}
	}
`;

const PlayBtn = styled(Button)`
	&& {
		background: linear-gradient(135deg, #7c6fd4 0%, #9c8ee0 100%);
		border: none;
		border-radius: 50%;
		color: #fff;
		font-size: 26px;
		width: 52px;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		flex-shrink: 0;
		box-shadow: 0 4px 16px rgba(124, 111, 212, 0.45);
		transition: transform 0.1s ease, box-shadow 0.1s ease;

		&:hover,
		&:focus {
			background: linear-gradient(135deg, #9078e8 0%, #b4a4f4 100%) !important;
			box-shadow: 0 6px 20px rgba(124, 111, 212, 0.65) !important;
			color: #fff !important;
			transform: scale(1.06);
		}
		&:active {
			transform: scale(0.96);
			box-shadow: 0 2px 8px rgba(124, 111, 212, 0.35) !important;
		}
		&:disabled {
			background: rgba(255, 255, 255, 0.08) !important;
			box-shadow: none !important;
			color: #2e2a40 !important;
		}
	}
`;

const SliderWrapper = styled.div`
	flex: 1;
	min-width: 0;

	.ant-slider-rail {
		background: rgba(255, 255, 255, 0.1);
	}
	.ant-slider-track {
		background: #7c6fd4;
	}
	.ant-slider-handle::after {
		background: #9c8ee0;
		box-shadow: 0 0 0 2px #9c8ee0;
	}
`;

const TimeLabel = styled.span`
	color: #5a5370;
	font-size: 11px;
	font-variant-numeric: tabular-nums;
	font-family: monospace;
	white-space: nowrap;
	flex-shrink: 0;
`;

// ─── Drawer overrides ─────────────────────────────────────────────────────────

const DrawerContent = styled.div`
	background: #1a1730;
	min-height: 100%;

	/* Override ProjectsMenu light theme for dark background */
	button {
		color: #c8c0e0 !important;
	}
	button:hover {
		background: rgba(255, 255, 255, 0.08) !important;
		color: #e0d8f8 !important;
	}
	button.active-item {
		background: rgba(156, 142, 224, 0.25) !important;
		color: #c4b8f0 !important;
	}

	/* Search input dark theme */
	.ant-input,
	.ant-input-affix-wrapper {
		background: rgba(255, 255, 255, 0.06) !important;
		border-color: rgba(255, 255, 255, 0.15) !important;
		color: #c8c0e0 !important;
	}
	.ant-input::placeholder,
	input::placeholder {
		color: rgba(200, 192, 224, 0.4) !important;
	}
	.ant-input-search-button,
	.ant-btn {
		background: rgba(255, 255, 255, 0.06) !important;
		border-color: rgba(255, 255, 255, 0.15) !important;
		color: #7a748a !important;
	}
	.ant-input-clear-icon {
		color: #7a748a !important;
	}

	/* Section borders */
	> div > div:first-child,
	> div > div:last-child {
		border-color: rgba(255, 255, 255, 0.08) !important;
	}
`;

// ─── Hidden YouTube player ────────────────────────────────────────────────────

const HiddenPlayer = styled.div`
	position: absolute;
	opacity: 0;
	pointer-events: none;
	width: 1px;
	height: 1px;
	overflow: hidden;
	left: -9999px;
`;

// ─── Component ───────────────────────────────────────────────────────────────

const MobileQBind = () => {
	const [isLandscape, setIsLandscape] = useState(
		() => window.matchMedia('(orientation: landscape)').matches
	);
	const [projectMenuOpen, setProjectMenuOpen] = useState(false);
	const [translationMenuOpen, setTranslationMenuOpen] = useState(false);
	const [tafsirConfig, setTafsirConfig] = useState<TafsirConfig | undefined>();
	const [currentTime, setCurrentTime] = useState(0);
	const [videoStatus, setVideoStatus] = useState<VideoStatusInfo | undefined>();
	const [projectConfig, setProjectConfig] = useState<
		ProjectConfig | undefined
	>();

	const playerRef = useRef<YouTubePlayer | null>(null);
	const pidAppliedRef = useRef<string | undefined>(undefined);

	const { pid } = useParams();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const { projects } = useProjectStore({ setProjectConfig, viewerMode: true });
	const { verses, timeToVerse } = useVerseBinding({
		currentTime,
		bindingConfig: projectConfig?.bindingConfig || [],
	});
	const { getTime } = usePersistedVideoState();

	const verse = verses[0];
	const isPlaying = videoStatus?.playStatus === PlayerStates.PLAYING;

	// Orientation detection
	useEffect(() => {
		const mq = window.matchMedia('(orientation: landscape)');
		const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	// Apply pid → project
	useEffect(() => {
		if (pid && projects.length > 0 && pidAppliedRef.current !== pid) {
			const found = projects.find((p) => p?.videoUrl === pid);
			if (found) {
				pidAppliedRef.current = pid;
				setProjectConfig(found);
			}
		}
	}, [pid, projects]);

	const videoId = useMemo(() => {
		if (projectConfig?.videoUrl) {
			return projectConfig.videoUrl.split('v=')?.[1]?.split('&')?.[0];
		}
		return undefined;
	}, [projectConfig?.videoUrl]);

	const opts: YouTubeProps['opts'] = useMemo(
		() => ({
			playerVars: { autoplay: 0, controls: 0, start: getTime() },
			height: 1,
			width: 1,
		}),
		[videoId]
	);

	const playPause = useCallback(() => {
		const state =
			playerRef.current?.getPlayerState() as unknown as PlayerStates;
		if (state === PlayerStates.PLAYING) {
			playerRef.current?.pauseVideo();
		} else {
			playerRef.current?.playVideo();
		}
	}, []);

	const prevVerse = useCallback(() => {
		const t = timeToVerse(-1);
		if (t > 0) playerRef.current?.seekTo(t, true);
	}, [timeToVerse]);

	const nextVerse = useCallback(() => {
		const t = timeToVerse(+1);
		if (t > 0) playerRef.current?.seekTo(t, true);
	}, [timeToVerse]);

	const onClickProject = useCallback(
		(p: ProjectConfig) => {
			setProjectConfig(p);
			const qs = searchParams.toString();
			navigate(
				`/mqbind/${encodeURIComponent(p.videoUrl)}${qs ? `?${qs}` : ''}`,
				{ replace: true }
			);
			setProjectMenuOpen(false);
		},
		[navigate, searchParams]
	);

	// Auto-select first project when no pid
	useEffect(() => {
		if (projects.length > 0 && !pid) {
			const random = projects[~~(Math.random() * projects.length)];
			onClickProject(random);
		}
	}, [projects]);

	// Poll current time
	useEffect(() => {
		const timer = setInterval(() => {
			const t = playerRef.current?.getCurrentTime() as unknown as number;
			setCurrentTime(t || 0);
		}, 10);
		return () => clearInterval(timer);
	}, []);

	const handleStateChange: YouTubeProps['onStateChange'] = (
		e: YouTubeEvent<number>
	) => {
		if (e.target) {
			setVideoStatus({
				duration: e.target.getDuration() as unknown as number,
				playStatus: e.target.getPlayerState() as unknown as PlayerStates,
			});
		}
	};

	if (!isLandscape) {
		return (
			<RotateOverlay>
				<RotateIconWrapper>📱</RotateIconWrapper>
				<RotateTitle>Rotate your device</RotateTitle>
				<RotateSubtitle>This player works in landscape mode</RotateSubtitle>
			</RotateOverlay>
		);
	}

	return (
		<TranslationVisibilityProvider>
			<Page>
				{/* Hidden audio player */}
				<HiddenPlayer>
					{videoId && (
						<YouTube
							videoId={videoId}
							opts={opts}
							onStateChange={handleStateChange}
							onReady={(e) => {
								console.log('MobileQBind: player ready');
								playerRef.current = e.target;
								setVideoStatus({
									duration: e.target.getDuration() as unknown as number,
									playStatus:
										e.target.getPlayerState() as unknown as PlayerStates,
								});
							}}
						/>
					)}
				</HiddenPlayer>

				{/* Top bar */}
				<TopBar>
					<ProjectButton onClick={() => setProjectMenuOpen(true)}>
						<MenuOutlined />
						<span
							style={{
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{projectConfig?.title || '—'}
						</span>
					</ProjectButton>

					<VerseKeyBadge>{verse?.verse_key || '—'}</VerseKeyBadge>

					<TopActions>
						<TopBtn
							icon={<TranslationOutlined />}
							title="Change translation"
							onClick={() => setTranslationMenuOpen(true)}
						/>
						<TopBtn
							icon={<BookOutlined />}
							title="Tafsir"
							disabled={!verse}
							onClick={() =>
								verse && setTafsirConfig({ verseKey: verse.verse_key })
							}
						/>
					</TopActions>
				</TopBar>

				{/* Main content: Arabic | Translation */}
				<ContentRow>
					<ArabicPanel onClick={playPause}>
						<ArabicScroll>
							{verse ? (
								<ArabicText key={verse.verse_key}>
									{verse.text_uthmani}
								</ArabicText>
							) : (
								<EmptyVerseHint>
									{!projectConfig ? (
										projects.length === 0 ? (
											<Spin />
										) : (
											'Select a recitation'
										)
									) : (
										'Press ▶ to start'
									)}
								</EmptyVerseHint>
							)}
						</ArabicScroll>
					</ArabicPanel>

					<TranslationPanel onClick={playPause}>
						{verse?.translation ? (
							<TranslationScroll
								key={verse.verse_key}
								dangerouslySetInnerHTML={{
									__html: sanitizeHtml(verse.translation),
								}}
							/>
						) : (
							<EmptyVerseHint style={{ margin: 'auto' }}>
								{verse ? '—' : ''}
							</EmptyVerseHint>
						)}
					</TranslationPanel>
				</ContentRow>

				{/* Playback controls */}
				<ControlsBar>
					<CtrlBtn
						icon={<StepBackwardOutlined />}
						onClick={prevVerse}
						disabled={timeToVerse(-1) < 0}
					/>
					<PlayBtn
						icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
						onClick={playPause}
						disabled={!videoId}
					/>
					<CtrlBtn
						icon={<StepForwardOutlined />}
						onClick={nextVerse}
						disabled={timeToVerse(1) < 0}
					/>

					<SliderWrapper>
						<Slider
							min={0}
							max={videoStatus?.duration || 1}
							value={currentTime}
							tooltip={{ open: false }}
							onChange={(t) => {
								playerRef.current?.seekTo(t, true);
							}}
							style={{ margin: '0 4px' }}
						/>
					</SliderWrapper>

					<TimeLabel>
						{formatDuration(currentTime)} /{' '}
						{formatDuration(videoStatus?.duration || 0)}
					</TimeLabel>
				</ControlsBar>

				{/* Project selector */}
				<Drawer
					placement="bottom"
					height="auto"
					style={{ maxHeight: '65vh' }}
					styles={{
						header: {
							background: '#14112b',
							borderBottom: '1px solid rgba(255,255,255,0.08)',
							color: '#c8c0e0',
						},
						body: { background: '#1a1730', padding: '12px' },
					}}
					title={
						<span style={{ color: '#c8c0e0', fontSize: 14 }}>
							Select Recitation
						</span>
					}
					open={projectMenuOpen}
					onClose={() => setProjectMenuOpen(false)}
					closable
				>
					<DrawerContent>
						<ProjectsMenu
							projects={projects}
							projectConfig={projectConfig}
							viewerMode
							onClickProjectItem={onClickProject}
							newProject={() => undefined}
							open={projectMenuOpen}
						/>
					</DrawerContent>
				</Drawer>

				{/* Translation selector */}
				<Drawer
					placement="bottom"
					height="auto"
					style={{ maxHeight: '75vh' }}
					styles={{
						header: {
							background: '#14112b',
							borderBottom: '1px solid rgba(255,255,255,0.08)',
						},
						body: { padding: 0 },
					}}
					title={
						<span style={{ color: '#c8c0e0', fontSize: 14 }}>
							Change Translation
						</span>
					}
					open={translationMenuOpen}
					onClose={() => setTranslationMenuOpen(false)}
					closable
				>
					<TranslationSelectionUI />
				</Drawer>

				{/* Tafsir */}
				<Drawer
					placement="bottom"
					height="auto"
					style={{ maxHeight: '75vh' }}
					styles={{
						header: {
							background: '#14112b',
							borderBottom: '1px solid rgba(255,255,255,0.08)',
						},
						body: { padding: '16px' },
					}}
					title={
						<span style={{ color: '#c8c0e0', fontSize: 14 }}>
							Tafsir — Verse {tafsirConfig?.verseKey || ''}
						</span>
					}
					open={Boolean(tafsirConfig)}
					onClose={() => setTafsirConfig(undefined)}
					closable
				>
					<TafsirByVerse tafsirConfig={tafsirConfig} />
				</Drawer>
			</Page>
		</TranslationVisibilityProvider>
	);
};

export default MobileQBind;
