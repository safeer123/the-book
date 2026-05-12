/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Tooltip } from 'antd';
import type { InputRef } from 'antd';
import { OrderedListOutlined, PlusOutlined } from '@ant-design/icons';
import { ProjectConfig } from 'types';
import { useChapters } from 'data/use-chapters';
import { formatDuration } from './utils';
import AllSurahsModal from './all-surahs-modal';

const { Search } = Input;

const ProjectsMenuWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 320px;
	max-height: 70vh;
	overflow: hidden;
`;

const MenuHeader = styled.div`
	padding: 10px 10px 8px;
	border-bottom: 1px solid #f0f0f0;
`;

const ProjectItemWrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 4px;
	min-height: 0;
`;

const ProjectItem = styled.button`
	width: 100%;
	padding: 7px 10px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	background: transparent;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 13px;
	color: #262626;
	text-align: left;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	transition: background 0.12s;
	flex-shrink: 0;

	&:hover {
		background: #f0f4ff;
	}

	&.active-item {
		background: #e8edff;
		color: #2f54eb;
		font-weight: 500;
	}
`;

const EmptyState = styled.div`
	padding: 24px 12px;
	text-align: center;
	color: #bfbfbf;
	font-size: 13px;
`;

const MenuFooter = styled.div`
	border-top: 1px solid #f0f0f0;
	padding: 8px 10px;
	display: flex;
	gap: 6px;
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
	const [allSurahsOpen, setAllSurahsOpen] = useState(false);
	const searchRef = useRef<InputRef>(null);
	const { data: chaptersData } = useChapters();

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
			<MenuHeader>
				<div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
					<Search
						ref={searchRef}
						value={searchInput}
						placeholder="Search projects…"
						onChange={(e) => setSearchInput(e.target.value)}
						allowClear
						size="small"
						style={{ flex: 1 }}
					/>
					{!viewerMode && (
						<Tooltip title="New project" placement="bottom">
							<Button
								type="primary"
								size="small"
								icon={<PlusOutlined />}
								onClick={() => newProject()}
							/>
						</Tooltip>
					)}
				</div>
			</MenuHeader>

			<ProjectItemWrapper>
				{filteredProjects.length === 0 ? (
					<EmptyState>No projects found</EmptyState>
				) : (
					filteredProjects.map((p) => {
						const chapter =
							p.verseId && chaptersData?.suraByKey
								? chaptersData.suraByKey[p.verseId]
								: undefined;
						const tooltipContent = chapter ? (
							<div style={{ lineHeight: 1.6 }}>
								<div style={{ fontWeight: 600, fontSize: 13 }}>
									{chapter.name_simple}{' '}
									<span
										style={{
											fontWeight: 400,
											color: 'rgba(255,255,255,0.75)',
											fontSize: 14,
											fontFamily: 'serif',
										}}
									>
										{chapter.name_arabic}
									</span>
								</div>
								<div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
									#{chapter.id} · {chapter.translated_name.name} ·{' '}
									{chapter.verses_count} verses ·{' '}
									{chapter.revelation_place === 'makkah' ? 'Makkah' : 'Madinah'}
									{p.duration ? ` · ⏱ ${formatDuration(p.duration)}` : ''}
								</div>
							</div>
						) : p.duration ? (
							<span style={{ fontSize: 11 }}>
								⏱ {formatDuration(p.duration)}
							</span>
						) : undefined;
						return (
							<Tooltip
								key={p.id}
								title={tooltipContent}
								placement="right"
								mouseEnterDelay={0.4}
							>
								<ProjectItem
									onClick={() => onClickProjectItem(p)}
									className={p.id === projectConfig?.id ? 'active-item' : ''}
								>
									{p.title || (
										<span style={{ color: '#bfbfbf' }}>—untitled—</span>
									)}
								</ProjectItem>
							</Tooltip>
						);
					})
				)}
			</ProjectItemWrapper>

			<MenuFooter>
				<Button
					size="small"
					icon={<OrderedListOutlined />}
					style={{ flex: 1 }}
					onClick={() => setAllSurahsOpen(true)}
				>
					All Surahs
				</Button>
			</MenuFooter>
			<AllSurahsModal
				open={allSurahsOpen}
				onClose={() => setAllSurahsOpen(false)}
				projects={projects}
			/>
		</ProjectsMenuWrapper>
	);
};

export default ProjectsMenu;
