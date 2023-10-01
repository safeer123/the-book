import { Button, Tooltip } from 'antd';
import useURLNavigation from 'data/use-url-navigation';
import styled from 'styled-components';
import { ChapterInfoConfig, ChapterItem } from 'types';
import { capitalizeFirstLetter, verseInfoText } from 'utils/result-utils';

const TitleWrapper = styled.div`
	font-size: 18px;
	color: #605757;
	gap: 24px;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-right: 16px;
`;

const ArabicTitle = styled.span`
	font-size: 24px;
	font-family: 'Amiri Quran';
	color: #621515;
	margin-bottom: 16px;

	&:hover {
		color: #004cb6;
	}
`;

const TitleText = styled.span`
	cursor: pointer;

	&:hover {
		color: #004cb6;
	}
`;

const ChapterIndex = styled.span`
	font-size: 18px;
	color: #621515;
`;

const VerseDetails = styled.span`
	color: #505050;
	font-size: 14px;
`;

const RevelationPlaceInfo = styled.div`
	color: #505050;
	font-size: 14px;
	background-color: #bdbdbd75;
	padding: 0px 10px;
	border-radius: 4px;
	border: 1px solid #aaaaaa;
`;

interface Props {
	chapter?: ChapterItem;
	verseInfo?: string;
	setChapterInfoConfig: (info: ChapterInfoConfig) => void;
}

const ChapterTitle = ({ chapter, verseInfo, setChapterInfoConfig }: Props) => {
	const { toChapterPage } = useURLNavigation();

	const verseInfoDisplay = verseInfoText(verseInfo);

	const navigateToChapter = () => toChapterPage(chapter?.id || 1);

	return (
		<TitleWrapper>
			{!verseInfo && (
				<Tooltip
					title={`Revealed in ${capitalizeFirstLetter(
						chapter?.revelation_place || ''
					)}`}
					placement="bottom"
				>
					<RevelationPlaceInfo>
						{capitalizeFirstLetter(chapter?.revelation_place || '')}
					</RevelationPlaceInfo>
				</Tooltip>
			)}

			<Tooltip title="Chapter details" placement="bottom">
				<Button
					type="text"
					onClick={() => setChapterInfoConfig({ chapterId: chapter?.id })}
				>
					{'📖'}
				</Button>
			</Tooltip>

			<VerseDetails>
				{verseInfoDisplay || `${chapter?.verses_count || ''} Verses`}
			</VerseDetails>
			<TitleText onClick={navigateToChapter}>
				({chapter?.translated_name?.name})
			</TitleText>
			<TitleText onClick={navigateToChapter}>{chapter?.name_simple}</TitleText>
			<ArabicTitle onClick={navigateToChapter}>
				{chapter?.name_arabic}
			</ArabicTitle>
			<ChapterIndex>({chapter?.id})</ChapterIndex>
		</TitleWrapper>
	);
};

export default ChapterTitle;
