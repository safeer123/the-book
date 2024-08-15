import { useCallback, useEffect, useMemo, useState } from 'react';
import { useVerses } from 'data/use-verses';
import { useChapters } from 'data/use-chapters';
import { CollapseProps, Spin } from 'antd';
import {
	ChapterInfoConfig,
	ChapterItem,
	TafsirConfig,
	Verse,
	VerseToken,
} from 'types';
import ChapterHeader from '../chapter-header';
import { BISMI } from 'data/constants';
import VerseNumber from '../verse-number';
import { debounce } from 'utils/search-utils';
import TafsirDrawer from '../tafsir-drawer';
import useURLNavigation from 'data/use-url-navigation';
import { useTafsirInfoById } from 'data/use-tafsirs';
import {
	Collapse,
	SpinWrapper,
	ArabicVerseWrapper,
	ArabicVerseText,
	BismiWrapper,
} from './styles';
import { VerseTranslation } from './translation';

const ARABIC_VERSE_CLASSNAME = 'arabic-verse-text';
const ARABIC_VERSE_SMALL_CLASSNAME = 'arabic-verse-text-small';
const ARABIC_VERSE_LENGTH_LIMIT = 550;

interface Props {
	selectedChapters?: ChapterItem[];
	selectedVerses?: Verse[];
	searchKeys?: string[];
	config?: {
		textAnimationClass?: string;
	};
}

const Results = ({
	selectedChapters,
	selectedVerses,
	searchKeys = [],
	config,
}: Props) => {
	const [tafsirConfig, setTafsirConfig] = useState<TafsirConfig | undefined>(
		undefined
	);
	const [chapterInfoConfig, setChapterInfoConfig] = useState<
		ChapterInfoConfig | undefined
	>(undefined);

	const [selectionEnabled, setSelectionEnabled] = useState(false);
	const { data: verseData, isLoading: versesLoading } = useVerses();
	const { data: chapterData, isLoading: chaptersLoading } = useChapters();
	const { toVersePage } = useURLNavigation();

	const { isLoading: tafsirMetaInfoLoading } = useTafsirInfoById();

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
		if (!verseData) return [];

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

		const chapterCollapseItems = (selectedChapters || []).map((chapter) => {
			const verseKeyList = [];
			for (let i = 1; i <= chapter?.verses_count; i += 1) {
				verseKeyList.push(`${chapter.id}:${i}`);
			}

			return {
				key: `ch-${chapter.id}`,
				label: (
					<ChapterHeader
						chapter={chapter}
						setChapterInfoConfig={setChapterInfoConfig}
					/>
				),
				children: (
					<div>
						{chapter?.bismillah_pre && <BismiWrapper>{BISMI}</BismiWrapper>}
						{verseKeyList.map((verseKey) => (
							<div key={verseKey} id={`ve-${verseKey}`}>
								<ArabicVerseWrapper key={verseKey}>
									<cite dir="rtl">
										<ArabicVerseText className={ARABIC_VERSE_CLASSNAME}>
											{verseData?.ayaByKey?.[verseKey]?.text_uthmani}
											<VerseNumber
												number={verseKey.split(':')[1]}
												onClick={() => toVersePage(verseKey)}
											/>
										</ArabicVerseText>
									</cite>
								</ArabicVerseWrapper>

								<VerseTranslation
									trText={verseData?.ayaByKey?.[verseKey]?.translation || ''}
									verseKey={verseKey}
									textAnimationClass={config?.textAnimationClass}
									setTafsirConfig={setTafsirConfig}
								/>
							</div>
						))}
					</div>
				),
			};
		});

		const verseCollapseItems = (verseRangeItems || []).map(
			({ chapter, verses }) => {
				const verseInfo = verses.map((ve) => ve.verse_key).join(', ');
				return {
					key: `ch-ve-range-${chapter?.id || ''}-${verses[0].verse_key}`,
					label: (
						<ChapterHeader
							chapter={chapter}
							verseInfo={verseInfo}
							setChapterInfoConfig={setChapterInfoConfig}
						/>
					),
					children: (
						<>
							{verses.map((verse) => (
								<div key={verse.verse_key} id={`ve-${verse.verse_key}`}>
									<ArabicVerseWrapper>
										<cite dir="rtl">
											<ArabicVerseText
												className={`${ARABIC_VERSE_CLASSNAME}${
													verse?.text_uthmani?.length >
													ARABIC_VERSE_LENGTH_LIMIT
														? ` ${ARABIC_VERSE_SMALL_CLASSNAME}`
														: ''
												}`}
											>
												{verse?.text_uthmani}
												<VerseNumber
													number={verse.verse_key.split(':')[1]}
													onClick={() => toVersePage(verse.verse_key)}
												/>
											</ArabicVerseText>
										</cite>
									</ArabicVerseWrapper>

									<VerseTranslation
										trText={verse?.translation || ''}
										verseKey={verse.verse_key}
										searchKey={searchKeys?.[0] || ''}
										textAnimationClass={config?.textAnimationClass}
										setTafsirConfig={setTafsirConfig}
									/>
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

	if (versesLoading || chaptersLoading || tafsirMetaInfoLoading) {
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
			className="verse-display-root"
		>
			<Collapse items={items} activeKey={activeKeys} />
			<TafsirDrawer
				tafsirConfig={tafsirConfig}
				chapterInfoConfig={chapterInfoConfig}
				onClose={() => {
					setTafsirConfig(undefined);
					setChapterInfoConfig(undefined);
				}}
			/>
		</div>
	);
};

export default Results;
