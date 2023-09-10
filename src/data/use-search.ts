import { useMemo } from 'react';
import { useChapters } from 'data/use-chapters';
import {
	ChapterItem,
	SearchConfig,
	Verse,
	TokenType,
	VerseToken,
	ChapterToken,
} from 'types';
import { useVerses } from 'data/use-verses';
import { matchKeyword } from 'utils/search-utils';

interface Props {
	searchKey: string;
	config: SearchConfig;
	only?: TokenType;
}

const useSearch = ({ searchKey, config, only }: Props) => {
	const { data: chapterData, isLoading: chaptersLoading } = useChapters();

	const { data: versesData, isLoading: versesLoading } = useVerses();

	const result = useMemo(() => {
		let filteredChapterItems: ChapterItem[] = [];
		let filteredVerseItems: Verse[] | undefined = [];

		const shouldSearchChapter = only !== VerseToken;
		const shouldSearchVerse = only !== ChapterToken;

		if (searchKey.trim()) {
			if (shouldSearchChapter) {
				filteredChapterItems =
					chapterData?.chapters?.filter((chapter) =>
						matchKeyword({ target: chapter.name_simple, searchKey, config })
					) || [];
			}

			if (shouldSearchVerse) {
				filteredVerseItems = searchKey.trim()
					? versesData?.verses?.filter((verse) =>
							matchKeyword({
								target: verse?.translation || '',
								searchKey,
								config,
							})
					  )
					: undefined;
			}
		} else {
			filteredChapterItems = chapterData?.chapters || [];
		}

		return {
			chapters: filteredChapterItems || [],
			verses: filteredVerseItems || [],
		};
	}, [searchKey, chapterData, config]);

	return {
		result,
		loading: chaptersLoading || versesLoading,
	};
};

export default useSearch;
