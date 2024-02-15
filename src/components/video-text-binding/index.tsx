/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import styled from 'styled-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Popover, Tooltip } from 'antd';
import EditBindingConfiguration from './edit-binding-configuration';
import { ProjectConfig, VideoStatusInfo } from 'types';
import VideoPage from './video-page';
import { useProjectStore } from './use-project-store';
import { YouTubePlayer } from 'react-youtube';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { UploadProjects } from './upload-projects';

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
	gap: 8px;

	.ant-btn {
		font-size: 24px;
		height: 50px;
	}
`;

const ProjectsMenu = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	align-items: stretch;

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
	const [settingsDrawerVisibility, toggleSettingsDrawerVisibility] =
		useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [projectConfig, setProjectConfig] = useState<
		ProjectConfig | undefined
	>();
	const [videoStatus, setVideoStatus] = useState<VideoStatusInfo | undefined>();

	const playerRef = useRef<YouTubePlayer | null>(null);

	const { saveProject, loadProjects, projects, downloadAsJson } =
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

	useEffect(() => {
		if (!projectConfig && projects.length > 0) {
			setProjectConfig(projects[0]);
		}
	}, [projects]);

	const playPause = useCallback(() => {
		const currentState =
			playerRef.current?.getPlayerState() as unknown as PlayerStates;
		if (currentState !== PlayerStates.PLAYING) {
			playerRef.current?.playVideo();
		} else if (currentState === PlayerStates.PLAYING) {
			playerRef.current?.pauseVideo();
		}
	}, [playerRef]);

	const seekTo = (t: number) => {
		playerRef.current?.seekTo(t, true);
	};

	const newProject = () => {
		const p = newProjectConfig();
		setProjectConfig(p);
	};

	return (
		<Page>
			<SettingsArea>
				<UploadProjects loadProjects={loadProjects} />
				<Popover
					open={projectMenuVisible}
					onOpenChange={(state) => setProjectMenuVisible(state)}
					content={
						<ProjectsMenu>
							{!viewerMode && (
								<Button
									key={'new-project'}
									size="small"
									type="primary"
									onClick={() => {
										newProject();
										setProjectMenuVisible(false);
									}}
								>
									{'＋ New Project'}
								</Button>
							)}
							{(projects || []).map((p) => (
								<ProjectItem
									key={p.id}
									size="small"
									type="text"
									onClick={() => {
										setProjectConfig(p);
										setProjectMenuVisible(false);
									}}
									className={p.id === projectConfig?.id ? 'active-item' : ''}
								>
									{p.title}
								</ProjectItem>
							))}
						</ProjectsMenu>
					}
				>
					<Button type="text">{'🎞️'}</Button>
				</Popover>

				{!viewerMode && (
					<Tooltip title="Edit" placement="bottom">
						<Button
							type="text"
							onClick={() => toggleSettingsDrawerVisibility(true)}
						>
							{'⚙'}
						</Button>
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
			/>

			{!viewerMode && (
				<EditBindingConfiguration
					open={settingsDrawerVisibility}
					onClose={() => toggleSettingsDrawerVisibility(false)}
					projectConfig={projectConfig}
					setProjectConfig={setProjectConfig}
					currentTime={currentTime}
					saveProject={() => projectConfig && saveProject(projectConfig)}
					downloadAsJson={downloadAsJson}
					hasUnsavedChanges={hasUnsavedChanges}
				/>
			)}
		</Page>
	);
};

export default VideoTextBinding;
