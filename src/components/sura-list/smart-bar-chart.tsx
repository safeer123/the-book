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
`;

const BarItem = styled.div`
	flex: 1;
	background-color: #0e478919;
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
				const bg = record.color ? { background: record.color } : {};
				return (
					<Tooltip key={record?.id} title={record.tooltip}>
						<BarItem
							style={{ height, ...bg }}
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
