import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Outlet,
	useNavigationType,
	useOutletContext,
	useSearchParams,
} from 'react-router-dom';
import PlayerBar from './player-bar';
import ReciterSheet from './reciter-sheet';
import { MobilePlayerProvider, useMobilePlayer } from './player-context';
import { ReaderPrefsProvider } from './prefs';
import { MobileSurasRoute } from './redirects';
import Toast from './toast';
import {
	chapterOfProject,
	getPreferredReciter,
	getSavedTranslation,
	saveTranslation,
} from './utils';

export interface MobileSurasContext {
	// Start (or resume) recitation at a verse, picking the reciter already
	// playing this sura, else the one the listener chose last time, else
	// asking. `chooseReciter` always asks.
	playFrom: (verseKey: string, chooseReciter?: boolean) => void;
	// Brief confirmation at the bottom of the screen ("Copied", …).
	notify: (text: string) => void;
}

export const useMobileSuras = () => useOutletContext<MobileSurasContext>();

const Shell = () => {
	const [reciterSheetVerse, setReciterSheetVerse] = useState<
		string | undefined
	>();
	const [toast, setToast] = useState<{ text: string; id: number }>();
	const { recitationsByChapter, activeProject, start } = useMobilePlayer();
	const [searchParams, setSearchParams] = useSearchParams();
	const tr = searchParams.get('tr');
	const navigationType = useNavigationType();
	const isFirstRunRef = useRef(true);

	// Remember the chosen translation across visits (the URL alone would be
	// lost by a home-screen shortcut). A `tr` arriving with the page load or
	// a forward navigation (a shared link, a pick in the translation sheet)
	// wins; one resurfacing from history — e.g. "back" to the list after
	// switching translation inside a sura — is stale, so the saved choice
	// replaces it.
	useEffect(() => {
		const isFirstRun = isFirstRunRef.current;
		isFirstRunRef.current = false;
		if (tr && (isFirstRun || navigationType !== 'POP')) {
			saveTranslation(tr);
			return;
		}
		const saved = getSavedTranslation();
		if (saved && saved !== tr) {
			setSearchParams(
				(prev) => {
					prev.set('tr', saved);
					return prev;
				},
				{ replace: true }
			);
		}
		// Only a change of `tr` itself should re-run this.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tr]);

	const playFrom = useCallback(
		(verseKey: string, chooseReciter?: boolean) => {
			const chapterId = Number(verseKey.split(':')[0]);
			const recitations = recitationsByChapter.get(chapterId) || [];
			if (!recitations.length) return;

			if (!chooseReciter) {
				if (activeProject && chapterOfProject(activeProject) === chapterId) {
					start(activeProject, verseKey);
					return;
				}
				const preferred = getPreferredReciter();
				const pick =
					recitations.length === 1
						? recitations[0]
						: recitations.find((r) => r.reciter === preferred);
				if (pick) {
					start(pick.project, verseKey);
					return;
				}
			}
			setReciterSheetVerse(verseKey);
		},
		[recitationsByChapter, activeProject, start]
	);

	const notify = useCallback(
		(text: string) => setToast({ text, id: Date.now() }),
		[]
	);

	const context = useMemo<MobileSurasContext>(
		() => ({ playFrom, notify }),
		[playFrom, notify]
	);

	return (
		<>
			<Outlet context={context} />
			<PlayerBar />
			<ReciterSheet
				verseKey={reciterSheetVerse}
				onClose={() => setReciterSheetVerse(undefined)}
			/>
			<Toast
				key={toast?.id}
				text={toast?.text}
				raised={Boolean(activeProject)}
			/>
		</>
	);
};

// Phone-first reader: /msuras lists the suras, /msuras/:chapterId reads one.
// Both share one recitation player so audio keeps going (with its bottom
// bar) while the listener browses back to the list. Self-contained: it
// reuses the app's data hooks but none of /suras' UI or state.
const MobileSuras = () => {
	// The page has its own theme button; the global floating one would sit
	// on top of the header's actions.
	useEffect(() => {
		const root = document.documentElement;
		root.setAttribute('data-hide-theme-toggle', 'true');
		return () => root.removeAttribute('data-hide-theme-toggle');
	}, []);

	return (
		<MobileSurasRoute>
			<ReaderPrefsProvider>
				<MobilePlayerProvider>
					<Shell />
				</MobilePlayerProvider>
			</ReaderPrefsProvider>
		</MobileSurasRoute>
	);
};

export default MobileSuras;
