import React from 'react';
import sanitizeHtml from 'sanitize-html';
import { TranslationContainer, TranslationHighlight } from './styles';

const CurrentVerseTranslationText = ({
	trText,
	searchKey,
}: {
	trText: string;
	searchKey?: string;
}) => {
	const getSanitizedHtml = (text: string, key?: string) => {
		let htmlOut = sanitizeHtml(text);
		if (key && key.trim()) {
			const index = htmlOut.toLowerCase().indexOf(key.toLowerCase());
			if (index !== -1) {
				htmlOut =
					htmlOut.substring(0, index) +
					"<span class='text-highlight'>" +
					htmlOut.substring(index, index + key.length) +
					'</span>' +
					htmlOut.substring(index + key.length);
			}
		}
		return htmlOut;
	};

	return (
		<TranslationContainer>
			<TranslationHighlight
				dangerouslySetInnerHTML={{
					__html: getSanitizedHtml(trText, searchKey),
				}}
			/>
		</TranslationContainer>
	);
};

export default CurrentVerseTranslationText;
