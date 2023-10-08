import { Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BarChartRecordItem } from 'types';

const Wrapper = styled.div`
	flex: 1;
	height: inherit;
	display: flex;
	flex-direction: row-reverse;
	align-items: flex-end;
	gap: 1px;

	.bar-item {
		background-color: #0e478919;
	}

	.bar-item-selected {
		background-color: #e344005e;
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

	max-width: 15px;
	cursor: pointer;

	&:hover {
		.bar-item {
			background-color: #82bc06a2;
		}
		.bar-item-selected {
			background-color: #e34400cf;
		}
	}
`;

interface Props {
	data: BarChartRecordItem[];
	onRangeSelected?: (start: number, end: number) => void;
}

interface SelectionRange {
	ind1?: number;
	ind2?: number;
}

const SmartBarChart = ({ data, onRangeSelected }: Props) => {
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
							onClick={(e) => {
								e.stopPropagation();
								record.onClick?.();
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
		</Wrapper>
	);
};

export default SmartBarChart;
