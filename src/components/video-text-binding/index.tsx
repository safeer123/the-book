/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import styled from 'styled-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Popover, Tooltip, Input } from 'antd';
import EditBindingConfiguration from './edit-binding-configuration';
import { ProjectConfig, VideoStatusInfo } from 'types';
import VideoPage from './video-page';
import { useProjectStore } from './use-project-store';
import { YouTubePlayer } from 'react-youtube';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { UploadProjects } from './upload-projects';
import { ProjectList as ProjectListBtn } from './buttons/projects-list-btn';
import { Settings as SettingsBtn } from './buttons/settings-btn';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const { Search } = Input;

const Page = styled.div`
	height: 100vh;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const SettingsArea = styled.div`
	position: absolute;
	right: 16px;
	top: 16px;
	z-index: 2;
	font-size: 24px;
	cursor: pointer;
	padding: 16px;
	display: flex;
	gap: 16px;

	.ant-btn {
		font-size: 24px;
		height: 50px;
	}

	@media (min-width: 320px) {
		top: 30px;
		right: 0px;
	}

	@media (min-width: 961px) {
		top: 16px;
		right: 16px;
	}
`;

const ProjectsMenu = styled.div`
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
	align-items: stretch;
	max-height: 400px;
	overflow-y: auto;
	overflow-x: hidden;

	.active-item {
		background-color: #d8e1fc;
	}
`;

const ProjectItem = styled(Button)`
	width: 100%;
	padding: 4px;
	text-align: left;

	background-color: #fff;
	cursor: pointer;

	&:hover {
		background-color: #f0f0f0;
	}
`;

const newProjectConfig = (): ProjectConfig => {
	return {
		id: `new-project-${new Date().toTimeString()}`,
		title: '',
		videoUrl: '',
		bindingConfig: [{ k: '1:1', t: 0, id: 1 }],
	};
};

interface Props {
	viewerMode?: boolean;
}

const VideoTextBinding = ({ viewerMode = false }: Props) => {
	const [projectMenuVisible, setProjectMenuVisible] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [settingsDrawerVisibility, setSettingsDrawerVisibility] =
		useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [projectConfig, setProjectConfig] = useState<
		ProjectConfig | undefined
	>();
	const [videoStatus, setVideoStatus] = useState<VideoStatusInfo | undefined>();
	const [searchParams] = useSearchParams();

	const playerRef = useRef<YouTubePlayer | null>(null);

	const navigate = useNavigate();
	const { pid } = useParams();

	const { saveProject, deleteProject, loadProjects, projects, downloadAsJson } =
		useProjectStore({
			setProjectConfig,
			viewerMode,
		});

	const hasUnsavedChanges = useMemo(() => {
		const currentProjectInStore = projects.find(
			(p) => projectConfig?.id && p?.id === projectConfig?.id
		);
		return projectConfig !== currentProjectInStore;
	}, [projectConfig, projects]);

	const playPause = useCallback(
		(pause?: boolean) => {
			if (pause) {
				playerRef.current?.pauseVideo();
				return;
			}
			const currentState =
				playerRef.current?.getPlayerState() as unknown as PlayerStates;
			if (currentState !== PlayerStates.PLAYING) {
				playerRef.current?.playVideo();
			} else if (currentState === PlayerStates.PLAYING) {
				playerRef.current?.pauseVideo();
			}
		},
		[playerRef]
	);

	const seekTo = (t: number) => {
		playerRef.current?.seekTo(t, true);
	};

	const newProject = () => {
		const p = newProjectConfig();
		setVideoStatus(undefined);
		setProjectConfig(p);
		setCurrentTime(0);
		setProjectMenuVisible(false);
		setSettingsDrawerVisibility(true);
	};

	const onClickProjectItem = (p: ProjectConfig) => {
		if (p === projectConfig) return;

		const searchString = searchParams.toString();
		if (viewerMode) {
			navigate(
				`/qbind/${encodeURIComponent(p.videoUrl)}${
					searchString ? `?${searchString}` : ''
				}`
			);
		} else {
			setProjectConfig(p);
			setVideoStatus(undefined);
			setCurrentTime(0);
			setProjectMenuVisible(false);
		}
	};

	const copyToClipboard = async () => {
		const jsonStr = JSON.stringify({ projects });
		return navigator?.clipboard?.writeText(jsonStr);
	};

	useEffect(() => {
		if (pid && projects.length > 0) {
			const projectInStore = projects.find((p) => p?.videoUrl === pid);
			if (projectInStore) {
				setProjectConfig(projectInStore);
				setVideoStatus(undefined);
				setCurrentTime(0);
				setProjectMenuVisible(false);
			}
		}
	}, [pid, projects]);

	useEffect(() => {
		if (!pid && projects.length > 0) {
			onClickProjectItem(projects[0]);
		}
	}, [projects]);

	const filteredProjects = useMemo(() => {
		return (projects || []).filter((p) =>
			p?.title?.toLowerCase()?.includes(searchInput.toLowerCase())
		);
	}, [projects, searchInput]);

	return (
		<Page>
			<SettingsArea>
				{!viewerMode && <UploadProjects loadProjects={loadProjects} />}
				<Popover
					open={projectMenuVisible}
					onOpenChange={(state) => setProjectMenuVisible(state)}
					trigger={['click']}
					content={
						<ProjectsMenu>
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
											className={
												p.id === projectConfig?.id ? 'active-item' : ''
											}
										>
											{p.title}
										</ProjectItem>
									</Tooltip>
								))}
							</ProjectItemWrapper>
						</ProjectsMenu>
					}
				>
					<ProjectListBtn />
				</Popover>

				{!viewerMode && (
					<Tooltip title="Edit" placement="bottom">
						<SettingsBtn onClick={() => setSettingsDrawerVisibility(true)} />
					</Tooltip>
				)}
			</SettingsArea>

			<VideoPage
				projectConfig={projectConfig}
				currentTime={currentTime}
				setCurrentTime={setCurrentTime}
				setVideoStatus={setVideoStatus}
				videoStatus={videoStatus}
				playerRef={playerRef}
				playPause={playPause}
				seekTo={seekTo}
				viewerMode={viewerMode}
			/>

			{!viewerMode && (
				<EditBindingConfiguration
					open={settingsDrawerVisibility}
					onClose={() => setSettingsDrawerVisibility(false)}
					projectConfig={projectConfig}
					setProjectConfig={setProjectConfig}
					currentTime={currentTime}
					saveProject={() => projectConfig && saveProject(projectConfig)}
					deleteProject={() => projectConfig && deleteProject(projectConfig)}
					downloadAsJson={downloadAsJson}
					hasUnsavedChanges={hasUnsavedChanges}
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					copyToClipboard={copyToClipboard}
				/>
			)}
		</Page>
	);
};

export default VideoTextBinding;
