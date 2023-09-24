import useURLNavigation from 'data/use-url-navigation';
import styled from 'styled-components';
import { ChapterItem } from 'types';
import { verseInfoText } from 'utils/result-utils';

const TitleWrapper = styled.div`
	font-size: 18px;
	color: #605757;
	gap: 24px;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-right: 16px;
	cursor: pointer;
`;

const ArabicTitle = styled.span`
	font-size: 24px;
	font-family: 'Amiri Quran';
	color: #621515;
	margin-bottom: 16px;
`;

const ChapterIndex = styled.span`
	font-size: 18px;
	color: #621515;
`;

const VerseDetails = styled.span`
	color: #505050;
	font-size: 14px;
`;

interface Props {
	chapter?: ChapterItem;
	verseInfo?: string;
}

const ChapterTitle = ({ chapter, verseInfo }: Props) => {
	const { toChapterPage } = useURLNavigation();

	const verseInfoDisplay = verseInfoText(verseInfo);

	return (
		<TitleWrapper onClick={() => toChapterPage(chapter?.id || 1)}>
			<VerseDetails>
				{verseInfoDisplay || `${chapter?.verses_count || ''} Verses`}
			</VerseDetails>
			<span>({chapter?.translated_name?.name})</span>
			<span>{chapter?.name_simple}</span>
			<ArabicTitle>{chapter?.name_arabic}</ArabicTitle>
			<ChapterIndex>({chapter?.id})</ChapterIndex>
		</TitleWrapper>
	);
};

export default ChapterTitle;
