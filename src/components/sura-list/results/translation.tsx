import styled from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import { Button, Tooltip } from 'antd';
import { TafsirConfig } from 'types';
import { isMobile } from 'react-device-detect';
import { VerseTranslationSelector } from './translation-selector';
import { useTranslationVisibility } from '../../../context/translation-visibility-context';

const TRANSLATION_CLASSNAME = 'translation-text';
const TRANSLATION_SMALL_CLASSNAME = 'translation-text-small';
const TRANSLATION_LENGTH_LIMIT = 650;

const getTransaltionHTML = (tr: string, highlightKey?: string) => {
	let htmlOut = sanitizeHtml(tr);
	if (highlightKey && highlightKey.trim()) {
		const index = htmlOut.toLowerCase().indexOf(highlightKey.toLowerCase());
		if (index !== -1) {
			htmlOut =
				htmlOut.substring(0, index) +
				"<span class='text-highlight'>" +
				htmlOut.substring(index, index + highlightKey.length) +
				'</span>' +
				htmlOut.substring(index + highlightKey.length);
		}
	}
	return htmlOut;
};

const TranslationContent = styled.div`
	color: rgb(7, 1, 65);
	font-size: 24px;
	letter-spacing: 0.01in;
`;

const ItemsWrapper = styled.div`
	display: flex;
	align-items: center;
`;

interface Props {
	trText: string;
	verseKey: string;
	searchKey?: string;
	textAnimationClass?: string;
	setTafsirConfig: React.Dispatch<
		React.SetStateAction<TafsirConfig | undefined>
	>;
}

export const VerseTranslation = ({
	trText,
	verseKey,
	searchKey,
	textAnimationClass,
	setTafsirConfig,
}: Props) => {
	const { hideTranslations } = useTranslationVisibility();
	const tafsirButton = (
		<Button
			className="verse-tafsir-btn"
			type="text"
			onClick={() => {
				setTafsirConfig({ verseKey });
			}}
		>
			{'📖'}
		</Button>
	);
	return (
		<TranslationContent
			className={`${textAnimationClass || ''} ${TRANSLATION_CLASSNAME}${
				trText?.length > TRANSLATION_LENGTH_LIMIT
					? ` ${TRANSLATION_SMALL_CLASSNAME}`
					: ''
			}`}
		>
			{!hideTranslations && (
				<span
					className="translation-text-content"
					dangerouslySetInnerHTML={{
						__html: getTransaltionHTML(trText, searchKey),
					}}
				/>
			)}
			{isMobile ? (
				tafsirButton
			) : (
				<ItemsWrapper>
					<Tooltip title="Tafsir" placement="bottom">
						{tafsirButton}
					</Tooltip>
					<VerseTranslationSelector
						trText={trText}
						searchKey={searchKey}
						key={'translation-selector'}
					/>
				</ItemsWrapper>
			)}
		</TranslationContent>
	);
};
