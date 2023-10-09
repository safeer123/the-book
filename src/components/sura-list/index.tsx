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

const Wrapper = styled.div`
	padding: 16px;
	height: calc(100% - 32px);
	display: flex;
	flex-direction: column;
`;

const PageHeader = styled.div`
	margin: 16px;
`;

const Content = styled.div`
	flex: 1;
	margin: 16px;
	text-align: right;
	overflow-y: auto;
`;
const Footer = styled.div`
	border: 0.5px solid #fff;
	-webkit-box-shadow: -1px 3px 11px 1px rgba(0, 0, 0, 0.75);
	-moz-box-shadow: -1px 3px 11px 1px rgba(0, 0, 0, 0.75);
	box-shadow: -1px 3px 11px 1px rgba(0, 0, 0, 0.75);
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

	return (
		<NotificationProvider>
			<Wrapper>
				<PageHeader>
					<Search />
				</PageHeader>
				<Content className="scrollable">
					<Results
						selectedChapters={result?.chapters}
						selectedVerses={result?.verses}
						searchKeys={searchKeys}
					/>
				</Content>
				<Footer>
					<ChapterBarChart
						selectedChapters={searchKey ? result?.chapters : undefined}
						selectedVerses={result?.verses}
					/>
				</Footer>
			</Wrapper>
		</NotificationProvider>
	);
};

export default SuraList;
