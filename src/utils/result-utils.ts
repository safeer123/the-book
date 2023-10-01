export const verseInfoText = (infoStr?: string): string | undefined => {
	if ((infoStr?.length || 0) > 20) {
		const items = infoStr?.split(',') || [];
		return items.length >= 3
			? items[0] + '...' + items[items.length - 1]
			: (infoStr?.slice(0, 10) || '') + '...';
	}
	return infoStr;
};

export const capitalizeFirstLetter = (str: string) => {
	return str[0].toUpperCase() + str.slice(1);
};
