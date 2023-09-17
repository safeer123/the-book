import { useQuery, UseQueryResult } from 'react-query';
import axios from 'axios';
import {
	TafsirConfig,
	TafsirDataItem,
	TafsirInfoItem,
	TafsirItem,
} from '../types';

const ALL_TAFSIRS = 'https://api.quran.com/api/v4/resources/tafsirs';
const TAFSIR_FOR_AYA =
	'https://api.quran.com/api/v4/quran/tafsirs/164?verse_key=';

export const useTafsirInfoById = (): UseQueryResult<{
	[key: number]: TafsirInfoItem;
}> => {
	return useQuery(
		['tafsir-info'],
		async () => {
			const { data }: { data: { tafsirs: TafsirInfoItem[] } } = await axios.get(
				ALL_TAFSIRS
			);
			const lookup: {
				[key: number]: TafsirInfoItem;
			} = {};
			(data?.tafsirs || []).forEach((t) => {
				lookup[t.id] = t;
			});
			return lookup;
		},
		{
			staleTime: Infinity,
		}
	);
};

export const useTafsirs = (
	config?: TafsirConfig
): UseQueryResult<TafsirItem[]> => {
	const { data: tafsirInfoById } = useTafsirInfoById();

	return useQuery(
		['tafsir', config],
		async () => {
			const { data }: { data: { tafsirs: TafsirDataItem[] } } = await axios.get(
				`${TAFSIR_FOR_AYA}${config?.verseKey || ''}`
			);
			const results = (data?.tafsirs || []).map(
				(t: TafsirDataItem) =>
					({
						...t,
						...(tafsirInfoById?.[t.resource_id] || {}),
					} as TafsirItem)
			);
			return results;
		},
		{
			staleTime: Infinity,
			enabled: Boolean(config),
		}
	);
};
