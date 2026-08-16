import { ProjectConfig } from 'types';

export const isFullSurah = (title: string | undefined): boolean => {
	if (!title?.trim()) return false;
	return !/[\d[\](){}]/.test(title);
};

export const getReciterFromTitle = (title: string): string => {
	const dashIdx = title.indexOf(' - ');
	return dashIdx !== -1 ? title.slice(dashIdx + 3).trim() : title.trim();
};

export const getChapterIdForProject = (
	project: ProjectConfig
): number | undefined => {
	if (project.verseId && project.verseId >= 1 && project.verseId <= 114) {
		return project.verseId;
	}
	for (const b of project.bindingConfig || []) {
		const chNum = Number(b.k.split(':')[0]);
		if (Number.isInteger(chNum) && chNum >= 1 && chNum <= 114) return chNum;
	}
	return undefined;
};

export interface ChapterRecitation {
	reciter: string;
	project: ProjectConfig;
}

export const buildChapterRecitations = (
	projects: ProjectConfig[]
): Map<number, ChapterRecitation[]> => {
	const map = new Map<number, ChapterRecitation[]>();
	for (const project of projects) {
		if (!isFullSurah(project.title)) continue;
		const chapterId = getChapterIdForProject(project);
		if (!chapterId) continue;
		const reciter = getReciterFromTitle(project.title);
		if (!reciter) continue;
		const existing = map.get(chapterId) ?? [];
		existing.push({ reciter, project });
		map.set(chapterId, existing);
	}
	return map;
};
