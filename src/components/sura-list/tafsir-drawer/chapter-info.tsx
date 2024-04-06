import { Spin } from 'antd';
import { FC } from 'react';
import styled from 'styled-components';
import { ChapterInfoConfig } from 'types';
import sanitizeHtml from 'sanitize-html';
import { useChapterInfoById } from 'data/use-chapter-info';

const SpinnerWrapper = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const ShortTextWrapper = styled.div`
	font-family: 'Amiri Quran';
	color: rgb(7 1 62);
	line-height: 1.2;
	border-radius: 4px;

	@media (min-width: 320px) {
		font-size: 14px;
		padding: 4px;
		margin: 4px;
		border: 1px dashed #777;
	}

	@media (min-width: 961px) {
		font-size: 20px;
		padding: 16px;
		margin: 16px;
		border: 3px dashed #777;
	}
`;

const SourceInfoWrapper = styled.div`
	color: black;
	padding: 16px;
	margin: 16px;

	@media (min-width: 320px) {
		font-size: 10px;
	}

	@media (min-width: 961px) {
		font-size: 14px;
	}
`;

const DetailedContentWrapper = styled.div`
	font-family: 'Amiri Quran';
	color: rgb(7 1 62);
	line-height: 1.2;
	padding-top: 16px;

	h1,
	h2 {
		margin-bottom: 16px;
		margin-block-start: 0;
		margin-block-end: 0;
		margin-inline-start: 0;
		margin-inline-end: 0;
	}

	a {
		color: inherit;
	}

	@media (min-width: 320px) {
		font-size: 16px;

		h1,
		h2 {
			font-size: 18px;
		}
	}

	@media (min-width: 961px) {
		font-size: 20px;

		h1,
		h2 {
			font-size: 24px;
		}
	}
`;

interface Props {
	chapterInfoConfig?: ChapterInfoConfig;
}

const ChapterInfoContent: FC<Props> = ({ chapterInfoConfig }) => {
	const { data: chapterInfo, isLoading } = useChapterInfoById(
		chapterInfoConfig?.chapterId
	);

	return (
		<div>
			<ShortTextWrapper
				dangerouslySetInnerHTML={{
					__html: sanitizeHtml(chapterInfo?.short_text || ''),
				}}
			/>
			<SourceInfoWrapper>{`✍️
  ${chapterInfo?.source || ''}`}</SourceInfoWrapper>
			<DetailedContentWrapper
				dangerouslySetInnerHTML={{
					__html: sanitizeHtml(chapterInfo?.text || ''),
				}}
			/>
			{isLoading && (
				<SpinnerWrapper>
					<Spin />
				</SpinnerWrapper>
			)}
		</div>
	);
};

export default ChapterInfoContent;
