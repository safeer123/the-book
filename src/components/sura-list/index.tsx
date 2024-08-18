import styled from 'styled-components';
import Search from './search';
import Results from './results';
import { useMemo } from 'react';
import NotificationProvider from './notification';
import { useSearchParams } from 'react-router-dom';
import useSearch from 'data/use-search';
import { searchConfigFromURLParams } from 'utils/search-utils';
import { TokenType } from 'types';
import ChapterBarChart from './chapter-bar-chart';
import EmptyScreen from './empty';

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

const SuraList = () => {
	const [searchParams] = useSearchParams();

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
		<NotificationProvider>
			<Wrapper>
				<PageHeader>
					<ChapterBarChart
						selectedChapters={searchKey ? result?.chapters : undefined}
						selectedVerses={result?.verses}
					/>
					<Search />
				</PageHeader>
				<Content className="scrollable">
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
		</NotificationProvider>
	);
};

export default SuraList;
