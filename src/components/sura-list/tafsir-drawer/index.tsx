import { Button, Drawer as AntDrawer, Space } from 'antd';
import { FC } from 'react';
import styled from 'styled-components';
import { TafsirConfig, ChapterInfoConfig } from 'types';
import TafsirByVerse from './tafsir-by-verse';
import ChapterInfoContent from './chapter-info';
import { isMobile } from 'react-device-detect';

const Drawer = styled(AntDrawer)`
	&& .ant-drawer-wrapper-body {
		position: relative;
		background-color: rgba(255, 255, 255, 0.651);
		background-image: url(https://www.transparenttextures.com/patterns/textured-paper.png);
	}

	&& .ant-drawer-body {
		overflow-y: scroll;
	}
`;

interface Props {
	chapterInfoConfig?: ChapterInfoConfig;
	tafsirConfig?: TafsirConfig;
	onClose: () => void;
}

const TafsirDrawer: FC<Props> = ({
	tafsirConfig,
	chapterInfoConfig,
	onClose,
}) => {
	let title = '';
	if (tafsirConfig) {
		title = `Verse ${tafsirConfig?.verseKey || ''}`;
	} else if (chapterInfoConfig) {
		title = `Chapter ${chapterInfoConfig?.chapterId || ''}`;
	}
	return (
		<Drawer
			onClick={(e) => e.stopPropagation()}
			title={title}
			placement="right"
			width={isMobile ? '85%' : '70%'}
			size={'large'}
			onClose={onClose}
			open={Boolean(tafsirConfig) || Boolean(chapterInfoConfig)}
			extra={
				<Space>
					<Button onClick={onClose}>Close</Button>
				</Space>
			}
		>
			{tafsirConfig && <TafsirByVerse tafsirConfig={tafsirConfig} />}
			{chapterInfoConfig && (
				<ChapterInfoContent chapterInfoConfig={chapterInfoConfig} />
			)}
		</Drawer>
	);
};

export default TafsirDrawer;
