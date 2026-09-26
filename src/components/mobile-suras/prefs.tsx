import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { getReaderPrefs, saveReaderPrefs } from './utils';

export type TextSize = 'sm' | 'md' | 'lg';

export interface ReaderPrefs {
	textSize: TextSize;
	showTranslation: boolean;
}

export const TEXT_SIZES: Record<
	TextSize,
	{ arabic: number; translation: number; label: string }
> = {
	sm: { arabic: 24, translation: 15, label: 'Small' },
	md: { arabic: 30, translation: 17, label: 'Medium' },
	lg: { arabic: 36, translation: 20, label: 'Large' },
};

const DEFAULT_PREFS: ReaderPrefs = { textSize: 'md', showTranslation: true };

interface PrefsValue extends ReaderPrefs {
	setPrefs: (update: Partial<ReaderPrefs>) => void;
}

const PrefsContext = createContext<PrefsValue | undefined>(undefined);

export const useReaderPrefs = (): PrefsValue => {
	const value = useContext(PrefsContext);
	if (!value) {
		throw new Error('useReaderPrefs must be used within ReaderPrefsProvider');
	}
	return value;
};

export const ReaderPrefsProvider = ({ children }: { children: ReactNode }) => {
	const [prefs, setPrefsState] = useState<ReaderPrefs>(() => {
		const saved = getReaderPrefs<Partial<ReaderPrefs>>();
		const textSize =
			saved?.textSize && saved.textSize in TEXT_SIZES
				? saved.textSize
				: DEFAULT_PREFS.textSize;
		return {
			textSize,
			showTranslation:
				typeof saved?.showTranslation === 'boolean'
					? saved.showTranslation
					: DEFAULT_PREFS.showTranslation,
		};
	});

	useEffect(() => saveReaderPrefs(prefs), [prefs]);

	const value = useMemo<PrefsValue>(
		() => ({
			...prefs,
			setPrefs: (update) => setPrefsState((prev) => ({ ...prev, ...update })),
		}),
		[prefs]
	);

	return (
		<PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
	);
};
