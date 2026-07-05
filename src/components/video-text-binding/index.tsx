/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
import styled from 'styled-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Button, Popover, Tooltip } from 'antd';
import { DownOutlined, EditOutlined } from '@ant-design/icons';
import EditBindingConfiguration from './edit-binding';
import { ProjectConfig, VideoStatusInfo } from 'types';
import VideoPage from './video-page';
import { useProjectStore } from './use-project-store';
import { YouTubePlayer } from 'react-youtube';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { UploadProjects } from './upload-projects';
import { Settings as SettingsBtn } from './buttons/settings-btn';
import { DiceIcon } from './buttons/dice-icon';
import { IconBtnMedium } from './buttons/icon-btn';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ProjectsMenu from './projects-menu';
import { useUserAuth } from 'auth/auth-context';
import { TranslationVisibilityProvider } from 'context/translation-visibility-context';

const Page = styled.div`
	height: 100vh;
	display: flex;
	flex-direction: row;
	overflow: hidden;
`;

const ContentArea = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
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
	align-items: center;

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

const TopBarControls = styled.div`
	z-index: 3;
	position: absolute;
	top: 16px;
	left: 16px;
	display: flex;
	align-items: center;
	gap: 8px;

	@media (min-width: 320px) {
		display: none;
	}

	@media (min-width: 961px) {
		display: flex;
	}
`;

const ProjectTitleDropdown = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	color: #fff;
	font-size: 18px;
	font-weight: 500;
	padding: 6px 12px 6px 14px;
	border-radius: 24px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(0, 0, 0, 0.35);
	backdrop-filter: blur(6px);
	transition: background 0.15s, border-color 0.15s;
	max-width: 320px;
	user-select: none;

	.title-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.chevron {
		font-size: 11px;
		opacity: 0.7;
		flex-shrink: 0;
		transition: opacity 0.15s;
	}

	&:hover {
		background: rgba(0, 0, 0, 0.55);
		border-color: rgba(255, 255, 255, 0.4);
		.chevron {
			opacity: 1;
		}
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

const ProfileMenuWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const StyledAvatar = styled(Avatar)``;

const UserDisplayName = styled.div`
	color: #000;
	font-size: 14px;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const UserEmail = styled.div`
	color: #707070;
	font-size: 12px;
`;

interface Props {
	viewerMode?: boolean;
}

const VideoTextBinding = ({ viewerMode = false }: Props) => {
	const [projectMenuVisible, setProjectMenuVisible] = useState(false);
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

	const { user } = useUserAuth();
	const pidAppliedRef = useRef<string | undefined>(undefined);

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

	const pickRandomProject = () => {
		if (!projects.length) return;
		const otherProjects = projects.filter((p) => p !== projectConfig);
		const pool = otherProjects.length ? otherProjects : projects;
		const randomIndex = ~~(Math.random() * pool.length);
		onClickProjectItem(pool[randomIndex]);
	};

	const copyToClipboard = async () => {
		const jsonStr = JSON.stringify({ projects });
		return navigator?.clipboard?.writeText(jsonStr);
	};

	useEffect(() => {
		if (pid && projects.length > 0 && pidAppliedRef.current !== pid) {
			const projectInStore = projects.find((p) => p?.videoUrl === pid);
			if (projectInStore) {
				pidAppliedRef.current = pid;
				setProjectConfig(projectInStore);
				setVideoStatus(undefined);
				setCurrentTime(0);
				setProjectMenuVisible(false);
				if (!viewerMode) setSettingsDrawerVisibility(true);
			}
		}
	}, [pid, projects, viewerMode]);

	useEffect(() => {
		if (
			projects.length > 0 &&
			((viewerMode && !pid) || (!viewerMode && !projectConfig && !pid))
		) {
			const randomIndex = ~~(Math.random() * projects.length);
			onClickProjectItem(projects[randomIndex]);
		}
	}, [projects, viewerMode]);

	return (
		<TranslationVisibilityProvider>
			<Page>
				<ContentArea>
					<TopBarControls>
						<Popover
							open={projectMenuVisible}
							onOpenChange={(state) => setProjectMenuVisible(state)}
							trigger={['click']}
							placement="bottomLeft"
							arrow={false}
							content={
								<ProjectsMenu
									projects={projects}
									projectConfig={projectConfig}
									viewerMode={viewerMode}
									newProject={newProject}
									onClickProjectItem={onClickProjectItem}
									open={projectMenuVisible}
								/>
							}
						>
							<ProjectTitleDropdown>
								<span className="title-text">
									{projectConfig?.title || '—untitled—'}
								</span>
								<DownOutlined className="chevron" />
							</ProjectTitleDropdown>
						</Popover>
						{viewerMode && (
							<Tooltip title="Pick random" placement="bottom">
								<IconBtnMedium
									type="text"
									icon={<DiceIcon />}
									onClick={pickRandomProject}
								/>
							</Tooltip>
						)}
					</TopBarControls>

					<SettingsArea>
						{!viewerMode && <UploadProjects loadProjects={loadProjects} />}

						{!viewerMode && (
							<Tooltip title="Edit" placement="bottom">
								<SettingsBtn
									onClick={() => setSettingsDrawerVisibility(true)}
								/>
							</Tooltip>
						)}

						{viewerMode && user && projectConfig && (
							<Tooltip title="Edit project" placement="bottom">
								<IconBtnMedium
									type="text"
									icon={<EditOutlined />}
									onClick={() =>
										navigate(
											`/verse-binding/${encodeURIComponent(
												projectConfig.videoUrl
											)}`
										)
									}
								/>
							</Tooltip>
						)}

						{user && (
							<Popover
								trigger={'hover'}
								content={
									<ProfileMenuWrapper>
										<UserDisplayName>
											<Avatar
												src={
													user?.photoURL ? (
														<img
															src={user?.photoURL}
															referrerPolicy="no-referrer"
														/>
													) : undefined
												}
											>
												{user?.displayName?.[0]?.toUpperCase()}
											</Avatar>
											{user?.displayName}
										</UserDisplayName>
										<UserEmail>{user?.email}</UserEmail>
										<Button
											type="primary"
											size="small"
											onClick={() => navigate('/logout')}
										>
											Logout
										</Button>
									</ProfileMenuWrapper>
								}
							>
								<StyledAvatar
									src={
										user?.photoURL ? (
											<img src={user?.photoURL} referrerPolicy="no-referrer" />
										) : undefined
									}
								>
									{user?.displayName?.[0]?.toUpperCase()}
								</StyledAvatar>
							</Popover>
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
				</ContentArea>
				{!viewerMode && (
					<EditBindingConfiguration
						open={settingsDrawerVisibility}
						onClose={() => setSettingsDrawerVisibility(false)}
						projectConfig={projectConfig}
						setProjectConfig={setProjectConfig}
						currentTime={currentTime}
						videoDuration={videoStatus?.duration}
						saveProject={async () => {
							if (projectConfig) {
								return saveProject({
									...projectConfig,
									duration: videoStatus?.duration,
								});
							}
						}}
						deleteProject={async () => {
							if (projectConfig) await deleteProject(projectConfig);
						}}
						downloadAsJson={downloadAsJson}
						hasUnsavedChanges={hasUnsavedChanges}
						// eslint-disable-next-line @typescript-eslint/no-misused-promises
						copyToClipboard={copyToClipboard}
						projects={projects}
						seekTo={seekTo}
					/>
				)}
			</Page>
		</TranslationVisibilityProvider>
	);
};

export default VideoTextBinding;
