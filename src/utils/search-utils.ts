import { SearchConfig } from 'types';

const escapeRegExp = (str: string) => {
	return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
};

const fullWordSearchRegex = (searchKey: string) =>
	`^.*?\\b${searchKey.split(',').join('\\b.*?\\b')}\\b.*?$`;
const wordSearchRegex = (searchKey: string) =>
	`^.*?${searchKey.split(',').join('.*?')}.*?$`;

const verseKeyRegex = /^\d+:\d+$/m;
const verseKeyRangeRegex = /^[1-9][0-9]*:[1-9][0-9]*-[1-9][0-9]*$/m;
const suraNumberRegex = /^[1-9]\d*$/m;

interface Args {
	target: string;
	searchKey: string;
	config: SearchConfig;
}

export const matchVerseKey = (searchKey: string): boolean => {
	return verseKeyRegex.test(searchKey);
};

export const matchVerseKeyRange = (searchKey: string): boolean => {
	return verseKeyRangeRegex.test(searchKey);
};

export const matchSuraNumber = (searchKey: string): boolean => {
	return suraNumberRegex.test(searchKey) && +searchKey <= 114;
};

export const matchKeyword = ({
	target,
	searchKey,
	config: { ignoreCase, fullWord },
}: Args): boolean => {
	const regex = fullWord
		? fullWordSearchRegex(escapeRegExp(searchKey))
		: wordSearchRegex(escapeRegExp(searchKey));
	const flags = ignoreCase ? 'mi' : 'm';
	const testRes = new RegExp(regex, flags).test(target);

	return Boolean(searchKey.trim()) && testRes;
};

export const searchConfigFromURLParams = (
	searchParams: URLSearchParams
): SearchConfig => {
	return {
		fullWord: searchParams?.get('w') === '1',
		ignoreCase: searchParams?.get('c') === '1',
	};
};

export function debounce<Params extends unknown[]>(
	func: (...args: Params) => unknown,
	timeout: number
): (...args: Params) => void {
	let timer: NodeJS.Timeout;
	return (...args: Params) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func(...args);
		}, timeout);
	};
}
