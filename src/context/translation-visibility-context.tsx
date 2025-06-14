import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TranslationVisibilityContextType {
	hideTranslations: boolean;
	toggleHideTranslations: () => void;
}

const TranslationVisibilityContext = createContext<
	TranslationVisibilityContextType | undefined
>(undefined);

export const TranslationVisibilityProvider: React.FC<{
	children: ReactNode;
}> = ({ children }) => {
	const [hideTranslations, setHideTranslations] = useState(false);

	const toggleHideTranslations = () => {
		setHideTranslations((prev) => !prev);
	};

	return (
		<TranslationVisibilityContext.Provider
			value={{ hideTranslations, toggleHideTranslations }}
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
