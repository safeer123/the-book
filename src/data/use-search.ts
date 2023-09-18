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
import {
	matchKeyword,
	matchSuraNumber,
	matchVerseKey,
} from 'utils/search-utils';

interface Props {
	searchKey: string;
	config: SearchConfig;
	only?: TokenType;
}

const useSearch = ({ searchKey, config, only }: Props) => {
	const { data: chapterData, isLoading: chaptersLoading } = useChapters();

	const { data: versesData, isLoading: versesLoading } = useVerses();

	const result = useMemo(() => {
		if (!chapterData || !versesData) {
			return {
				chapters: [],
				verses: [],
			};
		}

		let filteredChapterItems: ChapterItem[] = [];
		let filteredVerseItems: Verse[] | undefined = [];

		const shouldSearchChapter = only !== VerseToken;
		const shouldSearchVerse = only !== ChapterToken;

		if (!searchKey.trim()) {
			// empty searchKey: we can show all chapters
			filteredChapterItems = chapterData?.chapters || [];
		} else {
			// otherwise search in translations or suras
			if (shouldSearchChapter) {
				if (matchSuraNumber(searchKey.trim())) {
					// if match with a sura number
					filteredChapterItems = chapterData?.suraByKey[+searchKey.trim()]
						? [chapterData?.suraByKey[+searchKey.trim()]]
						: [];
				} else {
					filteredChapterItems =
						chapterData?.chapters?.filter((chapter) =>
							matchKeyword({ target: chapter.name_simple, searchKey, config })
						) || [];
				}
			}

			if (shouldSearchVerse) {
				if (matchVerseKey(searchKey.trim())) {
					// if match with a verse key
					filteredVerseItems = versesData?.ayaByKey[searchKey.trim()]
						? [versesData?.ayaByKey[searchKey.trim()]]
						: [];
				} else {
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
			}
		}

		return {
			chapters: filteredChapterItems || [],
			verses: filteredVerseItems || [],
		};
	}, [searchKey, chapterData, versesData, config]);

	// console.log(result);

	return {
		result,
		loading: chaptersLoading || versesLoading,
	};
};

export default useSearch;
