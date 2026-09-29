import { ChapterItem, ProjectConfig } from 'types';
import { getChapterIdForProject } from 'utils/project-utils';

export const BASE_PATH = '/msuras';

const LAST_READ_KEY = 'msuras-last-read';
const TRANSLATION_KEY = 'msuras-translation';
const RECITER_KEY = 'msuras-reciter';
const PREFS_KEY = 'msuras-reader-prefs';

// Arabic harakat, Quranic annotation marks and tatweel — stripped so a
// query typed without diacritics still matches the fully-voweled name.
const ARABIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

// Lowercase, drop diacritics and everything that isn't a letter/digit, so
// "al baqara", "Al-Baqarah" and "albaqarah" all line up, as do "ali imran"
// and "Ali 'Imran".
export const normalizeForSearch = (text: string): string =>
	text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(ARABIC_MARKS, '')
		.replace(/[أإآٱ]/g, 'ا')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]/gu, '');

// Matches by sura number (exact), transliterated name, English meaning or
// Arabic name. A leading "al"/"an"/"ash"… is optional on either side, so
// "baqarah" finds "Al-Baqarah" and "alfatiha" finds "Al-Fatihah".
export const filterChapters = (
	chapters: ChapterItem[],
	query: string
): ChapterItem[] => {
	const trimmed = query.trim();
	if (!trimmed) return chapters;

	if (/^\d+$/.test(trimmed)) {
		const num = Number(trimmed);
		return chapters.filter((c) => c.id === num);
	}

	const q = normalizeForSearch(trimmed);
	if (!q) return chapters;
	return chapters.filter((c) =>
		[c.name_simple, c.translated_name?.name || '', c.name_arabic].some(
			(field) => normalizeForSearch(field).includes(q)
		)
	);
};

// "2:255" / "2 255" → jump straight to that verse, if it exists.
export const parseVerseJump = (
	query: string,
	chapters: ChapterItem[]
): { chapterId: number; verse: number } | undefined => {
	const match = query.trim().match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/);
	if (!match) return undefined;
	const chapterId = Number(match[1]);
	const verse = Number(match[2]);
	const chapter = chapters.find((c) => c.id === chapterId);
	if (!chapter || verse < 1 || verse > chapter.verses_count) return undefined;
	return { chapterId, verse };
};

// localStorage may be unavailable (private mode, blocked site data) — every
// read/write is best-effort and the page works without it.
const readJSON = <T>(key: string): T | undefined => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : undefined;
	} catch {
		return undefined;
	}
};

const writeJSON = (key: string, value: unknown) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// ignore
	}
};

export interface LastRead {
	chapterId: number;
	verse: number;
}

// Lets the list's "continue reading" follow saves as they happen, and pick
// up ones made in another tab (or while this one sat in the background).
export const subscribeLastRead = (onChange: () => void) => {
	const onStorage = (e: StorageEvent) => {
		if (e.key === null || e.key === LAST_READ_KEY) onChange();
	};
	const onVisible = () => {
		if (document.visibilityState === 'visible') onChange();
	};
	window.addEventListener('storage', onStorage);
	window.addEventListener('pageshow', onChange);
	window.addEventListener(LAST_READ_KEY, onChange);
	document.addEventListener('visibilitychange', onVisible);
	return () => {
		window.removeEventListener('storage', onStorage);
		window.removeEventListener('pageshow', onChange);
		window.removeEventListener(LAST_READ_KEY, onChange);
		document.removeEventListener('visibilitychange', onVisible);
	};
};

// The raw string, so useSyncExternalStore gets a stable snapshot.
export const getLastReadSnapshot = () => {
	try {
		return localStorage.getItem(LAST_READ_KEY);
	} catch {
		return null;
	}
};

export const parseLastRead = (raw: string | null): LastRead | undefined => {
	try {
		const value = raw ? (JSON.parse(raw) as LastRead) : undefined;
		return value && value.chapterId > 0 && value.verse > 0 ? value : undefined;
	} catch {
		return undefined;
	}
};

export const saveLastRead = (value: LastRead) => {
	writeJSON(LAST_READ_KEY, value);
	window.dispatchEvent(new Event(LAST_READ_KEY));
};

export const getSavedTranslation = () => readJSON<string>(TRANSLATION_KEY);
export const saveTranslation = (tr: string) => writeJSON(TRANSLATION_KEY, tr);

export const getPreferredReciter = () => readJSON<string>(RECITER_KEY);
export const savePreferredReciter = (reciter: string) =>
	writeJSON(RECITER_KEY, reciter);

export const getReaderPrefs = <T>() => readJSON<T>(PREFS_KEY);
export const saveReaderPrefs = (prefs: unknown) => writeJSON(PREFS_KEY, prefs);

export const chapterOfProject = (project: ProjectConfig | undefined) =>
	project ? getChapterIdForProject(project) : undefined;

export const verseNumOf = (verseKey: string | undefined) =>
	verseKey ? Number(verseKey.split(':')[1]) : undefined;

// Whether the reader was opened by tapping a sura in the list (so "back"
// can pop history, keeping the list's scroll and query), versus landing on
// a sura directly from a shared link. Module-level on purpose: it only
// needs to survive the in-app route change, not a reload.
let openedFromList = false;
export const markOpenedFromList = (value: boolean) => {
	openedFromList = value;
};
export const wasOpenedFromList = () => openedFromList;

// The list's query and scroll offset, restored when coming back from a sura.
export const listViewState = { query: '', scrollTop: 0 };

// ─── Desktop ⇄ mobile URL mapping ────────────────────────────────────────────
//
// /suras keeps its whole state in the query string:
//   k     search key — a sura number ("2"), verse key ("2:255"), verse range
//         ("2:5-10"), or free text ("mercy")
//   only  "ch" | "ve" — what `k` should match
//   w, c  full-word / match-case flags for free-text search
//   tr    translation id
// /msuras reads a sura at /msuras/:id, lands on a verse with ?v=, searches
// with ?q=, and shares `tr`.

const SURA_NUM = /^(\d{1,3})$/;
const VERSE_KEY = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/;

const withQuery = (path: string, params: URLSearchParams) => {
	const search = params.toString();
	return search ? `${path}?${search}` : path;
};

const validSura = (n: number) => Number.isInteger(n) && n >= 1 && n <= 114;

export const desktopToMobileUrl = (search: string): string => {
	const params = new URLSearchParams(search);
	const out = new URLSearchParams();
	const tr = params.get('tr');
	if (tr) out.set('tr', tr);

	// Only the first of several comma-separated keys can be shown on a
	// phone; /suras shows them together, but one is a sensible landing spot.
	const key = (params.get('k') || '').split(',')[0].trim();
	if (!key) return withQuery(BASE_PATH, out);

	const sura = key.match(SURA_NUM);
	if (sura && validSura(Number(sura[1]))) {
		return withQuery(`${BASE_PATH}/${Number(sura[1])}`, out);
	}

	const verse = key.match(VERSE_KEY);
	if (verse && validSura(Number(verse[1]))) {
		const v = Number(verse[2]);
		if (v > 1) out.set('v', String(v));
		return withQuery(`${BASE_PATH}/${Number(verse[1])}`, out);
	}

	out.set('q', key);
	return withQuery(BASE_PATH, out);
};

export const mobileToDesktopUrl = (
	chapterParam: string | undefined,
	search: string
): string => {
	const params = new URLSearchParams(search);
	const out = new URLSearchParams();
	const chapterId = Number(chapterParam);
	const v = Number(params.get('v'));
	const q = params.get('q')?.trim();

	if (chapterParam && validSura(chapterId)) {
		if (v > 0) {
			out.set('k', `${chapterId}:${v}`);
			out.set('only', 've');
		} else {
			out.set('k', String(chapterId));
			out.set('only', 'ch');
		}
		out.set('w', '0');
		out.set('c', '0');
	} else if (q) {
		out.set('k', q);
	}
	const tr = params.get('tr');
	if (tr) out.set('tr', tr);
	return withQuery('/suras', out);
};

// `?view=desktop` / `?view=mobile` pins a layout for the rest of the tab's
// session (e.g. a phone user who wants the full /suras page, or someone
// checking the mobile page on a laptop), overriding device detection.
const VIEW_KEY = 'preferred-view';
export type ViewMode = 'desktop' | 'mobile';

export const resolveViewMode = (
	search: string,
	isPhoneDevice: boolean
): ViewMode => {
	const requested = new URLSearchParams(search).get('view');
	if (requested === 'desktop' || requested === 'mobile') {
		try {
			sessionStorage.setItem(VIEW_KEY, requested);
		} catch {
			// ignore
		}
		return requested;
	}
	try {
		const pinned = sessionStorage.getItem(VIEW_KEY);
		if (pinned === 'desktop' || pinned === 'mobile') return pinned;
	} catch {
		// ignore
	}
	return isPhoneDevice ? 'mobile' : 'desktop';
};

export const stripViewParam = (search: string): string => {
	const params = new URLSearchParams(search);
	params.delete('view');
	const out = params.toString();
	return out ? `?${out}` : '';
};
