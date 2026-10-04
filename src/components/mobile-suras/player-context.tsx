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
import styled from 'styled-components';
import YouTubePlayer from 'youtube-player';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { YouTubePlayer as YouTubePlayerType } from 'youtube-player/dist/types';
import { ProjectConfig } from 'types';
import { useProjectStore } from 'components/video-text-binding/use-project-store';
import { useVerseBinding } from 'components/video-text-binding/use-verse-binding';
import {
	buildChapterRecitations,
	ChapterRecitation,
} from 'utils/project-utils';
import { useMediaKeys } from 'utils/use-media-keys';

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
	// Get a sura's recitations ready to play on the next tap.
	prepare: (chapterId: number) => void;
	start: (project: ProjectConfig, verseKey: string) => void;
	playPause: () => void;
	next: () => void;
	prev: () => void;
	stop: () => void;
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

// The iframe API's own player object. Its methods run synchronously, unlike
// youtube-player's promise-wrapped proxies, which matters for starting
// playback inside a tap (see `prepare`).
interface RawPlayer {
	playVideo: () => void;
	pauseVideo: () => void;
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
	getPlayerState: () => number;
	getCurrentTime: () => number;
}

// Audio-only, same as /mqbind: a phone-width bar has no room for a
// legible video.
const HiddenPlayer = styled.div`
	position: fixed;
	left: -9999px;
	top: 0;
	width: 1px;
	height: 1px;
	overflow: hidden;
	opacity: 0;
	pointer-events: none;
`;

const noop = () => undefined;

// Most suras have one or two recitations; beyond this many, the rest load
// on demand rather than each holding an iframe.
const MAX_CUED_PLAYERS = 4;

interface PooledPlayer {
	wrapper: YouTubePlayerType;
	mount: HTMLDivElement;
	raw?: RawPlayer;
}

export const MobilePlayerProvider = ({ children }: { children: ReactNode }) => {
	const [activeProject, setActiveProject] = useState<
		ProjectConfig | undefined
	>();
	const [currentTime, setCurrentTime] = useState(0);
	const [playStatus, setPlayStatus] = useState<PlayerStates | undefined>();

	const hostRef = useRef<HTMLDivElement>(null);
	// One hidden player per recitation of the sura being read, keyed by
	// video id, plus whichever one is playing.
	const poolRef = useRef(new Map<string, PooledPlayer>());
	const activeIdRef = useRef<string | undefined>();

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

	const activePlayer = () =>
		activeIdRef.current
			? poolRef.current.get(activeIdRef.current)?.raw
			: undefined;

	const createPlayer = useCallback((videoId: string) => {
		const host = hostRef.current;
		if (!host) return undefined;
		const mount = document.createElement('div');
		host.appendChild(mount);
		const wrapper = YouTubePlayer(mount, {
			videoId,
			width: 1,
			height: 1,
			playerVars: { autoplay: 0, controls: 0, playsinline: 1 },
		});
		const entry: PooledPlayer = { wrapper, mount };
		wrapper.on('ready', (e) => {
			entry.raw = e.target as unknown as RawPlayer;
		});
		wrapper.on('stateChange', (e) => {
			if (activeIdRef.current === videoId) {
				setPlayStatus(e.data as PlayerStates);
			}
		});
		poolRef.current.set(videoId, entry);
		return entry;
	}, []);

	const disposePlayer = useCallback((videoId: string) => {
		const entry = poolRef.current.get(videoId);
		if (!entry) return;
		poolRef.current.delete(videoId);
		entry.wrapper.destroy();
		entry.mount.remove();
	}, []);

	// Mobile browsers (iOS Safari above all) only let audio start from
	// within a tap. Creating the player on the tap and calling play once
	// it had loaded was too late, so the first tap only ever reached a
	// paused player. Instead, the sura being read has its recitations
	// loaded ahead of time, and a tap just plays one.
	const prepare = useCallback(
		(chapterId: number) => {
			const wanted = new Set(
				(recitationsByChapter.get(chapterId) || [])
					.slice(0, MAX_CUED_PLAYERS)
					.map((r) => getVideoId(r.project.videoUrl))
					.filter((id): id is string => Boolean(id))
			);
			Array.from(poolRef.current.keys()).forEach((id) => {
				if (!wanted.has(id) && id !== activeIdRef.current) disposePlayer(id);
			});
			wanted.forEach((id) => {
				if (!poolRef.current.has(id)) createPlayer(id);
			});
		},
		[recitationsByChapter, createPlayer, disposePlayer]
	);

	useEffect(() => {
		const pool = poolRef.current;
		return () => {
			Array.from(pool.keys()).forEach(disposePlayer);
		};
	}, [disposePlayer]);

	const start = useCallback(
		(project: ProjectConfig, verseKey: string) => {
			const videoId = getVideoId(project.videoUrl);
			if (!videoId) return;
			const t =
				project.bindingConfig.find((b) => b.k.split(',').includes(verseKey))
					?.t ?? 0;

			const previousId = activeIdRef.current;
			if (previousId && previousId !== videoId) {
				poolRef.current.get(previousId)?.raw?.pauseVideo();
			}
			activeIdRef.current = videoId;

			const entry = poolRef.current.get(videoId) || createPlayer(videoId);
			if (entry?.raw) {
				entry.raw.seekTo(t, true);
				entry.raw.playVideo();
			} else if (entry) {
				// Not loaded yet (a very quick tap, or a sura with more
				// recitations than are kept ready): this queues until it is,
				// and may need a tap on play as the browser sees no gesture.
				entry.wrapper.seekTo(t, true);
				entry.wrapper.playVideo();
			}
			setPlayStatus(undefined);
			setCurrentTime(t);
			setActiveProject(project);
		},
		[createPlayer]
	);

	const playPause = useCallback(() => {
		const player = activePlayer();
		if (!player) return;
		if (player.getPlayerState() === PlayerStates.PLAYING) {
			player.pauseVideo();
		} else {
			player.playVideo();
		}
	}, []);

	const seekStep = useCallback(
		(step: number) => {
			const t = timeToVerse(step);
			// -1 is useVerseBinding's "no such verse"; t === 0 is a real verse.
			if (t >= 0) activePlayer()?.seekTo(t, true);
		},
		[timeToVerse]
	);
	const next = useCallback(() => seekStep(1), [seekStep]);
	const prev = useCallback(() => seekStep(-1), [seekStep]);

	useMediaKeys({
		enabled: Boolean(activeProject),
		isPlaying,
		playPause,
		next,
		prev,
	});

	const stop = useCallback(() => {
		activePlayer()?.pauseVideo();
		activeIdRef.current = undefined;
		setActiveProject(undefined);
		setPlayStatus(undefined);
		setCurrentTime(0);
	}, []);

	useEffect(() => {
		if (!activeProject) return undefined;
		const timer = setInterval(() => {
			const t = activePlayer()?.getCurrentTime();
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
			prepare,
			start,
			playPause,
			next,
			prev,
			stop,
		}),
		[
			recitationsByChapter,
			activeProject,
			currentVerseKey,
			isPlaying,
			timeToVerse,
			prepare,
			start,
			playPause,
			next,
			prev,
			stop,
		]
	);

	return (
		<MobilePlayerContext.Provider value={value}>
			{children}
			{/* Outside any route, so the iframe (and playback) survives moving
			    between the list and a sura. */}
			<HiddenPlayer ref={hostRef} aria-hidden />
		</MobilePlayerContext.Provider>
	);
};
