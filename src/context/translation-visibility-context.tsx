import React, { createContext, useState, useContext, ReactNode } from 'react';

export type VerseTextSize = 'big' | 'small';

/** Which part of a verse is hidden. Arabic and translation are never hidden together. */
export type HiddenVerseText = 'none' | 'arabic' | 'translation';

interface TranslationVisibilityContextType {
	hiddenText: HiddenVerseText;
	setHiddenText: (value: HiddenVerseText) => void;
	hideTranslations: boolean;
	hideArabic: boolean;
	textSize: VerseTextSize;
	setTextSize: (size: VerseTextSize) => void;
}

const TranslationVisibilityContext = createContext<
	TranslationVisibilityContextType | undefined
>(undefined);

export const TranslationVisibilityProvider: React.FC<{
	children: ReactNode;
}> = ({ children }) => {
	const [hiddenText, setHiddenText] = useState<HiddenVerseText>('none');
	const [textSize, setTextSize] = useState<VerseTextSize>('big');

	return (
		<TranslationVisibilityContext.Provider
			value={{
				hiddenText,
				setHiddenText,
				hideTranslations: hiddenText === 'translation',
				hideArabic: hiddenText === 'arabic',
				textSize,
				setTextSize,
			}}
		>
			{children}
		</TranslationVisibilityContext.Provider>
	);
};

export const useTranslationVisibility = () => {
	const context = useContext(TranslationVisibilityContext);
	if (context === undefined) {
		throw new Error(
			'useTranslationVisibility must be used within a TranslationVisibilityProvider'
		);
	}
	return context;
};
