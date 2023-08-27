import React, { useMemo, useState } from 'react';
import { AutoComplete as AutoCompleteAntd, Input } from 'antd';
import { styled } from 'styled-components';
import { useChapters } from '../../data/use-chapters';
import { Selection } from '../types';

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

const renderTitle = (title: string) => (
  <span>
    {title}
  </span>
);

const renderItem = (value: number, title: string, arabicTitle: string) => ({
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

    const options = useMemo(() => {

      const filteredItems = chapterData?.chapters?.filter(
        chapter => chapter.name_simple.toLowerCase().includes(searchKey.toLowerCase())
        ).map(chapter => renderItem(chapter.id, chapter.name_simple, chapter.name_arabic));

      const noMatchSura = (filteredItems || []).length === 0 ? ": No Match" : "";

      return [
        {
          label: renderTitle(`Sura (Chapter)${noMatchSura}`),
          options: filteredItems || [],
        },
      ];
    }, [searchKey, chapterData]);

    const onSelect = (item: unknown) => {
      setSearchKey(chapterData?.suraByKey[Number(item)]?.name_simple || '');
      setSelection({chapters: [Number(item)]})
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
