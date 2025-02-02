interface TranslationItem {
	id: number;
	name: string;
	author_name: string;
	language_name: string;
}

interface ExtendedTranslationItem extends TranslationItem {
	hitCount: number;
}

// Function to update hit count
export function updateHitCount(trItem: TranslationItem): void {
	const key = `translation_${trItem.id}`;
	const storedItem = localStorage.getItem(key);

	let extendedItem: ExtendedTranslationItem;

	if (storedItem) {
		extendedItem = JSON.parse(storedItem) as ExtendedTranslationItem;
		extendedItem.hitCount += 1; // Increment hit count
	} else {
		extendedItem = { ...trItem, hitCount: 1 }; // Initialize with hitCount = 1
	}

	localStorage.setItem(key, JSON.stringify(extendedItem));
}

// Function to get the top 3 hit translations
export function getTopHitTranslations(): ExtendedTranslationItem[] {
	const translations: ExtendedTranslationItem[] = [];

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key && key.startsWith('translation_')) {
			const item = localStorage.getItem(key);
			if (item) {
				translations.push(JSON.parse(item) as ExtendedTranslationItem);
			}
		}
	}

	// Sort by hitCount in descending order and get the top 3
	return translations.sort((a, b) => b.hitCount - a.hitCount).slice(0, 3);
}
