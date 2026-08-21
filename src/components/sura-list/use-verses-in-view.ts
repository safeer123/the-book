import { useEffect, useRef, useState } from 'react';

interface Props {
	chapterId: number;
	versesCount: number;
	enabled: boolean;
}

interface ViewRange {
	start: number;
	end: number;
}

// Tracks which verse rows (by id `ve-${chapterId}:${n}`) are currently
// visible inside the page's scrollable content area, so the per-chapter bar
// chart can show a "you are here" band while the reader scrolls a long
// surah. A single IntersectionObserver instance watches every row instead of
// one observer per row, which stays cheap even for a 286-verse chapter.
const useVersesInView = ({
	chapterId,
	versesCount,
	enabled,
}: Props): ViewRange | undefined => {
	const [range, setRange] = useState<ViewRange | undefined>();
	const visibleRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		if (!enabled || !versesCount) {
			setRange(undefined);
			return undefined;
		}

		visibleRef.current = new Set();
		const scrollRoot = document.querySelector('.scrollable');

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const num = Number((entry.target as HTMLElement).dataset.verseNum);
					if (!num) return;
					if (entry.isIntersecting) {
						visibleRef.current.add(num);
					} else {
						visibleRef.current.delete(num);
					}
				});

				if (visibleRef.current.size === 0) {
					setRange(undefined);
				} else {
					const nums = Array.from(visibleRef.current);
					setRange({ start: Math.min(...nums), end: Math.max(...nums) });
				}
			},
			{ root: scrollRoot, threshold: 0 }
		);

		for (let i = 1; i <= versesCount; i += 1) {
			const el = document.getElementById(`ve-${chapterId}:${i}`);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [chapterId, versesCount, enabled]);

	return range;
};

export default useVersesInView;
