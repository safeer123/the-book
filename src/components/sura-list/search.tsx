import React, { useEffect, useMemo, useState } from 'react';
import {
	AutoComplete as AutoCompleteAntd,
	Input,
	Button,
	Checkbox,
	Spin,
} from 'antd';
import { styled } from 'styled-components';
import { useChapters } from 'data/use-chapters';
import { getExtStr, getOptionKey, parseOptionKey } from './utils';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useSearchParams } from 'react-router-dom';
import useSearch from 'data/use-search';
import { ChapterToken, SearchConfig, VerseToken } from 'types';
import { searchConfigFromURLParams } from 'utils/search-utils';

const SearchPanelWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
`;

const AutoComplete = styled(AutoCompleteAntd)`
	-webkit-box-shadow: -17px 16px 10px -21px rgba(0, 0, 0, 0.75);
	-moz-box-shadow: -17px 16px 10px -21px rgba(0, 0, 0, 0.75);
	box-shadow: -17px 16px 10px -21px rgba(0, 0, 0, 0.75);

	.main-search-dropdown .ant-select-dropdown-menu-item-group-title {
		color: #666;
		font-weight: bold;
	}

	.main-search-dropdown .ant-select-dropdown-menu-item-group {
		border-bottom: 1px solid #f6f6f6;
	}

	.main-search-dropdown .ant-select-dropdown-menu-item {
		padding-left: 16px;
	}

	.main-search-dropdown .ant-select-dropdown-menu-item.show-all {
		text-align: center;
		cursor: default;
	}

	.main-search-dropdown .ant-select-dropdown-menu {
		max-height: 300px;
	}
`;

const ArabicTitle = styled.span`
	font-family: 'Amiri Quran';
	color: rgb(14, 2, 121);
	font-size: 16px;
`;

const ItemWrapper = styled.div`
	display: flex;
	justify-content: space-between;
`;

interface OptionType {
	value: string;
	label: JSX.Element;
}

const renderTitle = (title: string, ext: string, onClickExt?: () => void) => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'space-between',
		}}
	>
		{title}
		{Boolean(ext) && (
			<Button type="link" disabled={!onClickExt} onClick={onClickExt}>
				{ext} results
			</Button>
		)}
	</div>
);

const renderItem = (value: string, title: string, arabicTitle: string) => ({
	value,
	label: (
		<ItemWrapper>
			{title}
			<ArabicTitle>{arabicTitle}</ArabicTitle>
		</ItemWrapper>
	),
});

const Search: React.FC = () => {
	const [searchKey, setSearchKey] = useState('');
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [config, setConfig] = useState({
		ignoreCase: true,
		fullWord: false,
	});

	const { data: chapterData } = useChapters();

	const [searchParams, setSearchParams] = useSearchParams();

	const { result, loading } = useSearch({ searchKey, config });

	const getChapterFromVerseKey = (verseKey: string) => {
		return chapterData?.suraByKey?.[Number(verseKey.split(':')[0])];
	};

	const submitSearchQuery = (k: string, conf: SearchConfig, only = '') => {
		setSearchParams({
			...(k ? { k } : {}),
			w: conf.fullWord ? '1' : '0',
			c: conf.ignoreCase ? '1' : '0',
			...(only ? { only } : {}),
		});
	};

	const options = useMemo(() => {
		const filteredChapterItems: OptionType[] =
			result.chapters?.map((chapter) =>
				renderItem(
					getOptionKey(chapter),
					`${chapter.id}. ${chapter.name_simple}`,
					chapter.name_arabic
				)
			) || [];
		const filteredVerseItems: OptionType[] | undefined = result.verses?.map(
			(verse) => {
				const chapter = getChapterFromVerseKey(verse.verse_key);
				return renderItem(
					getOptionKey(verse),
					`${verse.verse_key} ${chapter?.name_simple || ''}`,
					chapter?.name_arabic || ''
				);
			}
		);

		const onClickExtSura = () => {
			setDropdownVisible(false);
			submitSearchQuery(searchKey, config, ChapterToken);
		};

		const onClickExtAya = () => {
			setDropdownVisible(false);
			submitSearchQuery(searchKey, config, VerseToken);
		};

		const [extSura, extSuraClickEnabled] = getExtStr(
			filteredChapterItems,
			searchKey
		);
		const [extAya, extAyaClickEnabled] = getExtStr(
			filteredVerseItems,
			searchKey
		);

		const opts = [
			{
				label: renderTitle(
					`Sura (Chapter)`,
					extSura,
					extSuraClickEnabled ? onClickExtSura : undefined
				),
				options: filteredChapterItems || [],
			},
			{
				label: renderTitle(
					`Aya (Verse)`,
					extAya,
					extAyaClickEnabled ? onClickExtAya : undefined
				),
				options: filteredVerseItems || [],
			},
		];

		return opts;
	}, [searchKey, result, chapterData]);

	const onSelect = (item: unknown) => {
		const [typeToken, id] = parseOptionKey(item as string);
		setSearchKey(id);
		submitSearchQuery(id, config, typeToken);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter') {
			setDropdownVisible(false);
			submitSearchQuery(searchKey, config);
		}
	};

	const onChangeFullWordCheck = (e: CheckboxChangeEvent) => {
		setConfig({
			...config,
			fullWord: e.target.checked,
		});
	};

	const onChangeIgnoreCase = (e: CheckboxChangeEvent) => {
		setConfig({
			...config,
			ignoreCase: !e.target.checked,
		});
	};

	const onBlur = () => {
		if (searchParams.get('k') !== searchKey) {
			submitSearchQuery(searchKey, config);
		}
	};

	useEffect(() => {
		if (searchParams.get('k') !== searchKey) {
			setSearchKey(searchParams.get('k') || '');
		}
		const conf = searchConfigFromURLParams(searchParams);
		if (
			conf.fullWord !== config.fullWord ||
			conf.ignoreCase !== config.ignoreCase
		) {
			setConfig(conf);
		}
	}, [searchParams]);

	return (
		<SearchPanelWrapper>
			<AutoComplete
				popupClassName="main-search-dropdown"
				popupMatchSelectWidth={500}
				style={{ width: '40%' }}
				options={options}
				onSelect={onSelect}
				onSearch={(e) => setSearchKey(e)}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				value={searchKey}
				open={dropdownVisible}
				onDropdownVisibleChange={(state) => setDropdownVisible(state)}
				notFoundContent={loading ? <Spin /> : null}
			>
				<Input.Search size="large" placeholder="Search in Quran.." allowClear />
			</AutoComplete>
			<Checkbox checked={config?.fullWord} onChange={onChangeFullWordCheck}>
				{'Match Whole Word'}
			</Checkbox>
			<Checkbox checked={!config?.ignoreCase} onChange={onChangeIgnoreCase}>
				{'Match Case'}
			</Checkbox>
		</SearchPanelWrapper>
	);
};

export default Search;
