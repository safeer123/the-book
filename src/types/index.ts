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

export interface Selection {
	chapters?: number[];
	verses?: string[];
	searchKeys?: string[];
}
