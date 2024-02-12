import { useVerses } from 'data/use-verses';
import { useMemo, useState } from 'react';
import { Verse, VerseBindingElement } from 'types';

interface Props {
	currentTime?: number;
	bindingConfig: VerseBindingElement[];
}

export const useVerseBinding = ({
	currentTime = 0,
	bindingConfig,
}: Props): {
	verses: Verse[];
} => {
	const { data: verseData, isLoading: versesLoading } = useVerses();

	const searchBindingVerse = (
		elements: VerseBindingElement[],
		t: number
	): Verse[] => {
		const N = elements.length;
		if (N === 0) return [];
		else if (N === 1 && t >= elements[0].t) {
			return elements[0].k
				.split(',')
				.map((key) => verseData?.ayaByKey?.[key])
				.filter((v) => !!v) as Verse[];
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

	const verses = useMemo(() => {
		return searchBindingVerse(bindingConfig, currentTime);
	}, [bindingConfig, currentTime, verseData]);

	return {
		verses,
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
