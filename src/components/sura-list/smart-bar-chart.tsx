import { Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
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
const ViewIndicator = styled.div<{ $right: number; $width: number }>`
	position: absolute;
	bottom: -4px;
	height: 2px;
	min-width: 3px;
	border-radius: 1px;
	background-color: rgba(16, 185, 129, 0.9);
	right: ${({ $right }) => $right}%;
	width: ${({ $width }) => $width}%;
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
		<Wrapper>
			{data?.map((record, index) => {
				const height = `${(100 * record.value) / maxValue}%`;
				return (
					<Tooltip key={record?.id} title={record.tooltip} placement="bottom">
						<BarItemWrapper
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
					</Tooltip>
				);
			})}
			{viewRange && data.length > 0 && (
				<ViewIndicator
					$right={((viewRange.start - 1) / data.length) * 100}
					$width={((viewRange.end - viewRange.start + 1) / data.length) * 100}
				/>
			)}
		</Wrapper>
	);
};

export default SmartBarChart;
