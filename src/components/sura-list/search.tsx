import React, { useEffect, useMemo, useState } from 'react';
import { AutoComplete as AutoCompleteAntd, Input, Button } from 'antd';
import { styled } from 'styled-components';
import { useChapters } from '../../data/use-chapters';
import { Selection } from '../types';
import { useVerses } from '../../data/use-verses';
import { getExtStr, getOptionKey, parseOptionKey } from './utils';

const AutoComplete = styled(AutoCompleteAntd)`
  -webkit-box-shadow: -17px 16px 10px -21px rgba(0,0,0,0.75);
  -moz-box-shadow: -17px 16px 10px -21px rgba(0,0,0,0.75);
  box-shadow: -17px 16px 10px -21px rgba(0,0,0,0.75);

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
  font-family: "Amiri Quran";
  color: rgb(14, 2, 121);
  font-size: 16px;
`

const ItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`


const renderTitle = (title: string, ext: string, onClickExt?:()=>void) => (
  <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {title}
      {
        Boolean(ext) &&
        <Button type='link' disabled={!Boolean(onClickExt)} onClick={onClickExt}>
          {ext} results
        </Button>
      }
  </div>
);

const renderItem = (value: string, title: string, arabicTitle: string) => ({
  value,
  label: (
    <ItemWrapper>
      {title}
      <ArabicTitle>
        {arabicTitle}
      </ArabicTitle>
    </ItemWrapper>
  ),
});

interface SearchProps {
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
}

const Search: React.FC<SearchProps> = ({ setSelection }) => {

    const [searchKey, setSearchKey] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const {
      data: chapterData,
      isLoading: chaptersLoading,
    } = useChapters();

    const {
      data: versesData,
      isLoading: versesLoading,
    } = useVerses();

    const getChapterFromVerseKey = (verseKey: string) => {
      return chapterData?.suraByKey?.[Number(verseKey.split(":")[0])];
    }

    const options = useMemo(() => {

      const filteredChapterItems = chapterData?.chapters?.filter(
        chapter => chapter.name_simple.toLowerCase().includes(searchKey.toLowerCase())
        ).map(chapter => renderItem(getOptionKey(chapter), chapter.name_simple, chapter.name_arabic));

      const filteredVerseItems = searchKey.trim() ? versesData?.verses?.filter(
        verse => verse?.translation?.toLowerCase()?.includes(searchKey.toLowerCase())
        ).map(verse => {
          const chapter = getChapterFromVerseKey(verse.verse_key);
          return renderItem(getOptionKey(verse), `${verse.verse_key} ${chapter?.name_simple}`, chapter?.name_arabic || '');
        }) : undefined;

      const onClickExtSura = () => {
        setDropdownVisible(false);
        setSelection({chapters: filteredChapterItems?.map(item => Number(parseOptionKey(item?.value)?.[1]))});
      }

      const onClickExtAya = () => {
        setDropdownVisible(false);
        setSelection({verses: filteredVerseItems?.map(item => parseOptionKey(item?.value)?.[1])});
      }

      const [extSura, extSuraClickEnabled] = getExtStr(filteredChapterItems, searchKey);
      const [extAya, extAyaClickEnabled] = getExtStr(filteredVerseItems, searchKey);

      const options = [
        {
          label: renderTitle(`Sura (Chapter)`, extSura, extSuraClickEnabled ? onClickExtSura : undefined),
          options: filteredChapterItems || [],
        },
        {
          label: renderTitle(`Aya (Verse)`, extAya, extAyaClickEnabled ? onClickExtAya : undefined),
          options: filteredVerseItems || [],
        },
      ];

      return options;
    }, [searchKey, chapterData, setSelection]);

    const onSelect = (item: unknown) => {
      const [typeToken, id] = parseOptionKey(item as string);
      if(typeToken === 'ch') {
        setSearchKey(chapterData?.suraByKey[Number(id)]?.name_simple || '');
        setSelection({chapters: [Number(id)]})
      }
      if(typeToken === 've') {
        setSearchKey(id || '');
        setSelection({verses: [id]})
      }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if(e.key === 'Enter') {
        setDropdownVisible(false);
        let chapters: number[] = [];
        let verses: string[] = [];
        if(options[0]?.options?.length > 0) {
          chapters = options[0]?.options.map(opt => {
            return Number(parseOptionKey(opt.value)[1]);
          });
        }
        if(options[1]?.options?.length > 0) {
          verses = options[1]?.options.map(opt => {
            return parseOptionKey(opt.value)[1];
          });
        }
        setSelection({chapters, verses});
      }
    }

    useEffect(() => {
      if(searchKey === "") {
        setSelection({});
      }
    }, [searchKey]);

    return (
      <AutoComplete
        popupClassName="main-search-dropdown"
        popupMatchSelectWidth={500}
        style={{ width: '40%' }}
        options={options}
        onSelect={onSelect}
        onSearch={e => setSearchKey(e)}
        onKeyDown={onKeyDown}
        value={searchKey}
        open={dropdownVisible}
        onDropdownVisibleChange={state => setDropdownVisible(state)}
      >
        <Input.Search size="large" placeholder="Search in Quran.." allowClear/>
      </AutoComplete>
    );
  }

export default Search;
