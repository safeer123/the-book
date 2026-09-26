import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';
import { useTranslations } from 'data/use-translations';
import sanitizeHtml from 'sanitize-html';
import { BISMI, DEFAULT_TRANSLATION_ID } from 'data/constants';
import { useVerses } from 'data/use-verses';
import Sheet from './sheet';
import { TEXT_SIZES, TextSize, useReaderPrefs } from './prefs';

const Section = styled.div`
	& + & {
		margin-top: 20px;
	}
`;

const Label = styled.div`
	margin-bottom: 8px;
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: rgba(7, 1, 65, 0.5);

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

const Segmented = styled.div`
	display: flex;
	padding: 4px;
	gap: 4px;
	border-radius: 14px;
	background: rgba(14, 2, 121, 0.06);

	[data-theme='dark'] & {
		background: rgba(156, 142, 224, 0.12);
	}
`;

const Segment = styled.button<{ $on: boolean }>`
	flex: 1;
	height: 48px;
	border-radius: 10px;
	border: none;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1px;
	color: inherit;
	background: ${({ $on }) => ($on ? '#fff' : 'transparent')};
	box-shadow: ${({ $on }) => ($on ? '0 1px 4px rgba(7, 1, 65, 0.12)' : 'none')};

	[data-theme='dark'] & {
		background: ${({ $on }) => ($on ? '#3a3360' : 'transparent')};
	}

	b {
		font-family: Georgia, 'Times New Roman', serif;
		line-height: 1;
	}

	small {
		font-size: 11px;
		opacity: 0.6;
	}
`;

const Preview = styled.div<{ $arabic: number; $translation: number }>`
	margin-top: 12px;
	padding: 12px 14px;
	border-radius: 14px;
	border: 1px dashed rgba(14, 2, 121, 0.15);

	[data-theme='dark'] & {
		border-color: rgba(156, 142, 224, 0.25);
	}

	p {
		margin: 0;
	}

	p[lang='ar'] {
		font-family: 'Amiri Quran', 'Scheherazade New', serif;
		font-size: ${({ $arabic }) => $arabic}px;
		line-height: 2;
		text-align: right;
	}

	p + p {
		font-size: ${({ $translation }) => $translation}px;
		line-height: 1.6;
		opacity: 0.8;
	}
`;

const ListRow = styled.button`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 12px;
	min-height: 56px;
	padding: 8px 14px;
	border-radius: 14px;
	border: none;
	text-align: left;
	cursor: pointer;
	color: inherit;
	background: rgba(14, 2, 121, 0.05);

	[data-theme='dark'] & {
		background: rgba(156, 142, 224, 0.1);
	}

	/* The text column; .anticon (the chevron) is a span too. */
	> span:not(.anticon) {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	strong {
		font-size: 15px;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	small {
		font-size: 12px;
		opacity: 0.6;
	}
`;

const Switch = styled.span<{ $on: boolean }>`
	flex-shrink: 0;
	position: relative;
	width: 50px;
	height: 30px;
	border-radius: 15px;
	background: ${({ $on }) => ($on ? 'rgb(14, 2, 121)' : 'rgba(7, 1, 65, 0.2)')};
	transition: background-color 0.2s ease;

	[data-theme='dark'] & {
		background: ${({ $on }) => ($on ? '#9c8ee0' : 'rgba(232, 226, 250, 0.2)')};
	}

	&::after {
		content: '';
		position: absolute;
		top: 3px;
		left: ${({ $on }) => ($on ? '23px' : '3px')};
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		transition: left 0.2s ease;
	}
`;

const SIZE_ORDER: TextSize[] = ['sm', 'md', 'lg'];

interface Props {
	open: boolean;
	onClose: () => void;
	onOpenTranslations: () => void;
}

const SettingsSheet = ({ open, onClose, onOpenTranslations }: Props) => {
	const { textSize, showTranslation, setPrefs } = useReaderPrefs();
	const { data } = useTranslations();
	const [searchParams] = useSearchParams();
	const trId = Number(searchParams.get('tr') || DEFAULT_TRANSLATION_ID);
	const current = data?.translations?.find((t) => t.id === trId);
	const size = TEXT_SIZES[textSize];
	// Preview with the reader's actual translation of 1:1, when loaded.
	const { data: verseData } = useVerses();
	const sample = verseData?.ayaByKey?.['1:1'];
	const sampleTranslation = sample?.translation
		? sanitizeHtml(sample.translation.replace(/<sup[^>]*>.*?<\/sup>/g, ''), {
				allowedTags: [],
				allowedAttributes: {},
		  })
		: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';

	return (
		<Sheet title="Reading settings" open={open} onClose={onClose}>
			<Section>
				<Label>Text size</Label>
				<Segmented role="radiogroup" aria-label="Text size">
					{SIZE_ORDER.map((key, i) => (
						<Segment
							key={key}
							type="button"
							role="radio"
							aria-checked={textSize === key}
							$on={textSize === key}
							onClick={() => setPrefs({ textSize: key })}
						>
							<b style={{ fontSize: 14 + i * 4 }}>A</b>
							<small>{TEXT_SIZES[key].label}</small>
						</Segment>
					))}
				</Segmented>
				<Preview $arabic={size.arabic} $translation={size.translation}>
					<p lang="ar" dir="rtl">
						{BISMI}
					</p>
					{showTranslation && <p>{sampleTranslation}</p>}
				</Preview>
			</Section>

			<Section>
				<Label>Translation</Label>
				<ListRow
					type="button"
					role="switch"
					aria-checked={showTranslation}
					onClick={() => setPrefs({ showTranslation: !showTranslation })}
				>
					<span>
						<strong>Show translation</strong>
						<small>Below each verse</small>
					</span>
					<Switch $on={showTranslation} aria-hidden />
				</ListRow>
				<ListRow
					type="button"
					style={{ marginTop: 8 }}
					onClick={onOpenTranslations}
				>
					<span>
						<strong>{current?.name || 'Choose translation'}</strong>
						{current?.language_name && (
							<small>
								{current.language_name.charAt(0).toUpperCase()}
								{current.language_name.slice(1)}
							</small>
						)}
					</span>
					<RightOutlined />
				</ListRow>
			</Section>
		</Sheet>
	);
};

export default SettingsSheet;
