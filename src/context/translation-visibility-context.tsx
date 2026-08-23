import React, { createContext, useState, useContext, ReactNode } from 'react';

export type VerseTextSize = 'big' | 'small';

interface TranslationVisibilityContextType {
	hideTranslations: boolean;
	toggleHideTranslations: () => void;
	textSize: VerseTextSize;
	setTextSize: (size: VerseTextSize) => void;
}

const TranslationVisibilityContext = createContext<
	TranslationVisibilityContextType | undefined
>(undefined);

export const TranslationVisibilityProvider: React.FC<{
	children: ReactNode;
}> = ({ children }) => {
	const [hideTranslations, setHideTranslations] = useState(false);
	const [textSize, setTextSize] = useState<VerseTextSize>('big');

	const toggleHideTranslations = () => {
		setHideTranslations((prev) => !prev);
	};

	return (
		<TranslationVisibilityContext.Provider
			value={{
				hideTranslations,
				toggleHideTranslations,
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
