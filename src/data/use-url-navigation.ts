import { useSearchParams } from 'react-router-dom';
import { ChapterToken, VerseToken } from 'types';

const useURLNavigation = () => {
	const [, setSearchParams] = useSearchParams();

	const toChapterPage = (id: number) => {
		setSearchParams({
			k: `${id}`,
			w: '0',
			c: '1',
			only: ChapterToken,
		});
	};

	// one or multiple verses Eg:- 2:45, 2:40-45
	const toVersePage = (key: string) => {
		setSearchParams({
			k: key,
			w: '0',
			c: '1',
			only: VerseToken,
		});
	};

	return {
		toChapterPage,
		toVersePage,
	};
};

export default useURLNavigation;
