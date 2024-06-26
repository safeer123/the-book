import { ReactNode } from 'react';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';

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
	matchCase: boolean;
	fullWord: boolean;
}

export const ChapterToken = 'ch';
export const VerseToken = 've';
export type TokenType = 'ch' | 've';

export interface TafsirConfig {
	verseKey?: string;
	chapterId?: number;
}

export interface ChapterInfoConfig {
	chapterId?: number;
}

export interface TafsirInfoItem {
	author_name: string;
	id: number;
	language_name: string;
	name: string;
	slug: string;
}

export interface TafsirDataItem {
	resource_id: number;
	text: string;
}

export type TafsirItem = TafsirInfoItem & TafsirDataItem;

export interface ChapterInfoItem {
	chapter_id: number;
	language_name: string;
	short_text: string;
	source: string;
	text: string;
}

export interface BarChartRecordItem {
	id: string;
	value: number;
	tooltip?: ReactNode;
	selected?: boolean;
	onClick?: () => void;
}

export interface VerseBindingElement {
	id: number;
	t: number;
	k: string;
}

export interface ProjectConfig {
	id: string;
	title: string;
	videoUrl: string;
	bindingConfig: VerseBindingElement[];
	verseId?: number;
}

export interface VideoStatusInfo {
	duration?: number;
	playStatus?: PlayerStates;
}
