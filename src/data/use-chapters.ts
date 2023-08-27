import { useQuery, UseQueryResult } from "react-query";
import axios from "axios";
import { ChapterItem } from "../components/types";

const url_chapters = "https://api.quran.com/api/v4/chapters";

type SuraByKey = {
  [key:number]: ChapterItem;
}

interface ChapterData {
  chapters: ChapterItem[];
  suraByKey: SuraByKey;
}

export const useChapters = (): UseQueryResult<ChapterData> => {
    return useQuery(["quran-chapters"], async () => {
      const { data }: { data: {chapters: ChapterItem[]} } = await axios.get(
        url_chapters
      );

      const suraByKey = data?.chapters?.reduce((lookup, chapter) => ({ ...lookup, [chapter.id]: chapter }), {});

      return {
        chapters: data?.chapters,
        suraByKey,
      };
    }, 
    {
      staleTime: Infinity
    });
  };