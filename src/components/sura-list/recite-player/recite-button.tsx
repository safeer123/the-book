import { useMemo, useState } from 'react';
import { Button, Popover, Tooltip } from 'antd';
import { CustomerServiceOutlined, PlayCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { isPhone } from 'utils/device-utils';
import { ProjectConfig } from 'types';
import { DARK_POPOVER_STYLE, useAppTheme } from 'context/theme-context';
import { useRecitePlayer } from './context';

const ListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 220px;
	max-width: 280px;
`;

const ReciterRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 6px 0;

	& + & {
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}

	[data-theme='dark'] & + & {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}
`;

const ReciterInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
	overflow: hidden;
`;

const ReciterName = styled.span`
	font-family: Georgia, 'Times New Roman', serif;
	font-size: 14px;
	font-weight: 600;
	letter-spacing: 0.01em;
	color: rgba(0, 0, 0, 0.85);

	[data-theme='dark'] & {
		color: #f0ebff;
	}
`;

const ProjectTitle = styled.span`
	font-size: 11px;
	color: rgba(0, 0, 0, 0.45);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	[data-theme='dark'] & {
		color: #a89cd8;
	}
`;

interface Props {
	verseKey: string;
}

const ReciteButton = ({ verseKey }: Props) => {
	const [open, setOpen] = useState(false);
	const { recitationsByChapter, start } = useRecitePlayer();
	const { mode } = useAppTheme();

	const chapterId = useMemo(() => Number(verseKey.split(':')[0]), [verseKey]);
	const recitations = recitationsByChapter.get(chapterId);

	if (!recitations?.length) return null;

	const onPlay = (project: ProjectConfig) => {
		start(project, verseKey);
		setOpen(false);
	};

	const reciteButtonEl = (
		<Button
			className="verse-recite-btn"
			type="text"
			icon={<CustomerServiceOutlined />}
		/>
	);

	const content = (
		<ListWrapper>
			{recitations.map(({ reciter, project }) => (
				<ReciterRow key={project.videoUrl}>
					<ReciterInfo>
						<ReciterName>{reciter}</ReciterName>
						<ProjectTitle title={project.title}>{project.title}</ProjectTitle>
					</ReciterInfo>
					<Button
						size="small"
						type="primary"
						icon={<PlayCircleOutlined />}
						onClick={() => onPlay(project)}
					>
						Play
					</Button>
				</ReciterRow>
			))}
		</ListWrapper>
	);

	return (
		<Popover
			trigger="click"
			content={content}
			open={open}
			onOpenChange={setOpen}
			placement="bottomLeft"
			overlayInnerStyle={mode === 'dark' ? DARK_POPOVER_STYLE : undefined}
		>
			{isPhone ? (
				reciteButtonEl
			) : (
				<Tooltip title="Listen" placement="bottom">
					{reciteButtonEl}
				</Tooltip>
			)}
		</Popover>
	);
};

export default ReciteButton;
