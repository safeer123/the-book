import { useState } from 'react';
import styled from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import { Button, Tooltip } from 'antd';
import { BulbOutlined, CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { TafsirConfig } from 'types';
import { isPhone } from 'utils/device-utils';
import { VerseTranslationSelector } from './translation-selector';
import { useTranslationVisibility } from '../../../context/translation-visibility-context';
import ReciteButton from '../recite-player/recite-button';

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

const buildExplainPrompt = (verseKey: string, arabicText?: string) =>
	`Explain this ayah from the Quran (${verseKey}):\n\n"${
		arabicText || ''
	}"\n\nPlease cover:\n- Context of revelation and its place within the surah\n- Advanced Arabic grammar and word-by-word analysis\n- Key lessons and reflections\n- How it connects to the surah's overall themes`;

const openExplainChat = (verseKey: string, arabicText?: string) => {
	const prompt = buildExplainPrompt(verseKey, arabicText);
	const url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
	window.open(url, '_blank', 'noopener,noreferrer');
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
`;

interface Props {
	trText: string;
	verseKey: string;
	arabicText?: string;
	searchKey?: string;
	textAnimationClass?: string;
	setTafsirConfig: React.Dispatch<
		React.SetStateAction<TafsirConfig | undefined>
	>;
}

type ActionsProps = Omit<Props, 'textAnimationClass'>;

// Desktop-only verse actions (listen, translation selector, tafsir, explain,
// copy), meant to be rendered in a fixed left-hand rail alongside the verse
// row rather than trailing the translation text, so they line up
// consistently row to row instead of drifting with each verse's wrapped
// text height.
export const VerseActions = ({
	trText,
	verseKey,
	arabicText,
	searchKey,
	setTafsirConfig,
}: ActionsProps) => {
	const [copied, setCopied] = useState(false);

	const copyVerse = () => {
		const plainTr = sanitizeHtml(trText, {
			allowedTags: [],
			allowedAttributes: {},
		});
		const textToCopy = `${
			arabicText ? `${arabicText}\n\n` : ''
		}${plainTr} (${verseKey})`;
		navigator?.clipboard
			?.writeText(textToCopy)
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			})
			.catch(() => {});
	};

	const copyButton = (
		<Button
			className="verse-copy-btn"
			type="text"
			icon={copied ? <CheckOutlined /> : <CopyOutlined />}
			onClick={copyVerse}
		/>
	);

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

	const explainButton = (
		<Button
			className="verse-explain-btn"
			type="text"
			icon={<BulbOutlined />}
			onClick={() => openExplainChat(verseKey, arabicText)}
		/>
	);

	return (
		<>
			<ReciteButton verseKey={verseKey} />
			<VerseTranslationSelector
				trText={trText}
				searchKey={searchKey}
				key={'translation-selector'}
			/>
			<Tooltip title="Tafsir" placement="right">
				{tafsirButton}
			</Tooltip>
			<Tooltip title="Explain with AI" placement="right">
				{explainButton}
			</Tooltip>
			<Tooltip title={copied ? 'Copied!' : 'Copy'} placement="right">
				{copyButton}
			</Tooltip>
		</>
	);
};

export const VerseTranslation = ({
	trText,
	verseKey,
	arabicText,
	searchKey,
	textAnimationClass,
	setTafsirConfig,
}: Props) => {
	const { hideTranslations } = useTranslationVisibility();
	const [copied, setCopied] = useState(false);

	const copyVerse = () => {
		const plainTr = sanitizeHtml(trText, {
			allowedTags: [],
			allowedAttributes: {},
		});
		const textToCopy = `${
			arabicText ? `${arabicText}\n\n` : ''
		}${plainTr} (${verseKey})`;
		navigator?.clipboard
			?.writeText(textToCopy)
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			})
			.catch(() => {});
	};

	const copyButton = (
		<Button
			className="verse-copy-btn"
			type="text"
			icon={copied ? <CheckOutlined /> : <CopyOutlined />}
			onClick={copyVerse}
		/>
	);

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

	const explainButton = (
		<Button
			className="verse-explain-btn"
			type="text"
			icon={<BulbOutlined />}
			onClick={() => openExplainChat(verseKey, arabicText)}
		/>
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
			{isPhone && (
				<ItemsWrapper>
					<ReciteButton verseKey={verseKey} />
					{tafsirButton}
					{explainButton}
					{copyButton}
				</ItemsWrapper>
			)}
		</TranslationContent>
	);
};
