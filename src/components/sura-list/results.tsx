import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import { useVerses } from 'data/use-verses';
import { useChapters } from 'data/use-chapters';
import {
	Button,
	CollapseProps,
	Collapse as CollapseAntd,
	Spin,
	Tooltip,
} from 'antd';
import { ChapterItem, TafsirConfig, Verse, VerseToken } from 'types';
import ChapterTitle from './chapter-title';
import { BISMI } from 'data/constants';
import VerseNumber from './verse-number';
import { debounce } from 'utils/search-utils';
import TafsirDrawer from './tafsir-drawer';
import useURLNavigation from 'data/use-url-navigation';

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

const Collapse = styled(CollapseAntd)`
	border: none;
	background-color: transparent;

	&& .ant-collapse-content {
		background-color: transparent;
		border-top: none;
		border-top: 0.5px dashed #545454;
	}

	&& .ant-collapse-header {
		padding: 0px 0px;
		align-items: center;
	}

	&& .ant-collapse-item {
		border-bottom: none;
		-webkit-box-shadow: -15px 17px 9px -18px rgba(0, 0, 0, 0.75);
		-moz-box-shadow: -15px 17px 9px -18px rgba(0, 0, 0, 0.75);
		box-shadow: -15px 17px 9px -18px rgba(0, 0, 0, 0.75);
	}
`;

const SpinWrapper = styled.div`
	width: 100%;
	text-align: center;
	height: 100%;
	position: relative;
	.ant-spin {
		margin: 20%;
	}
`;

const ArabicVerseWrapper = styled.div`
	margin: 16px;
`;

const ArabicVerseText = styled.span`
	font-family: 'Amiri Quran';
	color: rgb(14, 2, 121);
	font-size: 42px;
	font-weight: 400;
	font-style: normal;

	svg {
		width: 36px;
		margin-bottom: -10px;
		margin-right: 16px;
		cursor: pointer;
	}
`;

const BismiWrapper = styled.div`
	margin: 24px 16px;
	font-family: 'Amiri Quran';
	color: rgb(57, 44, 177);
	font-size: 36px;
	font-weight: 400;
`;

const EngTranslation = styled.div`
	color: rgb(7, 1, 65);
	font-size: 24px;
	letter-spacing: 0.01in;
`;

interface Props {
	selectedChapters?: ChapterItem[];
	selectedVerses?: Verse[];
	searchKeys: string[];
}

const Results = ({ selectedChapters, selectedVerses, searchKeys }: Props) => {
	const [tafsirConfig, setTafsirConfig] = useState<TafsirConfig | undefined>(
		undefined
	);

	const [selectionEnabled, setSelectionEnabled] = useState(false);
	const { data: verseData, isLoading: versesLoading } = useVerses();
	const { data: chapterData, isLoading: chaptersLoading } = useChapters();
	const { toVersePage } = useURLNavigation();

	const engTranslation = (
		trText: string,
		verseKey: string,
		searchKey?: string
	) => {
		return (
			<EngTranslation>
				<span
					dangerouslySetInnerHTML={{
						__html: getTransaltionHTML(trText, searchKey),
					}}
				/>
				<Tooltip title="Tafsir" placement="bottom">
					<Button type="text" onClick={() => setTafsirConfig({ verseKey })}>
						{'📖'}
					</Button>
				</Tooltip>
			</EngTranslation>
		);
	};

	const onTextSelectionUpdate = useCallback(
		debounce(() => {
			document.dispatchEvent(
				new CustomEvent('text-selection', {
					detail: document.getSelection()?.toString(),
				})
			);
		}, 1000),
		[]
	);

	useEffect(() => {
		const onSelection = () => {
			if (selectionEnabled) {
				const selectionString = document.getSelection()?.toString() || '';
				if (
					selectionString &&
					selectionString.length > 2 &&
					selectionString.length < 80
				) {
					onTextSelectionUpdate();
				}
			}
		};
		document.addEventListener('selectionchange', onSelection);

		return () => {
			document.removeEventListener('selectionchange', onSelection);
		};
	}, [selectionEnabled]);

	const items: CollapseProps['items'] = useMemo(() => {
		if (!verseData || !selectedChapters) return [];

		const chapterCollapseItems = (selectedChapters || []).map((chapter) => {
			const verseKeyList = [];
			for (let i = 1; i <= chapter?.verses_count; i += 1) {
				verseKeyList.push(`${chapter.id}:${i}`);
			}

			return {
				key: `ch-${chapter.id}`,
				label: <ChapterTitle chapter={chapter} />,
				children: (
					<div>
						{chapter?.bismillah_pre && <BismiWrapper>{BISMI}</BismiWrapper>}
						{verseKeyList.map((verseKey) => (
							<div key={verseKey}>
								<ArabicVerseWrapper key={verseKey}>
									<cite dir="rtl">
										<ArabicVerseText>
											{verseData?.ayaByKey?.[verseKey]?.text_uthmani}
											<VerseNumber
												number={verseKey.split(':')[1]}
												onClick={() => toVersePage(verseKey)}
											/>
										</ArabicVerseText>
									</cite>
								</ArabicVerseWrapper>

								{engTranslation(
									verseData?.ayaByKey?.[verseKey]?.translation || '',
									verseKey
								)}
							</div>
						))}
					</div>
				),
			};
		});

		const verseRangeItems: {
			chapter: ChapterItem | undefined;
			verses: Verse[];
		}[] = [];
		let currChapter = 0;
		(selectedVerses || []).forEach((verseItem: Verse) => {
			const [chapterNum] = verseItem.verse_key.split(':');
			if (currChapter !== +chapterNum) {
				verseRangeItems.push({
					chapter: chapterData?.suraByKey?.[Number(chapterNum)],
					verses: [verseItem],
				});
				currChapter = +chapterNum;
			} else if (verseRangeItems[verseRangeItems.length - 1]) {
				verseRangeItems[verseRangeItems.length - 1].verses.push(verseItem);
			}
		});

		const verseCollapseItems = (verseRangeItems || []).map(
			({ chapter, verses }) => {
				const verseInfo = verses.map((ve) => ve.verse_key).join(', ');
				return {
					key: `ch-ve-range-${chapter?.id || ''}-${verses[0].verse_key}`,
					label: <ChapterTitle chapter={chapter} verseInfo={verseInfo} />,
					children: (
						<>
							{verses.map((verse) => (
								<div key={verse.verse_key}>
									<ArabicVerseWrapper>
										<cite dir="rtl">
											<ArabicVerseText>
												{verse?.text_uthmani}
												<VerseNumber
													number={verse.verse_key.split(':')[1]}
													onClick={() => toVersePage(verse.verse_key)}
												/>
											</ArabicVerseText>
										</cite>
									</ArabicVerseWrapper>
									{engTranslation(
										verse?.translation || '',
										verse.verse_key,
										searchKeys?.[0] || ''
									)}
								</div>
							))}
						</>
					),
				};
			}
		);

		return [...chapterCollapseItems, ...verseCollapseItems];
	}, [verseData, chapterData, selectedChapters, selectedVerses]);

	const activeKeys = useMemo(() => {
		if (items?.length === 1) {
			return [items?.[0]?.key || ''];
		}
		const verseItems = items?.filter(
			(item) => (item?.key as string)?.split('-')[0] === VerseToken
		);
		if (verseItems?.length > 0) {
			return verseItems.map((item) => item?.key || '');
		}
		return undefined;
	}, [items]);

	if (versesLoading || chaptersLoading) {
		return (
			<SpinWrapper>
				<Spin />
			</SpinWrapper>
		);
	}

	return (
		<div
			onMouseEnter={() => setSelectionEnabled(true)}
			onMouseLeave={() => setSelectionEnabled(false)}
		>
			<Collapse items={items} activeKey={activeKeys} />
			<TafsirDrawer
				tafsirConfig={tafsirConfig}
				onClose={() => setTafsirConfig(undefined)}
			/>
		</div>
	);
};

export default Results;
