export const isFullSurah = (title: string | undefined): boolean => {
	if (!title?.trim()) return false;
	return !/[\d[\](){}]/.test(title);
};
