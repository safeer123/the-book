import { useQuery, UseQueryResult } from "react-query";
import axios from "axios";
import { TransaltionItem, Verse } from "../components/types";

type VerseData = {
  verses: Verse[];
}

type TranslationData = {
  translations: TransaltionItem[];
}

type VerseByKey = {
  [key:string]: Verse;
}

const url_all_verses = "https://api.quran.com/api/v4/quran/verses/uthmani";
const url_translation = "https://api.quran.com/api/v4/quran/translations/131";

const mergeTranslation = (verses: Verse[], transations: TransaltionItem[]) => {
  for(let i = 0; i < verses?.length; i += 1) {
    verses[i].translation = transations[i]?.text;
  } 
}

export const useVerses = (): UseQueryResult<{verses: Verse[]; ayaByKey:VerseByKey; }> => {
  return useQuery(["quran-verses"], async () => {
    const { data }: { data: VerseData } = await axios.get(
      url_all_verses
    );
    const { data: translationsData }: { data: TranslationData } = await axios.get(
      url_translation
    );
    mergeTranslation(data.verses, translationsData?.translations);
    const ayaByKey: {[key:string]: Verse } = {};
    data.verses?.forEach((verse: Verse) => {
      ayaByKey[verse?.verse_key || ""] = verse;
    });
    return {
      verses: data.verses,
      ayaByKey
    };
  }, {
    staleTime: Infinity
  });
};
