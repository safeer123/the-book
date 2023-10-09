import { useMemo } from 'react';
import { useChapters } from './use-chapters';
import { BarChartRecordItem, ChapterItem, Verse } from 'types';
import useURLNavigation from './use-url-navigation';

interface Props {
	chapters?: ChapterItem[];
	verses?: Verse[];
}

const useChapterBarRecords = ({
	chapters,
	verses,
}: Props): BarChartRecordItem[] => {
	const { data: chapterData } = useChapters();

	const selectionSet = useMemo(() => {
		const chapterList1 = (chapters || []).map((ch) => ch.id);
		const chapterList2 = (verses || []).map((v) => +v.verse_key.split(':')[0]);
		const lookupSet = new Set([...chapterList1, ...chapterList2]);

		return lookupSet;
	}, [chapters, verses]);

	const { toChapterPage } = useURLNavigation();

	const goToChapter = (chapterId: number) => {
		toChapterPage(chapterId);
	};

	const records = useMemo(() => {
		if (chapterData) {
			const chapterList = chapterData?.chapters;
			if (chapterList) {
				return chapterList.map((ch) => {
					return {
						id: `${ch.id}`,
						value: ch?.verses_count || 0,
						tooltip: `${ch.id}. ${ch.name_simple}`,
						selected: selectionSet.has(ch.id),
						onClick: () => goToChapter(ch.id),
					};
				});
			}
		}
		return [];
	}, [chapterData, selectionSet]);

	return records;
};

export default useChapterBarRecords;
