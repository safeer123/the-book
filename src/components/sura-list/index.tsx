import styled from 'styled-components';
import Search from './search';
import Results from './results';
import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSearch from 'data/use-search';
import { searchConfigFromURLParams } from 'utils/search-utils';
import { TokenType } from 'types';
import ChapterBarChart from './chapter-bar-chart';
import EmptyScreen from './empty';
import { TranslationVisibilityProvider } from 'context/translation-visibility-context';
import { RecitePlayerProvider } from './recite-player/context';

const Wrapper = styled.div`
	padding: 0px 16px;
	height: 100%;
	display: flex;
	flex-direction: column;
`;

const PageHeader = styled.div`
	margin: 0px 16px 16px 16px;
`;

const Content = styled.div`
	flex: 1;
	margin: 16px;
	text-align: right;
	overflow-y: auto;
`;

const SCROLL_RESET_GUARD_MS = 300;
const SCROLL_RESET_GUARD_THRESHOLD = 40;

const SuraList = () => {
	const [searchParams] = useSearchParams();
	const lastScrollTopRef = useRef(0);
	const lastMouseDownAtRef = useRef(0);

	const [searchKey, searchKeys, config, only] = useMemo(() => {
		const key = searchParams.get('k') || '';
		const searchConfig = searchConfigFromURLParams(searchParams);
		return [
			key,
			key.split(','),
			searchConfig,
			searchParams.get('only') as TokenType,
		];
	}, [searchParams]);

	const { result } = useSearch({ searchKey, config, only });

	const showEmptyScreen =
		Boolean(searchKey?.trim()) &&
		result?.chapters?.length + result?.verses?.length === 0;

	return (
		<TranslationVisibilityProvider>
			<RecitePlayerProvider>
				<Wrapper>
					<PageHeader>
						<ChapterBarChart
							selectedChapters={searchKey ? result?.chapters : undefined}
							selectedVerses={result?.verses}
						/>
						<Search />
					</PageHeader>
					<Content
						className="scrollable"
						onMouseDownCapture={() => {
							lastMouseDownAtRef.current = Date.now();
						}}
						onScroll={(e) => {
							const el = e.currentTarget;
							// Opening a Tooltip/Popover for the first time (tafsir, recite,
							// translation buttons) makes antd's positioning logic briefly
							// reset this container's scrollTop to 0. Snap back to the last
							// known position when that happens right after a click rather
							// than a genuine scroll gesture.
							if (
								el.scrollTop === 0 &&
								lastScrollTopRef.current > SCROLL_RESET_GUARD_THRESHOLD &&
								Date.now() - lastMouseDownAtRef.current < SCROLL_RESET_GUARD_MS
							) {
								el.scrollTop = lastScrollTopRef.current;
							} else {
								lastScrollTopRef.current = el.scrollTop;
							}
						}}
					>
						{showEmptyScreen ? (
							<EmptyScreen />
						) : (
							<Results
								selectedChapters={result?.chapters}
								selectedVerses={result?.verses}
								searchKeys={searchKeys}
							/>
						)}
					</Content>
				</Wrapper>
			</RecitePlayerProvider>
		</TranslationVisibilityProvider>
	);
};

export default SuraList;
