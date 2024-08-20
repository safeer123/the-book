/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import styled from 'styled-components';
import { useMemo, useState } from 'react';
import { Button, Tooltip, Input } from 'antd';
import { ProjectConfig } from 'types';

const { Search } = Input;

const ProjectsMenuWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	align-items: stretch;
	width: 300px;
`;

const ProjectItemWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	align-items: flex-end;
	max-height: 400px;
	overflow-y: scroll;
	overflow-x: hidden;

	.active-item {
		background-color: #d8e1fc;
	}
`;

const ProjectItem = styled(Button)`
	width: 100%;
	padding: 4px;
	display: flex;
	justify-content: flex-start;

	background-color: #ffffff;
	cursor: pointer;

	&:hover {
		background-color: #f0f0f0;
	}
`;

interface Props {
	projects: ProjectConfig[];
	projectConfig?: ProjectConfig;
	viewerMode?: boolean;
	onClickProjectItem: (p: ProjectConfig) => void;
	newProject: () => void;
}

const ProjectsMenu = ({
	projects,
	projectConfig,
	viewerMode,
	onClickProjectItem,
	newProject,
}: Props) => {
	const [searchInput, setSearchInput] = useState('');

	const filteredProjects = useMemo(() => {
		return (projects || []).filter((p) =>
			p?.title?.toLowerCase()?.includes(searchInput.toLowerCase())
		);
	}, [projects, searchInput]);

	return (
		<ProjectsMenuWrapper>
			{!viewerMode && (
				<Button
					key={'new-project'}
					size="small"
					type="primary"
					onClick={() => newProject()}
				>
					{'＋ New Project'}
				</Button>
			)}

			<Search
				placeholder="Search.."
				onChange={(e) => setSearchInput(e.target.value)}
				allowClear
			/>

			<ProjectItemWrapper>
				{filteredProjects.map((p) => (
					<Tooltip
						key={p.id}
						mouseEnterDelay={1}
						title={`${p?.verseId || '-'}. ${p.title}`}
						placement="left"
					>
						<ProjectItem
							size="small"
							type="text"
							onClick={() => onClickProjectItem(p)}
							className={p.id === projectConfig?.id ? 'active-item' : ''}
						>
							{p.title}
						</ProjectItem>
					</Tooltip>
				))}
			</ProjectItemWrapper>
		</ProjectsMenuWrapper>
	);
};

export default ProjectsMenu;
