import { useVerses } from 'data/use-verses';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Verse, VerseBindingElement } from 'types';

interface Props {
	currentTime?: number;
	bindingConfig: VerseBindingElement[];
}

interface VerseBindingSearchElement extends VerseBindingElement {
	index: number;
}

interface Keyframe {
	elementIndex: number;
	verses: Verse[];
	startTime: number;
	endTime: number;
}

export const useVerseBinding = ({
	currentTime = 0,
	bindingConfig,
}: Props): {
	verses: Verse[];
	timeToVerse: (step: number) => number;
} => {
	const [keyframe, setKeyframe] = useState<Keyframe | undefined>();
	const { data: verseData, isLoading: versesLoading } = useVerses();
	const [searchParams] = useSearchParams();
	const trIdStr = searchParams.get('tr');

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

	useEffect(() => {
		if (versesLoading) {
			return;
		}
		if (
			keyframe &&
			currentTime >= keyframe?.startTime &&
			currentTime < keyframe?.endTime
		) {
			return;
		}
		const [verses, index] = searchBindingVerse(
			bindingConfigForSearch,
			currentTime
		);

		if (
			index === -1 &&
			currentTime < (bindingConfigForSearch?.at(-1)?.t || 0) &&
			keyframe
		) {
			setKeyframe(undefined);
		}

		if (bindingConfigForSearch?.[index]) {
			setKeyframe({
				elementIndex: index,
				verses,
				startTime: bindingConfigForSearch?.[index]?.t,
				endTime: bindingConfigForSearch?.[index + 1]?.t || Infinity,
			});
		}
	}, [bindingConfigForSearch, currentTime, verseData, versesLoading]);

	useEffect(() => {
		setKeyframe(undefined);
	}, [trIdStr]);

	useEffect(() => {
		return () => setKeyframe(undefined);
	}, [bindingConfigForSearch]);

	const verses = keyframe?.verses || [];
	const elementIndex = keyframe?.elementIndex || -1;

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
