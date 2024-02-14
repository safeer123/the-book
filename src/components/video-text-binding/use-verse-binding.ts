import { useVerses } from 'data/use-verses';
import { useCallback, useMemo } from 'react';
import { Verse, VerseBindingElement } from 'types';

interface Props {
	currentTime?: number;
	bindingConfig: VerseBindingElement[];
}

interface VerseBindingSearchElement extends VerseBindingElement {
	index: number;
}

export const useVerseBinding = ({
	currentTime = 0,
	bindingConfig,
}: Props): {
	verses: Verse[];
	timeToVerse: (step: number) => number;
} => {
	const { data: verseData, isLoading: versesLoading } = useVerses();

	const searchBindingVerse = (
		elements: VerseBindingSearchElement[],
		t: number
	): [Verse[], number] => {
		const N = elements.length;
		if (N === 0) return [[], -1];
		else if (N === 1 && t >= elements[0].t) {
			const verses = elements[0].k
				.split(',')
				.map((key) => verseData?.ayaByKey?.[key])
				.filter((v) => !!v) as Verse[];
			return [verses, elements[0].index];
		} else {
			// binary search
			const nHalf = Math.floor(N / 2);
			if (t >= elements[nHalf].t) {
				return searchBindingVerse(elements.slice(nHalf), t);
			} else {
				return searchBindingVerse(elements.slice(0, nHalf), t);
			}
		}
	};

	const bindingConfigForSearch = useMemo(() => {
		return bindingConfig.map((b, index) => ({ ...b, index }));
	}, [bindingConfig]);

	const [verses, elementIndex] = useMemo(() => {
		if (versesLoading) {
			return [[], -1];
		}
		return searchBindingVerse(bindingConfigForSearch, currentTime);
	}, [bindingConfigForSearch, currentTime, verseData, versesLoading]);

	const timeToVerse = useCallback(
		(step: number) => {
			if (elementIndex >= 0 && bindingConfig?.[elementIndex + step]) {
				return bindingConfig?.[elementIndex + step]?.t;
			}
			return -1;
		},
		[elementIndex, bindingConfig]
	);

	return {
		verses,
		timeToVerse,
	};
};

/* 

--- how to optimise the Binary search in every t update

Keep a state called currentTimeWidow [startTime, endTime]
This state is set once we do a BS and find the verses
Avoid BS if currentTime >= startTime && currentTime < endTime

when bindingConfig changes then set currentTimeWidow [-1,-1]

----- Save and retrieve
A settings icon top left can launch a drawer
Do not close the drawer on clicking outside, we should be able to interact with video paralelly
A list of binding elements appear --> time, verseKeys (comma sep), delete option
time, verseKeys are editable
"+ Next Verse (2:33)"
"+ Blank"

Save into the local storage for now

{
  [videoUrlAsKey]: { title: "XYZ", elements: [] },
}
*/
