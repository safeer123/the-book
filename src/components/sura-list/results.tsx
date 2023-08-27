import { useMemo } from "react";
import styled from "styled-components";
import sanitizeHtml from 'sanitize-html';
import { useVerses } from "../../data/use-verses";
import { useChapters } from "../../data/use-chapters";
import type { CollapseProps } from 'antd';
import { Collapse, Spin } from 'antd';
import { ChapterItem } from "../types";

const SpinWrapper = styled.div`
  width: 100%;
  text-align: center;
  height: 100%;
  position: relative;
  .ant-spin {
    margin: 20%;
  }
`;

const ChapterTitle = styled.div`
  font-size: 24px;
  color: #605757;
  background-color: #EFEFEF;
  padding-right: 16px;
`;

const ArabicTitle = styled.span`
  font-family: "Amiri Quran";
  color: #621515;
`;

const ArabicVerseWrapper = styled.div`
  margin: 16px;
  font-family: "Amiri Quran";
  color: rgb(14, 2, 121);
  font-size: 42px;
  font-weight: 400;
`;

const EngTranslation = styled.div`
  color: rgb(7, 1, 65);
  font-size: 24px;
  letter-spacing: 0.01in;
`;

interface Props {
  chapters?: number[];
  verses?: number[];
}

const Results = ({chapters, verses}: Props) => {
  const {
    data: verseData,
    isLoading: versesLoading
  } = useVerses();

  const {
    data: chapterData,
    isLoading: chaptersLoading,
  } = useChapters();

  const filteredChapters = useMemo(() => {
    const chapterItems: ChapterItem[] = [];
    (chapters || []).forEach(chapterIndex => {
      if(chapterData?.suraByKey?.[chapterIndex]) {
        chapterItems.push(chapterData?.suraByKey?.[chapterIndex]);
      }
    });
    return chapterItems;
  }, [chapterData, chapters]);

  const items: CollapseProps['items'] = useMemo(() => {

    if(!verseData || !filteredChapters) return [];

    const chaptersToShow = filteredChapters.length === 0 ? chapterData?.chapters : filteredChapters;

    return chaptersToShow?.map((chapter) => {
      const verseKeyList = [];
      for(let i = 1; i <= chapter?.verses_count; i+= 1) {
        verseKeyList.push(`${chapter.id}:${i}`);
      }

      return {
        key: `ch-${chapter.id}`,
        label: <ChapterTitle><ArabicTitle>{chapter?.name_arabic}</ArabicTitle> - {chapter?.name_simple} - ({chapter?.translated_name?.name})</ChapterTitle>,
        children: <div>
        {
          verseKeyList.map(verseKey => (
            <div key={verseKey}>
              <ArabicVerseWrapper key={verseKey}>
                {verseData?.ayaByKey?.[verseKey]?.text_uthmani}
              </ArabicVerseWrapper>
              <EngTranslation dangerouslySetInnerHTML={{
                __html: sanitizeHtml(verseData?.ayaByKey?.[verseKey]?.translation || '')
              }} />
            </div>

          ))
        }

      </div>,
      };
    });
  }, [verseData, chapterData, filteredChapters])

  if(versesLoading || chaptersLoading) {
    return <SpinWrapper><Spin /></SpinWrapper>;
  }

  return (
      <Collapse accordion items={items} />
  );
};

export default Results;
