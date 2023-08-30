import { useMemo } from "react";
import styled from "styled-components";
import sanitizeHtml from 'sanitize-html';
import { useVerses } from "../../data/use-verses";
import { useChapters } from "../../data/use-chapters";
import type { CollapseProps } from 'antd';
import { Collapse, Spin } from 'antd';
import { ChapterItem, Verse } from "../types";
import ChapterTitle from "./chapter-title";

const SpinWrapper = styled.div`
  width: 100%;
  text-align: center;
  height: 100%;
  position: relative;
  .ant-spin {
    margin: 20%;
  }
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
  verses?: string[];
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

  const selectedChapters = useMemo(() => {
    const chapterItems: ChapterItem[] = [];
    (chapters || []).forEach(chapterIndex => {
      if(chapterData?.suraByKey?.[chapterIndex]) {
        chapterItems.push(chapterData?.suraByKey?.[chapterIndex]);
      }
    });
    return chapterItems;
  }, [chapterData, chapters]);

  const selectedVerses = useMemo(() => {
    const verseItems: Verse[] = [];
    (verses || []).forEach(verseKey => {
      if(verseData?.ayaByKey?.[verseKey]) {
        verseItems.push(verseData?.ayaByKey?.[verseKey]);
      }
    });
    return verseItems;
  }, [verseData, verses]);

  const items: CollapseProps['items'] = useMemo(() => {

    if(!verseData || !selectedChapters) return [];

    const chaptersToShow = (selectedChapters.length === 0 && !verses?.length) ? chapterData?.chapters : selectedChapters;

    const chapterCollapseItems = (chaptersToShow || []).map((chapter) => {
      const verseKeyList = [];
      for(let i = 1; i <= chapter?.verses_count; i+= 1) {
        verseKeyList.push(`${chapter.id}:${i}`);
      }

      return {
        key: `ch-${chapter.id}`,
        label: <ChapterTitle chapter={chapter} />,
        children: 
              <div>
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

    const verseCollapseItems = (selectedVerses || []).map(verse => {
      const chapter = chapterData?.suraByKey?.[Number(verse.verse_key.split(":")[0])];
      return {
        key: `ve-${verse.verse_key}`,
        label: <ChapterTitle chapter={chapter} verseInfo={verse.verse_key}/>,
        children: <div>
              <ArabicVerseWrapper>
                {verse?.text_uthmani}
              </ArabicVerseWrapper>
              <EngTranslation dangerouslySetInnerHTML={{
                __html: sanitizeHtml(verse?.translation || '')
              }} />
            </div>,
      };
    });

    return [...chapterCollapseItems, ...verseCollapseItems];
  }, [verseData, chapterData, selectedChapters, selectedVerses]);

  const activeKeys = useMemo(() => {
    return items?.length === 1 ? [items?.[0]?.key || ''] : [];
  }, [items]);

  if(versesLoading || chaptersLoading) {
    return <SpinWrapper><Spin /></SpinWrapper>;
  }

  return (
      <Collapse accordion items={items} activeKey={activeKeys}/>
  );
};

export default Results;
