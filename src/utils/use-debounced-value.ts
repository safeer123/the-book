import { useEffect, useState } from 'react';

// Long enough to skip the in-between keystrokes of a word, short enough
// that results still feel live.
export const SEARCH_DEBOUNCE_MS = 250;

// Search inputs stay controlled by the raw value (so typing never lags);
// the filtering/searching reads this debounced copy instead. Clearing the
// field applies at once — waiting to show "everything" again only feels
// sluggish.
export const useDebouncedValue = (
	value: string,
	delay = SEARCH_DEBOUNCE_MS
): string => {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		if (value === '') {
			setDebounced(value);
			return undefined;
		}
		const timer = window.setTimeout(() => setDebounced(value), delay);
		return () => window.clearTimeout(timer);
	}, [value, delay]);

	return debounced;
};
