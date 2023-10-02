import { Tooltip } from 'antd';
import { useMemo } from 'react';
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

		&:hover {
			background-color: #82bc06a2;
		}
	}

	.bar-item-selected {
		background-color: #e344005e;

		&:hover {
			background-color: #e34400cf;
		}
	}
`;

const BarItem = styled.div`
	flex: 1;

	max-width: 15px;
	cursor: pointer;

	&:hover {
		background-color: #82bc06a2;
	}
`;

interface Props {
	data: BarChartRecordItem[];
}

const SmartBarChart = ({ data }: Props) => {
	const maxValue = useMemo(() => {
		return Math.max(...data.map((rec) => rec.value));
	}, [data]);

	return (
		<Wrapper>
			{data?.map((record) => {
				const height = `${(100 * record.value) / maxValue}%`;
				return (
					<Tooltip key={record?.id} title={record.tooltip}>
						<BarItem
							className={record.selected ? 'bar-item-selected' : 'bar-item'}
							style={{ height }}
							onClick={(e) => {
								e.stopPropagation();
								record.onClick?.();
							}}
						/>
					</Tooltip>
				);
			})}
		</Wrapper>
	);
};

export default SmartBarChart;
