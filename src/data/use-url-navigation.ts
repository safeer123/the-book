import { useSearchParams } from 'react-router-dom';
import { ChapterToken, VerseToken } from 'types';

const useURLNavigation = () => {
	const [, setSearchParams] = useSearchParams();

	const toChapterPage = (id: number) => {
		setSearchParams((prev) => {
			prev.set('k', `${id}`);
			prev.set('w', `0`);
			prev.set('c', `0`);
			prev.set('only', ChapterToken);
			return prev;
		});
	};

	// one or multiple verses Eg:- 2:45, 2:40-45
	const toVersePage = (key: string) => {
		setSearchParams((prev) => {
			prev.set('k', key);
			prev.set('w', `0`);
			prev.set('c', `0`);
			prev.set('only', VerseToken);
			return prev;
		});
	};

	return {
		toChapterPage,
		toVersePage,
	};
};

export default useURLNavigation;
