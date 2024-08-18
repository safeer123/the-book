import styled from 'styled-components';
import SmartBarChart from './smart-bar-chart';
import useChapterBarRecords from 'data/use-chapter-bar-record';
import { ChapterItem, Verse } from 'types';

const AvailableArea = styled.div`
	flex: 1;
	height: 15px;
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	transform: scaleY(-1);
`;

interface Props {
	selectedChapters?: ChapterItem[];
	selectedVerses?: Verse[];
}

const ChapterBarChart = ({ selectedChapters, selectedVerses }: Props) => {
	const barRecords = useChapterBarRecords({
		chapters: selectedChapters,
		verses: selectedVerses,
	});

	return (
		<AvailableArea>
			<SmartBarChart data={barRecords} />
		</AvailableArea>
	);
};

export default ChapterBarChart;
