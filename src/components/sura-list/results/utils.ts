import { TranslationItem } from 'data/use-translations';

export function capitalizeNames(names: string): string {
	return names
		.split(',')
		.map(
			(word) =>
				word.trim().charAt(0).toUpperCase() + word.trim().slice(1).toLowerCase()
		)
		.join(',');
}

export function capitalizeObjectKeys<
	T extends Record<string, TranslationItem[]>
>(obj: T): Record<string, TranslationItem[]> {
	const newObj: Record<string, TranslationItem[]> = {};

	Object.keys(obj).forEach((key) => {
		const newKey = capitalizeNames(key);
		newObj[newKey] = obj[key];
	});

	return newObj;
}
