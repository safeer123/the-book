import { useQuery, UseQueryResult } from 'react-query';
import axios from 'axios';
import { ChapterInfoItem } from '../types';

const CHAPTER_INFO = (id?: number) =>
	`https://api.quran.com/api/v4/chapters/${id || ''}/info`;

export const useChapterInfoById = (
	id?: number
): UseQueryResult<ChapterInfoItem> => {
	return useQuery(
		['chapter-info', id],
		async () => {
			const { data }: { data: { chapter_info: ChapterInfoItem } } =
				await axios.get(CHAPTER_INFO(id));

			return data?.chapter_info;
		},
		{
			staleTime: Infinity,
			enabled: Boolean(id),
		}
	);
};
