import { useEffect, useRef } from 'react';

interface MediaKeyHandlers {
	enabled: boolean;
	isPlaying: boolean;
	playPause: () => void;
	next?: () => void;
	prev?: () => void;
}

type MediaAction = 'playPause' | 'play' | 'pause' | 'next' | 'prev';

// Media keys as `KeyboardEvent.key`, with the legacy `keyCode`s that some
// TV browsers (Android TV / Google TV, Tizen, webOS) still send instead.
const KEY_ACTIONS: Record<string, MediaAction> = {
	MediaPlayPause: 'playPause',
	MediaPlay: 'play',
	MediaPause: 'pause',
	MediaStop: 'pause',
	MediaTrackNext: 'next',
	MediaTrackPrevious: 'prev',
	MediaFastForward: 'next',
	MediaRewind: 'prev',
};
const KEYCODE_ACTIONS: Record<number, MediaAction> = {
	179: 'playPause',
	415: 'play',
	19: 'pause',
	178: 'pause',
	413: 'pause',
	176: 'next',
	177: 'prev',
	417: 'next',
	412: 'prev',
};

const SESSION_ACTIONS: [MediaSessionAction, MediaAction][] = [
	['play', 'play'],
	['pause', 'pause'],
	['stop', 'pause'],
	['nexttrack', 'next'],
	['previoustrack', 'prev'],
];

/**
 * Lets hardware media keys — a TV remote's play/pause, a keyboard's media
 * keys, headset buttons — control the recitation while it's active.
 */
export const useMediaKeys = (handlers: MediaKeyHandlers) => {
	const ref = useRef(handlers);
	ref.current = handlers;
	const { enabled } = handlers;

	useEffect(() => {
		if (!enabled) return undefined;

		const run = (action: MediaAction) => {
			const { isPlaying, playPause, next, prev } = ref.current;
			if (action === 'next') next?.();
			else if (action === 'prev') prev?.();
			else if (
				action === 'playPause' ||
				(action === 'play' && !isPlaying) ||
				(action === 'pause' && isPlaying)
			) {
				playPause();
			}
		};

		const onKeyDown = (e: KeyboardEvent) => {
			const action = KEY_ACTIONS[e.key] || KEYCODE_ACTIONS[e.keyCode];
			if (!action) return;
			e.preventDefault();
			run(action);
		};
		document.addEventListener('keydown', onKeyDown);

		const session =
			typeof navigator !== 'undefined' && 'mediaSession' in navigator
				? navigator.mediaSession
				: undefined;
		SESSION_ACTIONS.forEach(([name, action]) => {
			try {
				session?.setActionHandler(name, () => run(action));
			} catch {
				// Not every browser supports every action.
			}
		});

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			SESSION_ACTIONS.forEach(([name]) => {
				try {
					session?.setActionHandler(name, null);
				} catch {
					// See above.
				}
			});
		};
	}, [enabled]);
};
