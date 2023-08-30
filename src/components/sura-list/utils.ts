import { ChapterItem, Verse } from "../types";

export const getOptionKey = (item: Verse | ChapterItem) => {
    if("verses_count" in item) {
        return `ch-${item.id}`;
    } 
    return `ve-${item.verse_key}`
}

export const parseOptionKey = (key: string) => {
    return key.split('-');
}

export const getExtStr = (itemList?: any[]): [string, boolean] => {
    if((itemList || []).length === 0) {
      return ["No Match", false];
    }
    if((itemList || []).length === 1) {
      return ["", false];
    }
    return [`${(itemList || []).length}`, true];
  }