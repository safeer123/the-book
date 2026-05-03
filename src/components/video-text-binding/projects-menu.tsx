/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tooltip, Input } from 'antd';
import type { InputRef } from 'antd';
import { ProjectConfig } from 'types';

const { Search } = Input;

const ProjectsMenuWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	align-items: stretch;
	width: 360px;
`;

const ProjectItemWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	align-items: flex-end;
	max-height: 60vh;
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

	&&&:hover {
		background-color: #d8e1fcbf;
	}
`;

interface Props {
	projects: ProjectConfig[];
	projectConfig?: ProjectConfig;
	viewerMode?: boolean;
	onClickProjectItem: (p: ProjectConfig) => void;
	newProject: () => void;
	open?: boolean;
}

const ProjectsMenu = ({
	projects,
	projectConfig,
	viewerMode,
	onClickProjectItem,
	newProject,
	open,
}: Props) => {
	const [searchInput, setSearchInput] = useState('');
	const searchRef = useRef<InputRef>(null);

	useEffect(() => {
		if (open) {
			setTimeout(() => searchRef.current?.focus(), 50);
		} else {
			setSearchInput('');
		}
	}, [open]);

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
				ref={searchRef}
				value={searchInput}
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
