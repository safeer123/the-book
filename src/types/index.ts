export interface Verse {
	id: number;
	text_uthmani: string;
	verse_key: string;
	translation?: string;
}

export interface TransaltionItem {
	resource_id: number;
	text: string;
}

export interface ChapterItem {
	id: number;
	revelation_place: string;
	revelation_order: number;
	bismillah_pre: boolean;
	name_simple: string;
	name_arabic: string;
	verses_count: number;
	translated_name: {
		name: string;
	};
}

export interface SearchConfig {
	ignoreCase: boolean;
	fullWord: boolean;
}

export const ChapterToken = 'ch';
export const VerseToken = 've';
export type TokenType = 'ch' | 've';