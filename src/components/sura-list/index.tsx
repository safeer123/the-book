import styled from 'styled-components';
import Search from './search';
import Results from './results';
import { useMemo } from 'react';
import NotificationProvider from './notification';
import { useSearchParams } from 'react-router-dom';
import useSearch from 'data/use-search';
import { searchConfigFromURLParams } from 'utils/search-utils';
import { TokenType } from 'types';

const Wrapper = styled.div`
	padding: 16px;
	height: calc(100% - 32px);
`;

const PageHeader = styled.div`
	margin: 16px;
`;

const Content = styled.div`
	margin: 16px;
	text-align: right;
	max-height: calc(100% - 72px);
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
			</Wrapper>
		</NotificationProvider>
	);
};

export default SuraList;
