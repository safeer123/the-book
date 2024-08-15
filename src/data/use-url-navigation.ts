import { useSearchParams } from 'react-router-dom';
import { ChapterToken, VerseToken } from 'types';

const useURLNavigation = () => {
	const [, setSearchParams] = useSearchParams();

	const toChapterPage = (id: number) => {
		setSearchParams((prev) => ({
			k: `${id}`,
			w: '0',
			c: '0',
			only: ChapterToken,
			tr: prev.get('tr') as string,
		}));
	};

	// one or multiple verses Eg:- 2:45, 2:40-45
	const toVersePage = (key: string) => {
		setSearchParams((prev) => ({
			k: key,
			w: '0',
			c: '0',
			only: VerseToken,
			tr: prev.get('tr') as string,
		}));
	};

	return {
		toChapterPage,
		toVersePage,
	};
};

export default useURLNavigation;
