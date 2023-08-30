import React, { useMemo, useState } from 'react';
import { AutoComplete as AutoCompleteAntd, Input } from 'antd';
import { styled } from 'styled-components';
import { useChapters } from '../../data/use-chapters';
import { Selection } from '../types';
import { useVerses } from '../../data/use-verses';
import { getOptionKey, parseOptionKey } from './utils';

const AutoComplete = styled(AutoCompleteAntd)`
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

const renderTitle = (title: string, ext: string) => (
  <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {title}
      <span>
        {ext}
      </span>
  </div>
);

const renderItem = (value: string, title: string, arabicTitle: string) => ({
  value,
  label: (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {title}
      <span>
        {arabicTitle}
      </span>
    </div>
  ),
});

interface SearchProps {
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
}

const Search: React.FC<SearchProps> = ({ setSelection }) => {

    const [searchKey, setSearchKey] = useState("");

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

      const filteredVerseItems = versesData?.verses?.filter(
        verse => verse?.translation?.toLowerCase()?.includes(searchKey.toLowerCase())
        ).map(verse => {
          const chapter = getChapterFromVerseKey(verse.verse_key);
          return renderItem(getOptionKey(verse), `${verse.verse_key} ${chapter?.name_simple}`, chapter?.name_arabic || '');
        });
  

      const extSura = (filteredChapterItems || []).length === 0 ? "No Match" : (filteredChapterItems || []).length;
      const extAya = (filteredVerseItems || []).length === 0 ? "No Match" : (filteredVerseItems || []).length;

      return [
        {
          label: renderTitle(`Sura (Chapter)`, `${extSura}`),
          options: filteredChapterItems || [],
        },
        {
          label: renderTitle(`Aya (Verse)`, `${extAya}`),
          options: filteredVerseItems || [],
        },
      ];
    }, [searchKey, chapterData]);

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

    return (
      <AutoComplete
        popupClassName="main-search-dropdown"
        popupMatchSelectWidth={500}
        style={{ width: '40%' }}
        options={options}
        onSelect={onSelect}
        onSearch={e => setSearchKey(e)}
        value={searchKey}
      >
        <Input.Search size="large" placeholder="Search in Quran.." allowClear/>
      </AutoComplete>
    );
  }

export default Search;
