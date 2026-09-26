// The repo has no global Jest types, so import them explicitly (this ships
// with react-scripts' Jest) rather than adding a dependency.
import { beforeEach, describe, expect, it } from '@jest/globals';
import { ChapterItem } from 'types';
import {
	desktopToMobileUrl,
	filterChapters,
	mobileToDesktopUrl,
	parseVerseJump,
	resolveViewMode,
	stripViewParam,
} from './utils';

const chapter = (
	id: number,
	name_simple: string,
	translated: string,
	name_arabic: string,
	verses_count: number
): ChapterItem => ({
	id,
	name_simple,
	name_arabic,
	verses_count,
	translated_name: { name: translated },
	revelation_place: 'makkah',
	revelation_order: id,
	bismillah_pre: true,
});

const chapters = [
	chapter(1, 'Al-Fatihah', 'The Opener', 'الفاتحة', 7),
	chapter(2, 'Al-Baqarah', 'The Cow', 'البقرة', 286),
	chapter(3, "Ali 'Imran", 'Family of Imran', 'آل عمران', 200),
];

describe('desktopToMobileUrl', () => {
	it('sends the bare page to the list', () => {
		expect(desktopToMobileUrl('')).toBe('/msuras');
	});

	it('maps a sura to its reader, keeping the translation', () => {
		expect(desktopToMobileUrl('?k=2&w=0&c=0&only=ch&tr=131')).toBe(
			'/msuras/2?tr=131'
		);
	});

	it('maps a verse and a verse range to the reader at that verse', () => {
		expect(desktopToMobileUrl('?k=2:255&only=ve')).toBe('/msuras/2?v=255');
		expect(desktopToMobileUrl('?k=2:5-10&only=ve')).toBe('/msuras/2?v=5');
		expect(desktopToMobileUrl('?k=2:1')).toBe('/msuras/2');
	});

	it('maps free-text search to the list search', () => {
		expect(desktopToMobileUrl('?k=mercy&w=0&c=0&tr=20')).toBe(
			'/msuras?tr=20&q=mercy'
		);
	});

	it('lands on the first of several keys', () => {
		expect(desktopToMobileUrl('?k=2:255,3:1')).toBe('/msuras/2?v=255');
	});

	it('treats an out-of-range sura as a search', () => {
		expect(desktopToMobileUrl('?k=200')).toBe('/msuras?q=200');
	});
});

describe('mobileToDesktopUrl', () => {
	it('maps the list and its search', () => {
		expect(mobileToDesktopUrl(undefined, '')).toBe('/suras');
		expect(mobileToDesktopUrl(undefined, '?q=mercy&tr=20')).toBe(
			'/suras?k=mercy&tr=20'
		);
	});

	it('maps a sura and a verse', () => {
		expect(mobileToDesktopUrl('2', '?tr=131')).toBe(
			'/suras?k=2&only=ch&w=0&c=0&tr=131'
		);
		expect(mobileToDesktopUrl('2', '?v=255')).toBe(
			'/suras?k=2%3A255&only=ve&w=0&c=0'
		);
	});

	it('round-trips through the mobile mapping', () => {
		const mobile = desktopToMobileUrl('?k=2:255&only=ve&tr=131');
		const [path, search] = mobile.split('?');
		expect(
			desktopToMobileUrl(
				`?${mobileToDesktopUrl(path.split('/')[2], `?${search}`).split('?')[1]}`
			)
		).toBe(mobile);
	});
});

describe('resolveViewMode', () => {
	beforeEach(() => sessionStorage.clear());

	it('follows the device by default', () => {
		expect(resolveViewMode('', true)).toBe('mobile');
		expect(resolveViewMode('', false)).toBe('desktop');
	});

	it('honours and remembers ?view=', () => {
		expect(resolveViewMode('?view=desktop', true)).toBe('desktop');
		expect(resolveViewMode('', true)).toBe('desktop');
		expect(resolveViewMode('?view=mobile', false)).toBe('mobile');
		expect(resolveViewMode('', false)).toBe('mobile');
	});

	it('strips the override from the query', () => {
		expect(stripViewParam('?view=desktop&k=2')).toBe('?k=2');
		expect(stripViewParam('?view=mobile')).toBe('');
	});
});

describe('filterChapters', () => {
	const names = (q: string) => filterChapters(chapters, q).map((c) => c.id);

	it('matches by number, transliteration, meaning and Arabic', () => {
		expect(names('2')).toEqual([2]);
		expect(names('baqara')).toEqual([2]);
		expect(names('ali imran')).toEqual([3]);
		expect(names('opener')).toEqual([1]);
		expect(names('البقره'.slice(0, 4))).toEqual([2]);
	});

	it('returns everything for an empty query', () => {
		expect(names('  ')).toEqual([1, 2, 3]);
	});
});

describe('parseVerseJump', () => {
	it('accepts valid verse keys only', () => {
		expect(parseVerseJump('2:255', chapters)).toEqual({
			chapterId: 2,
			verse: 255,
		});
		expect(parseVerseJump('2 255', chapters)).toEqual({
			chapterId: 2,
			verse: 255,
		});
		expect(parseVerseJump('1:8', chapters)).toBeUndefined();
		expect(parseVerseJump('mercy', chapters)).toBeUndefined();
	});
});
