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
import { ProjectConfig } from 'types';
import { useProjectStore } from 'components/video-text-binding/use-project-store';
import { useVerseBinding } from 'components/video-text-binding/use-verse-binding';
import {
	buildChapterRecitations,
	ChapterRecitation,
} from 'utils/project-utils';

const POLL_INTERVAL_MS = 200;

// The mobile reader's own recitation player. It follows the same model as
// /suras' player (a sura-length YouTube recitation bound to verse
// timestamps) but is kept separate so the desktop player stays untouched,
// and it exposes the transport controls the bottom bar needs.
export interface MobilePlayerValue {
	recitationsByChapter: Map<number, ChapterRecitation[]>;
	activeProject: ProjectConfig | undefined;
	currentVerseKey: string | undefined;
	isPlaying: boolean;
	hasNext: boolean;
	hasPrev: boolean;
	videoId: string | undefined;
	startSeconds: number;
	start: (project: ProjectConfig, verseKey: string) => void;
	playPause: () => void;
	next: () => void;
	prev: () => void;
	stop: () => void;
	onReady: (e: YouTubeEvent<number>) => void;
	onStateChange: (e: YouTubeEvent<number>) => void;
}

const MobilePlayerContext = createContext<MobilePlayerValue | undefined>(
	undefined
);

export const useMobilePlayer = (): MobilePlayerValue => {
	const value = useContext(MobilePlayerContext);
	if (!value) {
		throw new Error('useMobilePlayer must be used within MobilePlayerProvider');
	}
	return value;
};

const getVideoId = (videoUrl: string | undefined) =>
	videoUrl?.split('v=')?.[1]?.split('&')?.[0];

const noop = () => undefined;

export const MobilePlayerProvider = ({ children }: { children: ReactNode }) => {
	const [activeProject, setActiveProject] = useState<
		ProjectConfig | undefined
	>();
	const [startSeconds, setStartSeconds] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [playStatus, setPlayStatus] = useState<PlayerStates | undefined>();

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
	const currentVerseKey = activeProject ? verses[0]?.verse_key : undefined;
	const isPlaying = playStatus === PlayerStates.PLAYING;
	const videoId = useMemo(
		() => getVideoId(activeProject?.videoUrl),
		[activeProject?.videoUrl]
	);

	const start = useCallback(
		(project: ProjectConfig, verseKey: string) => {
			const t =
				project.bindingConfig.find((b) => b.k.split(',').includes(verseKey))
					?.t ?? 0;
			if (activeProject?.videoUrl === project.videoUrl && playerRef.current) {
				playerRef.current.seekTo(t, true);
				playerRef.current.playVideo();
				return;
			}
			pendingSeekRef.current = t;
			setStartSeconds(t);
			setCurrentTime(t);
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
			// -1 is useVerseBinding's "no such verse"; t === 0 is a real verse.
			if (t >= 0) playerRef.current?.seekTo(t, true);
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
		setPlayStatus(undefined);
		setCurrentTime(0);
	}, []);

	const onReady = useCallback((e: YouTubeEvent<number>) => {
		playerRef.current = e.target;
		if (pendingSeekRef.current !== undefined) {
			e.target.seekTo(pendingSeekRef.current, true);
			pendingSeekRef.current = undefined;
		}
		e.target.playVideo();
		setPlayStatus(e.target.getPlayerState() as unknown as PlayerStates);
	}, []);

	const onStateChange = useCallback((e: YouTubeEvent<number>) => {
		if (!e.target) return;
		setPlayStatus(e.target.getPlayerState() as unknown as PlayerStates);
	}, []);

	useEffect(() => {
		if (!activeProject) return undefined;
		const timer = setInterval(() => {
			const t = playerRef.current?.getCurrentTime() as unknown as number;
			if (t) setCurrentTime(t);
		}, POLL_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [activeProject]);

	const value = useMemo<MobilePlayerValue>(
		() => ({
			recitationsByChapter,
			activeProject,
			currentVerseKey,
			isPlaying,
			hasNext: timeToVerse(1) >= 0,
			hasPrev: timeToVerse(-1) >= 0,
			videoId,
			startSeconds,
			start,
			playPause,
			next,
			prev,
			stop,
			onReady,
			onStateChange,
		}),
		[
			recitationsByChapter,
			activeProject,
			currentVerseKey,
			isPlaying,
			timeToVerse,
			videoId,
			startSeconds,
			start,
			playPause,
			next,
			prev,
			stop,
			onReady,
			onStateChange,
		]
	);

	return (
		<MobilePlayerContext.Provider value={value}>
			{children}
		</MobilePlayerContext.Provider>
	);
};
