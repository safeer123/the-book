import { useQuery, UseQueryResult } from 'react-query';
import axios from 'axios';

const URL_TRANSLATIONS = 'https://api.quran.com/api/v4/resources/translations';

export interface TranslationItem {
	id: number;
	name: string;
	author_name: string;
	language_name: string;
}

export interface TranslationData {
	translations: TranslationItem[];
	translationsByLang?: { [key: string]: TranslationItem[] };
}

export const useTranslations = (): UseQueryResult<TranslationData> => {
	return useQuery(
		['quran-verse-translations'],
		async () => {
			const { data }: { data: TranslationData } = await axios.get(
				URL_TRANSLATIONS
			);
			const translationsByLang: TranslationData['translationsByLang'] = {};
			data.translations?.forEach((trItem) => {
				if (!translationsByLang[trItem.language_name]) {
					translationsByLang[trItem.language_name] = [];
				}
				translationsByLang[trItem.language_name].push(trItem);
			});
			return {
				translations: data?.translations || [],
				translationsByLang,
			};
		},
		{
			staleTime: Infinity,
		}
	);
};
