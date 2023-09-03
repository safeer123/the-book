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
import { Selection } from '../types';
import { useVerses } from '../../data/use-verses';
import { getExtStr, getOptionKey, parseOptionKey } from './utils';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { matchKeyword } from './search-utils';

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

interface SearchProps {
	setSelection: React.Dispatch<React.SetStateAction<Selection>>;
}

const Search: React.FC<SearchProps> = ({ setSelection }) => {
	const [searchKey, setSearchKey] = useState('');
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [config, setConfig] = useState({
		ignoreCase: true,
		fullWord: false,
	});

	const { data: chapterData, isLoading: chaptersLoading } = useChapters();

	const { data: versesData, isLoading: versesLoading } = useVerses();

	const getChapterFromVerseKey = (verseKey: string) => {
		return chapterData?.suraByKey?.[Number(verseKey.split(':')[0])];
	};

	const options = useMemo(() => {
		let filteredChapterItems: OptionType[] = [];
		let filteredVerseItems: OptionType[] | undefined = [];

		if (searchKey.trim()) {
			filteredChapterItems =
				chapterData?.chapters
					?.filter((chapter) =>
						matchKeyword({ target: chapter.name_simple, searchKey, config })
					)
					.map((chapter) =>
						renderItem(
							getOptionKey(chapter),
							chapter.name_simple,
							chapter.name_arabic
						)
					) || [];

			filteredVerseItems = searchKey.trim()
				? versesData?.verses
						?.filter((verse) =>
							matchKeyword({
								target: verse?.translation || '',
								searchKey,
								config,
							})
						)
						.map((verse) => {
							const chapter = getChapterFromVerseKey(verse.verse_key);
							return renderItem(
								getOptionKey(verse),
								`${verse.verse_key} ${chapter?.name_simple || ''}`,
								chapter?.name_arabic || ''
							);
						})
				: undefined;
		} else {
			filteredChapterItems =
				chapterData?.chapters?.map((chapter) =>
					renderItem(
						getOptionKey(chapter),
						chapter.name_simple,
						chapter.name_arabic
					)
				) || [];
		}

		const onClickExtSura = () => {
			setDropdownVisible(false);
			setSelection({
				chapters: filteredChapterItems?.map((item) =>
					Number(parseOptionKey(item?.value)?.[1])
				),
			});
		};

		const onClickExtAya = () => {
			setDropdownVisible(false);
			setSelection({
				verses: filteredVerseItems?.map(
					(item) => parseOptionKey(item?.value)?.[1]
				),
				searchKeys: searchKey.split(','),
			});
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
	}, [searchKey, chapterData, setSelection, config]);

	const onSelect = (item: unknown) => {
		const [typeToken, id] = parseOptionKey(item as string);
		if (typeToken === 'ch') {
			setSearchKey(chapterData?.suraByKey[Number(id)]?.name_simple || '');
			setSelection({ chapters: [Number(id)] });
		}
		if (typeToken === 've') {
			setSearchKey(id || '');
			setSelection({ verses: [id], searchKeys: searchKey.split(',') });
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter') {
			setDropdownVisible(false);
			let chapters: number[] = [];
			let verses: string[] = [];
			if (options[0]?.options?.length > 0) {
				chapters = options[0]?.options.map((opt) => {
					return Number(parseOptionKey(opt.value)[1]);
				});
			}
			if (options[1]?.options?.length > 0) {
				verses = options[1]?.options.map((opt) => {
					return parseOptionKey(opt.value)[1];
				});
			}
			setSelection({ chapters, verses, searchKeys: searchKey.split(',') });
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
			ignoreCase: e.target.checked,
		});
	};

	useEffect(() => {
		if (searchKey === '') {
			setSelection({});
		}
	}, [searchKey]);

	return (
		<SearchPanelWrapper>
			<AutoComplete
				popupClassName="main-search-dropdown"
				popupMatchSelectWidth={500}
				style={{ width: '40%' }}
				options={options}
				onSelect={onSelect}
				onSearch={(e) => setSearchKey(e)}
				onKeyDown={onKeyDown}
				value={searchKey}
				open={dropdownVisible}
				onDropdownVisibleChange={(state) => setDropdownVisible(state)}
				notFoundContent={chaptersLoading || versesLoading ? <Spin /> : null}
			>
				<Input.Search size="large" placeholder="Search in Quran.." allowClear />
			</AutoComplete>
			<Checkbox checked={config?.fullWord} onChange={onChangeFullWordCheck}>
				{'Full word'}
			</Checkbox>
			<Checkbox checked={config?.ignoreCase} onChange={onChangeIgnoreCase}>
				{'Ignore case'}
			</Checkbox>
		</SearchPanelWrapper>
	);
};

export default Search;
