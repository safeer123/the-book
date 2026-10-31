// The repo has no global Jest types, so import them explicitly (this ships
// with react-scripts' Jest) rather than adding a dependency.
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from '@jest/globals';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from './use-debounced-value';

let latest = '';
const Probe = ({ value }: { value: string }) => {
	latest = useDebouncedValue(value);
	return null;
};

describe('useDebouncedValue', () => {
	let root: Root;
	// act() with a sync callback finishes before returning; its return
	// value is only typed as a thenable.
	const render = (value: string) => {
		void act(() => {
			root.render(<Probe value={value} />);
		});
	};
	const wait = (ms: number) => {
		void act(() => {
			jest.advanceTimersByTime(ms);
		});
	};

	beforeEach(() => {
		jest.useFakeTimers();
		root = createRoot(document.createElement('div'));
	});
	afterEach(() => {
		void act(() => root.unmount());
		jest.useRealTimers();
	});

	it('starts with the initial value', () => {
		render('al');
		expect(latest).toBe('al');
	});

	it('only takes the last value once typing pauses', () => {
		render('a');
		render('ab');
		wait(SEARCH_DEBOUNCE_MS - 50);
		render('abc');
		wait(SEARCH_DEBOUNCE_MS - 50);
		expect(latest).toBe('a');
		wait(50);
		expect(latest).toBe('abc');
	});

	it('applies a cleared field immediately', () => {
		render('mercy');
		render('');
		expect(latest).toBe('');
	});
});
