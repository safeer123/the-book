/* eslint-disable @typescript-eslint/no-floating-promises */
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { ProjectConfig, VideoStatusInfo } from 'types';
import { useProjectStore } from 'components/video-text-binding/use-project-store';
import { useVerseBinding } from 'components/video-text-binding/use-verse-binding';
import {
	buildChapterRecitations,
	ChapterRecitation,
} from 'utils/project-utils';
import FloatingRecitePanel from './floating-panel';

const POLL_INTERVAL_MS = 200;

interface RecitePlayerContextValue {
	recitationsByChapter: Map<number, ChapterRecitation[]>;
	activeProject: ProjectConfig | undefined;
	currentVerseKey: string | undefined;
	isPlaying: boolean;
	start: (project: ProjectConfig, verseKey: string) => void;
}

// `Results` (and the recite/translation buttons it renders) is shared with
// pages that don't mount a RecitePlayerProvider (e.g. /qbind's own player),
// so this falls back to an inert default instead of throwing — recite
// affordances simply stay dormant on those pages.
const inertRecitePlayerValue: RecitePlayerContextValue = {
	recitationsByChapter: new Map(),
	activeProject: undefined,
	currentVerseKey: undefined,
	isPlaying: false,
	start: () => undefined,
};

const RecitePlayerContext = createContext<RecitePlayerContextValue>(
	inertRecitePlayerValue
);

export const useRecitePlayer = (): RecitePlayerContextValue =>
	useContext(RecitePlayerContext);

const getVideoId = (videoUrl: string | undefined) =>
	videoUrl?.split('v=')?.[1]?.split('&')?.[0];

const isFullyVisible = (el: HTMLElement) => {
	const rect = el.getBoundingClientRect();
	return rect.top >= 0 && rect.bottom <= window.innerHeight;
};

const noop = () => undefined;

export const RecitePlayerProvider = ({ children }: { children: ReactNode }) => {
	const [activeProject, setActiveProject] = useState<
		ProjectConfig | undefined
	>();
	const [panelOpen, setPanelOpen] = useState(false);
	const [pendingStart, setPendingStart] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [videoStatus, setVideoStatus] = useState<VideoStatusInfo | undefined>();

	const playerRef = useRef<YouTubePlayer | null>(null);
	const pendingSeekRef = useRef<number | undefined>(undefined);

	const { projects } = useProjectStore({
		setProjectConfig: noop,
		viewerMode: true,
	});
	const recitationsByChapter = useMemo(
		() => buildChapterRecitations(projects),
		[projects]
	);

	const { verses, timeToVerse } = useVerseBinding({
		currentTime,
		bindingConfig: activeProject?.bindingConfig || [],
	});
	const currentVerseKey = verses[0]?.verse_key;
	const isPlaying = videoStatus?.playStatus === PlayerStates.PLAYING;
	const videoId = useMemo(
		() => getVideoId(activeProject?.videoUrl),
		[activeProject?.videoUrl]
	);

	const start = useCallback(
		(project: ProjectConfig, verseKey: string) => {
			const t =
				project.bindingConfig.find((b) => b.k.split(',').includes(verseKey))
					?.t ?? 0;
			setPanelOpen(true);
			if (activeProject?.videoUrl === project.videoUrl && playerRef.current) {
				playerRef.current.seekTo(t, true);
				playerRef.current.playVideo();
				return;
			}
			pendingSeekRef.current = t;
			setPendingStart(t);
			setActiveProject(project);
		},
		[activeProject?.videoUrl]
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

	const seekStep = useCallback(
		(step: number) => {
			const t = timeToVerse(step);
			if (t > 0) playerRef.current?.seekTo(t, true);
		},
		[timeToVerse]
	);

	const next = useCallback(() => seekStep(1), [seekStep]);
	const prev = useCallback(() => seekStep(-1), [seekStep]);

	const stop = useCallback(() => {
		playerRef.current?.pauseVideo();
		playerRef.current = null;
		pendingSeekRef.current = undefined;
		setActiveProject(undefined);
		setVideoStatus(undefined);
		setCurrentTime(0);
		setPanelOpen(false);
	}, []);

	const onReady = useCallback((e: YouTubeEvent<number>) => {
		playerRef.current = e.target;
		if (pendingSeekRef.current !== undefined) {
			e.target.seekTo(pendingSeekRef.current, true);
			pendingSeekRef.current = undefined;
		}
		e.target.playVideo();
		setVideoStatus({
			duration: e.target.getDuration() as unknown as number,
			playStatus: e.target.getPlayerState() as unknown as PlayerStates,
		});
	}, []);

	const onStateChange = useCallback((e: YouTubeEvent<number>) => {
		if (!e.target) return;
		setVideoStatus({
			duration: e.target.getDuration() as unknown as number,
			playStatus: e.target.getPlayerState() as unknown as PlayerStates,
		});
	}, []);

	useEffect(() => {
		if (!activeProject) return undefined;
		const timer = setInterval(() => {
			const t = playerRef.current?.getCurrentTime() as unknown as number;
			setCurrentTime(t || 0);
		}, POLL_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [activeProject]);

	useEffect(() => {
		if (!currentVerseKey) return;
		const el = document.getElementById(`ve-${currentVerseKey}`);
		if (el && !isFullyVisible(el)) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [currentVerseKey]);

	const value = useMemo<RecitePlayerContextValue>(
		() => ({
			recitationsByChapter,
			activeProject,
			currentVerseKey,
			isPlaying,
			start,
		}),
		[recitationsByChapter, activeProject, currentVerseKey, isPlaying, start]
	);

	return (
		<RecitePlayerContext.Provider value={value}>
			{children}
			<FloatingRecitePanel
				activeProject={activeProject}
				videoId={videoId}
				startSeconds={pendingStart}
				panelOpen={panelOpen}
				setPanelOpen={setPanelOpen}
				isPlaying={isPlaying}
				onReady={onReady}
				onStateChange={onStateChange}
				playPause={playPause}
				next={next}
				prev={prev}
				stop={stop}
				hasNext={timeToVerse(1) > 0}
				hasPrev={timeToVerse(-1) > 0}
			/>
		</RecitePlayerContext.Provider>
	);
};
