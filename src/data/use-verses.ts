import { useQuery, UseQueryResult } from 'react-query';
import axios from 'axios';
import { TransaltionItem, Verse } from '../types';

type VerseData = {
	verses: Verse[];
};

type TranslationData = {
	translations: TransaltionItem[];
};

type VerseByKey = {
	[key: string]: Verse;
};

const URL_ALL_VERSES = 'https://api.quran.com/api/v4/quran/verses/uthmani';
const URL_TRANSLATION = 'https://api.quran.com/api/v4/quran/translations/131';

const mergeTranslation = (verses: Verse[], transations: TransaltionItem[]) => {
	for (let i = 0; i < verses?.length; i += 1) {
		verses[i].translation = transations[i]?.text;
	}
};

export const useVerses = (): UseQueryResult<{
	verses: Verse[];
	ayaByKey: VerseByKey;
}> => {
	return useQuery(
		['quran-verses'],
		async () => {
			const { data }: { data: VerseData } = await axios.get(URL_ALL_VERSES);
			const { data: translationsData }: { data: TranslationData } =
				await axios.get(URL_TRANSLATION);
			mergeTranslation(data.verses, translationsData?.translations);
			const ayaByKey: { [key: string]: Verse } = {};
			data.verses?.forEach((verse: Verse) => {
				ayaByKey[verse?.verse_key || ''] = verse;
			});
			return {
				verses: data.verses,
				ayaByKey,
			};
		},
		{
			staleTime: Infinity,
		}
	);
};
