import { useMemo } from 'react';
import { useChapters } from './use-chapters';
import { useVerses } from './use-verses';
import { BarChartRecordItem } from 'types';
import useURLNavigation from './use-url-navigation';

interface Props {
	chapterId: number;
	verseInfo?: string;
}

const useChapterBarRecords = ({
	chapterId,
	verseInfo,
}: Props): BarChartRecordItem[] => {
	const { data: chapterData } = useChapters();
	const { data: verseData } = useVerses();
	const selectedVerses = useMemo(
		() => new Set((verseInfo || '').split(',').map((s) => s.trim())),
		[verseInfo]
	);

	const { toVersePage } = useURLNavigation();

	const scrollToVerse = (verseKey: string) => {
		// /* scroll to the view */
		// const verseEle = document.getElementById(`ve-${verseKey}`);
		// verseEle?.scrollIntoView({ behavior: 'smooth' });

		toVersePage(verseKey);
	};

	const records = useMemo(() => {
		if (chapterData && verseData) {
			const chapter = chapterData?.suraByKey?.[chapterId];
			if (chapter) {
				const rec = [];
				for (let v = 1; v <= chapter?.verses_count; v += 1) {
					const verseKey = `${chapter?.id}:${v}`;
					rec.push({
						id: verseKey,
						value: verseData?.ayaByKey?.[verseKey]?.text_uthmani?.length || 0,
						tooltip: verseKey,
						selected: selectedVerses?.has(verseKey),
						onClick: () => scrollToVerse(verseKey),
					});
				}
				return rec;
			}
		}
		return [];
	}, [chapterData, verseData]);

	return records;
};

export default useChapterBarRecords;
