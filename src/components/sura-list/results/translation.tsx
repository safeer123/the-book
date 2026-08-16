import styled from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import { Button, Tooltip } from 'antd';
import { TafsirConfig } from 'types';
import { isPhone } from 'utils/device-utils';
import { VerseTranslationSelector } from './translation-selector';
import { useTranslationVisibility } from '../../../context/translation-visibility-context';
import ReciteButton from '../recite-player/recite-button';
import { VerseRow } from './styles';

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

	[data-theme='dark'] & {
		color: #b0a8c8;
	}
`;

const ItemsWrapper = styled.div`
	display: flex;
	align-items: center;

	@media (min-width: 961px) {
		opacity: 0.4;
		transition: opacity 0.15s ease;

		${VerseRow}:hover & {
			opacity: 1;
		}
	}
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
			{isPhone ? (
				<ItemsWrapper>
					{tafsirButton}
					<ReciteButton verseKey={verseKey} />
				</ItemsWrapper>
			) : (
				<ItemsWrapper>
					<Tooltip title="Tafsir" placement="bottom">
						{tafsirButton}
					</Tooltip>
					<ReciteButton verseKey={verseKey} />
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
