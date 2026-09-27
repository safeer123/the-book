import AppTooltip from 'components/app-tooltip';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { BarChartRecordItem } from 'types';

const Wrapper = styled.div`
	position: relative;
	flex: 1;
	height: inherit;
	display: flex;
	flex-direction: row-reverse;
	justify-content: flex-end;
	align-items: flex-end;
	gap: 1px;

	.bar-item {
		background-color: #0e478919;
	}

	.bar-item-selected {
		background-color: #e344005e;
	}

	.bar-wrapper-selected {
		background-color: rgba(100, 100, 100, 0.2);
		// border: 0.2px dashed #1ec002a8;
		box-sizing: content-box;
	}

	[data-theme='dark'] & {
		.bar-item {
			background-color: rgba(156, 142, 224, 0.35);
		}

		.bar-item-selected {
			background-color: rgba(255, 138, 101, 0.55);
		}

		.bar-wrapper-selected {
			background-color: rgba(156, 142, 224, 0.15);
		}
	}
`;

const BarItem = styled.div`
	flex: 1;
`;

const BarItemWrapper = styled.div`
	flex: 1;
	height: 100%;
	display: flex;
	align-items: flex-end;
	background-color: rgba(100, 100, 100, 0.05);
	box-sizing: content-box;

	max-width: 15px;
	cursor: pointer;

	&:hover {
		background-color: rgba(100, 100, 100, 0.2);
		.bar-item {
			background-color: #82bc06a2;
		}
		.bar-item-selected {
			background-color: #e34400cf;
		}
	}

	[data-theme='dark'] & {
		background-color: rgba(156, 142, 224, 0.06);

		&:hover {
			background-color: rgba(156, 142, 224, 0.25);
			.bar-item {
				background-color: #c4b8f0;
			}
			.bar-item-selected {
				background-color: #ff9d7a;
			}
		}
	}
`;

// A horizontal line under the bars for the range of verses currently
// visible in the reader's viewport — a "you are here" minimap indicator,
// deliberately not reusing the selection colors (blue/orange) so it can't
// be confused with a click-selection.
//
// Positioned from measured bar pixel offsets rather than a percentage of
// the wrapper's width: bars are capped at `max-width: 15px` and packed
// against one edge, so the bar row often doesn't span the full wrapper
// (e.g. short chapters), which a percentage-based position would ignore.
const ViewIndicator = styled.div<{ $left: number; $width: number }>`
	position: absolute;
	bottom: -4px;
	height: 2px;
	min-width: 3px;
	border-radius: 1px;
	background-color: rgba(16, 185, 129, 0.9);
	left: ${({ $left }) => $left}px;
	width: ${({ $width }) => $width}px;
	pointer-events: none;

	[data-theme='dark'] & {
		background-color: rgba(94, 234, 212, 0.95);
	}
`;

interface Props {
	data: BarChartRecordItem[];
	onRangeSelected?: (start: number, end: number) => void;
	onClickSmartBarItem?: (verseKey: string) => void;
	viewRange?: { start: number; end: number };
}

interface SelectionRange {
	ind1?: number;
	ind2?: number;
}

const SmartBarChart = ({
	data,
	onRangeSelected,
	onClickSmartBarItem,
	viewRange,
}: Props) => {
	const [selectionRange, setSelectionRange] = useState<
		SelectionRange | undefined
	>();

	const wrapperRef = useRef<HTMLDivElement>(null);
	const barRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [indicatorRect, setIndicatorRect] = useState<{
		left: number;
		width: number;
	} | null>(null);

	useLayoutEffect(() => {
		const wrapperEl = wrapperRef.current;
		if (!wrapperEl) return;

		const recompute = () => {
			const startEl = viewRange && barRefs.current[viewRange.start - 1];
			const endEl = viewRange && barRefs.current[viewRange.end - 1];
			if (!startEl || !endEl) {
				setIndicatorRect(null);
				return;
			}
			const wrapperRect = wrapperEl.getBoundingClientRect();
			const startRect = startEl.getBoundingClientRect();
			const endRect = endEl.getBoundingClientRect();
			const left = Math.min(startRect.left, endRect.left) - wrapperRect.left;
			const right = Math.max(startRect.right, endRect.right) - wrapperRect.left;
			setIndicatorRect({ left, width: right - left });
		};

		recompute();

		const resizeObserver = new ResizeObserver(recompute);
		resizeObserver.observe(wrapperEl);
		return () => resizeObserver.disconnect();
	}, [viewRange, data.length]);

	const maxValue = useMemo(() => {
		return Math.max(...data.map((rec) => rec.value));
	}, [data]);

	const onSelectionStart = (ind: number) => {
		setSelectionRange({ ind1: ind });
	};

	const onSelectionProgress = (ind: number) => {
		setSelectionRange((r) => r && { ...r, ind2: ind });
	};

	const onSelectionEnd = (ind: number) => {
		if (Number.isFinite(selectionRange?.ind1) && Number.isFinite(ind)) {
			if (selectionRange?.ind1 === ind) {
				data?.[ind]?.onClick?.();
				onClickSmartBarItem?.(data?.[ind]?.id);
			} else {
				onRangeSelected?.(
					Math.min(selectionRange?.ind1 || 0, ind || 0),
					Math.max(selectionRange?.ind1 || 0, ind || 0)
				);
			}
		}
		setSelectionRange(undefined);
	};

	useEffect(() => {
		document.addEventListener('mouseup', () => {
			setSelectionRange(undefined);
		});
	}, []);

	const shouldHighlight = (ind: number) => {
		if (
			Number.isFinite(selectionRange?.ind1) &&
			Number.isFinite(selectionRange?.ind2)
		) {
			const i1 = Math.min(selectionRange?.ind1 || 0, selectionRange?.ind2 || 0);
			const i2 = Math.max(selectionRange?.ind1 || 0, selectionRange?.ind2 || 0);
			return ind >= i1 && ind <= i2;
		}
	};

	return (
		<Wrapper ref={wrapperRef}>
			{data?.map((record, index) => {
				const height = `${(100 * record.value) / maxValue}%`;
				return (
					<AppTooltip
						key={record?.id}
						title={record.tooltip}
						placement="bottom"
					>
						<BarItemWrapper
							ref={(el) => (barRefs.current[index] = el)}
							className={
								record.selected || shouldHighlight(index)
									? 'bar-wrapper-selected'
									: undefined
							}
							onClick={(e) => {
								e.stopPropagation();
								record.onClick?.();
								onClickSmartBarItem?.(record.id);
							}}
							onDoubleClick={(e) => {
								e.stopPropagation();
								record.onDoubleClick?.();
							}}
							onMouseDown={() => onSelectionStart(index)}
							onMouseUp={(e) => {
								e.stopPropagation();
								onSelectionEnd(index);
							}}
							onMouseEnter={() => onSelectionProgress(index)}
						>
							<BarItem
								className={
									record.selected || shouldHighlight(index)
										? 'bar-item-selected'
										: 'bar-item'
								}
								style={{ height }}
							/>
						</BarItemWrapper>
					</AppTooltip>
				);
			})}
			{indicatorRect && (
				<ViewIndicator
					$left={indicatorRect.left}
					$width={indicatorRect.width}
				/>
			)}
		</Wrapper>
	);
};

export default SmartBarChart;
